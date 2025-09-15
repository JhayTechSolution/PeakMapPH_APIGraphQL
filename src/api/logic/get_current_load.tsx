import { BusCounterInput } from "../model/bus_counter_input";
import { CounterService } from "../service/counter_service"; 
import { BusService } from "../service/bus_service";
import { getCongestionLevel } from "./congestion_level";
import {RouteService} from "../service/route_service";
import { BusActivityService } from "../service/bus_activity_service";
export async function getBusLoad(busId: string){
    var routeService = new RouteService();
    var busActivityService = new BusActivityService(); 
    var latestActivity = await busActivityService.getBusLastActivity(busId); 
    var located = {}
    if(latestActivity){
        let route = await routeService.getRouteInfoBaseOnLocation(latestActivity.currentLocation); 
        if(!route){
            route = await routeService.getRouteInfoBaseOnLocation(latestActivity.lastSavedLocation);
        }
        if(route){
            located = {
                latitude: latestActivity.currentLocation.latitude,
                longitude: latestActivity.currentLocation.longitude,
                routeName: route.routeName
            };
        }

    }
    let busService = new BusService();
    var busInfo = await busService.getBusInfo(busId);
    
    if(! busInfo){
        throw new Error("Bus not found");
    }
    var lastActivity = await busActivityService.getBusLastActivity(busId);
    if(! lastActivity){
        throw new Error("No bus activity found. Please start bus activity first.");
    } 


    let lastCounter = lastActivity.passengerCount;
    return {
        busId: busId,
        maxPassengers: busInfo.maxPassengers,
        currentPassengers: lastCounter,
        busName: busInfo.busName, 
        congestionLevel: getCongestionLevel(lastCounter, busInfo.maxPassengers) ,
        location: located
    };


}