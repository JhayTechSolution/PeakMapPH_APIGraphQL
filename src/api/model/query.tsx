import { getAllBus } from "../logic/get_all_bus";
import { getRouteMap } from "../logic/get_route_map";
import { getBusLoad } from "../logic/get_current_load";
import { getBusName } from "../logic/get_bus_name"; 
import { getRouteMapByLocation } from "../logic/get_route_map_by_location";
import { getStationLoadRank } from "../logic/get_station_load_rank";
import { BusActivityService } from "../service/bus_activity_service";
import { PubSub } from "graphql-subscriptions";
import { getAnalyticsData } from "../logic/get_analytics_data";
import { getHeatMap } from "../logic/get_heatmap";
import { getTodayBusActivity } from "../logic/get_today_busactivity";
export class  Query{
    _resolvers:any;
    constructor(resolvers:any = {}, private pubsub: PubSub){
        this._resolvers = resolvers;
        this._init();
    }

    get resolvers(){
        return this._resolvers;
    }



    _init(){
        this._resolvers['getAllBus'] = async ()=>{
            return await getAllBus();
        };
        this._resolvers['getRouteMap'] = async ()=>{
            return await getRouteMap();
        };
        this._resolvers['getCurrentBusCapacityLoad'] = async (_:any, {input}: {input:any})=>{
          
            return await getBusLoad(input);
        };
        this._resolvers['getBusName'] = async (_:any, {input}: {input:any})=>{
          return await getBusName(input);
        };
        this._resolvers['getRouteMapByLocation'] = async (_:any, {input}: {input:{latitude:number, longitude:number}})=>{
          return await getRouteMapByLocation(input);
        }
        this._resolvers['getStationLoadRank'] = async ()=>{
            return await getStationLoadRank();
        }
        this._resolvers["triggerStationUpdate"] = async ()=>{
            const service = new BusActivityService();
            try{
                await service.sendStationLoadUpdate(this.pubsub)
            }catch (error){
                console.error("Error triggering station update:", error);
                return false;
            }
            return true;
        }
        this._resolvers["getAnalytics"] = async (_:any, {input}: {input:{analyticsType:string, timeRange:string}})=>{
            console.log('Triggered getAnalytics with', input);
            return await getAnalyticsData(input.analyticsType as any, input.timeRange as any);
        };

        this._resolvers["getHeatMap"] =  async ()=>{
            console.log('Triggered getHeatMap');
            return await getHeatMap();

        }; 
        this._resolvers["getTodayBusActivity"] = async ()=>{

            return await getTodayBusActivity();
        };
    }



}