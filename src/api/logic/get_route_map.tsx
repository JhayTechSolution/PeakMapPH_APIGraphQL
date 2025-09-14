import { RouteService } from "../service/route_service";
export async function getRouteMap(){
    const service = new RouteService();
    return await service.getAllRouteMaps();
}