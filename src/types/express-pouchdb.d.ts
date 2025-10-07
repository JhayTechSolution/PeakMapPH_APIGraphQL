// src/types/express-pouchdb.d.ts
declare module "express-pouchdb" {
  import { Application } from "express";

  function expressPouchDB(pouchDB: any, opts?: any): Application;

  export default expressPouchDB;
}
