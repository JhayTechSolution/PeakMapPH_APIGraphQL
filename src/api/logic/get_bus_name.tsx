import { BusService } from "../service/bus_service"; 

export async function getBusName(busId:string){
    let busService = new BusService();
    var bus = await busService.getBusInfo(busId);
    if(bus){
        return bus.busName
    }
    throw new Error("Bus not found");
}