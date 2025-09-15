import { BusActivityInput } from "../model/bus_activity_input"; 
import { BusActivityService } from "../service/bus_activity_service";
import { getCongestionLevel } from "./congestion_level";
import { BusService } from "../service/bus_service";
export async function createBusActivity(input:BusActivityInput, pubsub:any ){
    var busService = new BusService();
    var busInfo = await busService.getBusInfo( input.busId);
    if(! busInfo){
        throw new Error("Bus not found");
    }
    if(input.passengerCount > busInfo.maxPassengers){
        throw new Error("Passenger count exceeds max capacity");
    }
    

    var busActivityService = new BusActivityService();
    var existingBusActivities = await busActivityService.getBusLastActivity(input.busId);
    let haveExistingActivity = existingBusActivities !== null ;

    let activity = await busActivityService.createBusActivity({
        createdBy: 'system',
        busId: input.busId,
        lastSavedLocation:  haveExistingActivity ? existingBusActivities.lastSavedLocation : input.currentLocation,
        currentLocation: input.currentLocation,
        passengerCount: input.passengerCount
    });
    await pubsub.publish(
        `busActivityUpdate:${input.busId}`, // event name (string) 
        {   
            busActivityUpdate: { 
                 busId: input.busId,
                    lastSavedLocation:  haveExistingActivity ? existingBusActivities.lastSavedLocation : input.currentLocation,
                    currentLocation: input.currentLocation,
                    passengerCount: input.passengerCount,
                    congestionLevel: getCongestionLevel(input.passengerCount, busInfo.maxPassengers),
            }
        }
    );    
    return activity;
}
