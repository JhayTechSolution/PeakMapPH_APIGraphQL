import { CongestionHeatMapService } from "../service/congestion_heatmap_service";

export async function updateHeatmap(latitude: number, longitude: number, currentSpeed: number, pubsub: any) {
    const service = new CongestionHeatMapService();
    return await service.updateHeatMap({latitude, longitude, currentSpeed}, pubsub);
}