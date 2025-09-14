import { BusType } from "../model/bus_type";
import { Database } from "../../db/dbInstance";

export async function getAllBus(){
    const db = new Database(process.env.DBNAME);
    const buses = await db.find({selector: {"scope":"reference", "collection":"buses"}})
    var doc = buses.docs;
 
    return doc.map((bus:any={})=> new BusType(bus));

};
