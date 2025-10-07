import { BusType } from "../model/bus_type";
import { Database } from "../../db/dbInstance";

export async function getAllBus(){
    let dbName:any = process.env.DBNAME || null;
    const db = new Database(dbName);
    const buses = await db.find({selector: {"scope":"reference", "collection":"buses"}})
    var doc = buses.docs;
 
    return doc.map((bus:any={})=> new BusType(bus));

};
