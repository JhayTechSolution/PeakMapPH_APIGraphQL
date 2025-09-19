import { PubSub } from "graphql-subscriptions";
export class Subscription{
    
    _resolvers:any;
    constructor(resolvers:any = {}, private pubsub:PubSub){
        this._resolvers = resolvers;
        this._init();
    }

    get resolvers(){
        return this._resolvers;
    }



    _init(){
        this._resolvers["busActivityUpdate"] = {
            subscribe:  (_:any, {input}: {input:string})=>{
                console.log('Subscription to busActivityUpdate for input:', input);
                return this.pubsub.asyncIterableIterator('busActivityUpdate:' + input);
            }
        };
        this._resolvers["busActivityUpdateAll"] = {
            subscribe:  (_:any)=>{
                console.log('Subscription to busActivityUpdateAll');
                return this.pubsub.asyncIterableIterator('busActivityUpdate');
            }
        };
        this._resolvers["stationLoadUpdate"] = {
            subscribe:  (_:any)=>{
                console.log('Subscription to stationLoadUpdate');
                return this.pubsub.asyncIterableIterator('stationLoadUpdate');
            }
        };
    }


}