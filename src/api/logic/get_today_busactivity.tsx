import { BusActivityService } from "../service/bus_activity_service";
export async function getTodayBusActivity(){
    let busActvity = new BusActivityService();
    return await busActvity.getTodayBusActivity();   
}