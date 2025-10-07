import { PubSub } from "graphql-subscriptions";
import { BusActivityInput } from "./bus_activity_input";
import { createBusActivity } from "../logic/create_bus_activity";
import { BusCounterInput } from "./bus_counter_input";
import { updateBusCounter } from "../logic/update_bus_counter";
import { updateHeatmap } from "../logic/update_heatmap";
export class Mutation{
    _resolvers:any;
    constructor(resolvers:any = {}, private pubsub: PubSub){
        this._resolvers = resolvers;
        this._init();
    }

    get resolvers(){
        return this._resolvers;
    }



    _init(){
        this._resolvers['createBusActivity'] = async (_:any, {input}: {input:BusActivityInput})=>{
            return await createBusActivity(input , this.pubsub);
        };
        this._resolvers['updateBusCounter'] = async (_:any, {input}: {input:any})=>{
            let counterInput = new BusCounterInput(input);

            return await updateBusCounter(counterInput, this.pubsub);
        };
          this._resolvers["reportCurrentCongestion"] = async (_:any, {input}: {input:{latitude:number, longitude:number, currentSpeed:number}})=>{
            return await updateHeatmap( input.latitude, input.longitude, input.currentSpeed, this.pubsub);
        }

    }


}   