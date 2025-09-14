import { BusCounterInput } from "../model/bus_counter_input";
import { CounterService } from "../service/counter_service"; 
import { BusService } from "../service/bus_service";
export async function updateBusCounter(input: BusCounterInput, pubsub?:any){
    let busService = new BusService();
    var busInfo = await busService.getBusInfo( input.busId);
    if(! busInfo){
        throw new Error("Bus not found");
    }
    let _counterService = new CounterService();
    let lastCounter = await _counterService.getLastCount(input.busId);
    if(lastCounter <  busInfo.maxPassengers){
        if(input.action === "ONBOARD"){
            lastCounter+=1;
        }else if(input.action === "ALIGHT" && lastCounter > 0){
            lastCounter-=1;
        }else{
            throw new Error("Invalid action or no passengers to alight");
        }
    }else{
        throw new Error("Max capacity reached "+lastCounter);
    }
    let res = await _counterService.updateBusCounter(
        input.busId,
        lastCounter,
        input.location
    );

    if(!res){
        throw new Error("Failed to update bus counter");
    }

  await pubsub.publish(
    `busActivityUpdate:${input.busId}`, // event name (string)
    {
        busActivityUpdate: {              // payload must match your subscription field
            busId: input.busId,
            lastSavedLocation: input.location,
            currentLocation: input.location,
            passengerCount: lastCounter,
            congestionLevel: "LOW",
        },
    }
);

    return res;


}