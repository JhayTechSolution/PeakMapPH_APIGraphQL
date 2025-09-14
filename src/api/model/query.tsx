import { getAllBus } from "../logic/get_all_bus";
import { getRouteMap } from "../logic/get_route_map";
import { getBusLoad } from "../logic/get_current_load";
import { getBusName } from "../logic/get_bus_name"; 
export class  Query{
    _resolvers:any;
    constructor(resolvers:any = {}){
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
    }


}