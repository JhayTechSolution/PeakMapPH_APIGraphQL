import { BusCounterInput } from "../model/bus_counter_input";
import { CounterService } from "../service/counter_service"; 
import { BusService } from "../service/bus_service";
export async function getBusLoad(busId: string){
    let busService = new BusService();
    var busInfo = await busService.getBusInfo(busId);
    if(! busInfo){
        throw new Error("Bus not found");
    }
    let _counterService = new CounterService();
    let lastCounter = await _counterService.getLastCount(busId);
    return {
        busId: busId,
        maxPassengers: busInfo.maxPassengers,
        currentPassengers: lastCounter,
        busName: busInfo.busName
    };


}