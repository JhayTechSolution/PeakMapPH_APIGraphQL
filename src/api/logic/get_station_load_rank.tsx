import { BusActivityService } from "../service/bus_activity_service";

export async function getStationLoadRank(){
    var busActivity = new BusActivityService();
    var stationData = await busActivity.getStationLoadRank();
    console.log("Station Load Data2: ", stationData);
    return stationData;
}