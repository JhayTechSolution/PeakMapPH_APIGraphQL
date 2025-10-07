import { CongestionHeatMapService } from "../service/congestion_heatmap_service";

export async function requestHeatMap(){
    let hm = new CongestionHeatMapService();

    return await hm.requestHeatMap();
}