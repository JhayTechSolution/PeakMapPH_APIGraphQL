import { FastifyInstance } from "fastify";
import PouchDBCore from "pouchdb";
import expressPouchDB from "express-pouchdb";
import fastifyStatic from "@fastify/static";
 
import path from "path"; 
// Create a PouchDB constructor dedicated to the HTTP server,
// with its own storage prefix so it's not the same LevelDB folder
const ServerPouchDB = PouchDBCore.defaults({
  prefix: path.join(__dirname, "../../serverdb/") // <-- folder for HTTP-exposed DBs
});

function createPouchServer(fastify: FastifyInstance) {
  const pouchApp = expressPouchDB(ServerPouchDB, {
    mode: "fullCouchDB",
    inMemoryConfig: false,
    overrideMode: {
      fauxton: true
    }
  });

  // Mount express-pouchdb inside Fastify
  fastify.use((req, res, next) => {
    console.log("FASTIFY CHECK")
    if (req.url?.startsWith("/fauxton")) return next();
    if (req.url?.startsWith("/graphql")) return next();
    if (req.url?.startsWith("/graphiql")) return next();
    pouchApp(req, res, next);
  });

  // Fauxton UI static files
  fastify.register(fastifyStatic, {
    root: path.join(__dirname, "../fauxton"),
    prefix: "/fauxton/"
  });
}

export { createPouchServer };