import { RouteService } from "../service/route_service";
export async function getRouteMapByLocation(input: {latitude:number, longitude:number}){
    let routeService = new RouteService();
    let route = await routeService.getRouteInfoBaseOnLocation(input);
    if(! route){
        throw new Error("No route found for the given location");
    }
    return route.routeName;
    
}