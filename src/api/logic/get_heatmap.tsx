import { CongestionHeatMapService } from "../service/congestion_heatmap_service";

export async function getHeatMap(){
    let hm = new CongestionHeatMapService(); 
    return  await hm.getCurrentHeatMap();

}