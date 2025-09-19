import { BusCounterInput } from "../model/bus_counter_input";
import { BusActivityInput } from "../model/bus_activity_input";
import { BusService } from "../service/bus_service";
import { getCongestionLevel } from "./congestion_level";
import { RouteService } from "../service/route_service";
import { BusActivityService } from "../service/bus_activity_service";
import { createBusActivity } from "./create_bus_activity";
export async function updateBusCounter(input: BusCounterInput, pubsub?:any){
    let routeService = new RouteService();
    let busActivity = new BusActivityService();
    var nearest = null; 
    let route = await routeService.getRouteInfoBaseOnLocation(input.location);
    if(route){
        nearest = route.routeName;
    }
    let busService = new BusService();
    var busInfo = await busService.getBusInfo( input.busId);
    if(! busInfo){
        throw new Error("Bus not found");
    } 
    let lastCounter = 0 ;
    try{
        var lastActivity = await busActivity.getBusLastActivity(input.busId);
        if(lastActivity){
            lastCounter =  lastActivity.passengerCount; 
        }
    }catch(e){
        // Handle error
    }
    //let _counterService = new CounterService();
    let onboard: boolean = false;
    if(lastCounter <  busInfo.maxPassengers){
        if(input.action === "ONBOARD"){
            lastCounter+=1;
            onboard = true;
        }else if(input.action === "ALIGHT" && lastCounter > 0){
            lastCounter-=1;
        }else{
            throw new Error("Invalid action or no passengers to alight");
        }
    }else{
        if(input.action === "ALIGHT"){
            lastCounter-=1;

        }else{
            throw new Error("Max capacity reached "+lastCounter);
        }
    }
    console.log("Updated passenger count: ", lastCounter);
    let res = await createBusActivity(new BusActivityInput({
        busId: input.busId,
        currentLocation: input.location,
        passengerCount: lastCounter,
        onboarded: onboard, 
    }),  pubsub);
 
    
    if(!res){
        throw new Error("Failed to update bus counter");
    }
    if(!pubsub) return res;
    busActivity.sendStationLoadUpdate(pubsub);
  await pubsub.publish(
    `busActivityUpdate:${input.busId}`, // event name (string)
    {
        busActivityUpdate: {              // payload must match your subscription field
            busId: input.busId,
            maxPassengers: busInfo.maxPassengers,
            currentPassengers: lastCounter,
            congestionLevel: getCongestionLevel(lastCounter, busInfo.maxPassengers),
            location : {
                latitude: input.location.latitude,
                longitude: input.location.longitude,
                routeName: nearest
            },
            busName: busInfo.busName

        },
    }
);

    return res;


}