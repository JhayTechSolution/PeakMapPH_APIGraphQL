import { BusActivityInput } from "../model/bus_activity_input";
import { BusActivityModel } from "../../db/model/bus_activity";
import { Database } from "../../db/dbInstance";
export async function createBusActivity(input:BusActivityInput, pubsub:any ){
    console.log(process.env.DBNAME)
    var db = new Database(process.env.DBNAME);
    var busActivity = new BusActivityModel({
         id: db.generateId() , 
         createdBy: 'system',
         deleted:false,
         busId: input.busId,
         lastSavedLocation: {latitude:0, longitude:0},
         currentLocation: input.currentLocation,
         passengerCount: input.passengerCount
    }) 
    try{
        await db.add(JSON.parse(JSON.stringify(busActivity)));
        await pubsub.publish(
            `busActivityUpdate`, // event name (string) 
            {
                busActivityUpdateAll: { 
                     busId: busActivity.busId,
                     currentLocation: busActivity.currentLocation,
                     passengerCount: busActivity.passengerCount,
                     congestionLevel:"LIGHT"
                }
            }
        );
        return busActivity._id;
    }catch (error){
        console.error("Error creating bus activity:", error);
        throw new Error("Failed to create bus activity");
    }
}