// src/db/dbInstance.ts
import PouchDBCore from "pouchdb";
import PouchDBFind from "pouchdb-find";
import cryptoPouch from "crypto-pouch";
import crypto from "crypto";
import path from "path";

const PouchDB = PouchDBCore.plugin(PouchDBFind).plugin(cryptoPouch);



export class Database {
  private static instance: Database | null = null;
  private db: PouchDB.Database;
  private remote: PouchDB.Database | null = null;

  constructor(dbName = null) {
    if(dbName ==  null){
      console.log('default db should not be used, check your .env file');
        return 
    }
    const config = {
        COUCHDB_HOST: process.env.COUCHDB_HOST || "http://localhost:3000", // adjust to your Fastify port
        COUCHDB_USER: process.env.COUCHDB_USER || "",
        COUCHDB_PASSWORD: process.env.COUCHDB_PASSWORD || "",
        CRYPTO_SECRET: process.env.CRYPTO_SECRET || "",
    }; 
    if (Database.instance) {
      return Database.instance;
    }

    // Local DB in a different folder
    const localPath = path.join(__dirname, "../../localdb/", dbName);
    this.db = new PouchDB(localPath);
 
    this.remote = new PouchDB(`${config.COUCHDB_HOST}/${dbName}`, {
      auth:
        config.COUCHDB_USER && config.COUCHDB_PASSWORD
          ? {
              username: config.COUCHDB_USER,
              password: config.COUCHDB_PASSWORD
            }
          : undefined
    });  
    if (config.CRYPTO_SECRET) {
      // @ts-ignore crypto-pouch monkey-patches
      this.db.crypto(config.CRYPTO_SECRET);
    }

    if (this.remote) {
      this.startReplication();
    }

    Database.instance = this;
  }

  private startReplication() {
    if (!this.remote) return;

    this.db
      .sync(this.remote, { live: true, retry: true })
      .on("change", info => console.log("[Replication change]", info))
      .on("paused", err =>
        err
          ? console.error("[Replication paused with error]", err)
          : console.log("[Replication paused: idle, up-to-date]")
      )
      .on("active", () => console.log("[Replication active]"))
      .on("denied", err => console.error("[Replication denied]", err))
      .on("complete", info => console.log("[Replication complete]", info))
      .on("error", err => console.error("[Replication error]", err));
  }

  async add(doc: any = {}) {
    if (!doc._id) doc._id = this.generateId();
    return this.db.put(doc);
  }

  async update(doc: any = {}) {
    if (!doc._id) throw new Error("Document must have an _id");
    const existing = await this.db.get(doc._id);
    return this.db.put({ ...existing, ...doc });
  }

  async delete(id: string) {
    const doc = await this.db.get(id);
    if (!doc) throw new Error("Document not found");
    return this.db.remove(doc);
  }
  async deleteMany(docs: any[]) {
    const results = await Promise.all(
      docs.map(doc => this.delete(doc._id))
    );
    return results;
  }

  async getAll(): Promise<any[]> {
  
    const result = await this.db.allDocs({ include_docs: true });

    return result.rows.map((row: any) => row.doc);
  }

  async createIndex(index: PouchDB.Find.IndexDefinition): Promise<PouchDB.Find.CreateIndexResponse> {
    return this.db.createIndex(index);
  }

  async find(query: PouchDB.Find.FindRequest<any>): Promise<PouchDB.Find.FindResponse<any>> {
   
    query.selector['_deleted'] = { $ne: true };
    return this.db.find(query);
  }

  async get(id: string) {
    return this.db.get(id);
  }

  private generateId(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  async createOrGetIndex(fields: string[], name?:string){
     var indexes = await this.db.getIndexes();
     //combind fields to name 
     var ddoc = fields.join('_');
     if(!name){
       name = `idx-${ddoc}`;
     }

     var existing = indexes.indexes.find((idx: any)=>{
       return idx.ddoc === ddoc && idx.name === name;
     })
     //returns ddoc and name 
      if(!existing){
        await this.db.createIndex({ index: { fields }, ddoc, name });
      }
      return [ddoc, name];

  }
  async getIndexes(){
    return await this.db.getIndexes();
  }
}