import { CongestionHeatMap } from "../../db/model/congestion_heatmap";
import { Database } from "../../db/dbInstance";
import { RouteService } from "./route_service";
import { LocationInput } from "../model/location_input";
import { TomTomService } from "./tom_tom_service";
import { PubSub } from "graphql-subscriptions"

export class CongestionHeatMapService{
    
    _db:Database; 
    _route:RouteService;
    constructor(){
        let dbName:any = process.env.DBNAME ;
        this._db = new Database(dbName);
        this._route = new RouteService();
    }

    private _congestionBySpeed(currentSpeed:number, freeFlowSpeed:number):number{
        if(freeFlowSpeed === 0) return 0;
        return ((1 - (currentSpeed/freeFlowSpeed)) * 100);
    }
    private _trafficLevel(congestion: number): string{
        if(congestion  < 10 ) return "LOW";
        if(congestion >=10 && congestion < 30) return "MEDIUM";
        return "HIGH";

    }
     

    async _getExistingHeatMap(latitude: number , longitude:number , parentLoc: {
        latitude: number,
        longitude: number
    }): Promise<CongestionHeatMap | null>{
        var selector = {
            latitude: { "$eq": latitude },
            longitude: { "$eq": longitude },
            channel: { "$eq": CongestionHeatMap.channel },
            collection: { "$eq": CongestionHeatMap.collection },
            scope: { "$eq": CongestionHeatMap.scope }, 
            deleted: { "$eq": false } 

        };
        var result = await this._db.find({
            selector: selector,
        });
        //result is an array but expected only 1 result because data should be distinct 
        if(result && result.docs.length > 0){
            return new CongestionHeatMap(result.docs[0]);
        } 
        return null;
    }

    async getCurrentHeatMap(): Promise<any[] | null>{
        var indexes = await this._db.createOrGetIndex([
         "channel",
          "collection",
          "scope",
           "parentLocation",
          "deleted",
          "createdAt"
        ], "createdAt_scope_index");
 
        var now=new Date();
        var tsNow = new Date(`${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`).getTime()
        var selector = {
            channel: { "$eq": CongestionHeatMap.channel },
            collection: { "$eq": CongestionHeatMap.collection },
            scope: { "$eq": CongestionHeatMap.scope }, 
            updatedAt: {"$gte": tsNow},
            createdAt: {"$gte":0}
        }
       console.log(selector)
        var result = await this._db.find({
            selector: selector, 
            sort:[
                {
                    "createdAt": "desc"
                }
            ],
            fields: [
                "latitude",
                "longitude",
                "createdAt",
                "currentSpeed",
                "freeFlowSpeed"
            ]
             
        })  
        if(result.docs.length === 0) return null;
        var returnData: any[] =[];
         for(var i=0; i < result.docs.length; i++){
            var doc:CongestionHeatMap = result.docs[i];
            var exists = returnData.filter((item:any)=>{ 
                //item {target, congestion}
                console.log('CHECKING EXISTING ', item)
                return item.target.latitude === doc. latitude && item.target.longitude === doc.longitude;
            }).length > 0;
            if(!exists){
var inputDate = new Date(doc.createdAt)
                var today = new Date();
                var inputToday = (
                    inputDate.getFullYear() === today.getFullYear()
                    && inputDate.getMonth() === today.getMonth()
                    && inputDate.getDate() === today.getDate() 
                )
                if(inputToday){
                    var route = await this._route.getRouteInfoBaseOnLocation({
                        latitude: doc.latitude,
                        longitude: doc.longitude
                    })
                     console.log("ROUTE ", JSON.stringify(route))
                        returnData.push({
                             target:{
                                latitude: doc.latitude,
                                longitude: doc.longitude,
                            },
                            congestion : this._trafficLevel(this._congestionBySpeed(doc.currentSpeed, doc.freeFlowSpeed)),
                            routeName: route?.routeName
                        })
             
                    
                }
            }
            
         }
 
        return returnData;
    }

    async requestHeatMap(){
        var routes =  this._route;
        var routeMaps: any[] = await routes.getAllRouteMaps() ;
        var tomtom = new TomTomService();
        var returnData: any[] = []; // { congestion: CongestionLevel, target: LocationInput, points: [HeatMapPoint] }[] = []; 
        await Promise.all(routeMaps.map(async   (loc:LocationInput) =>{
             var toms = await tomtom.getFlowSegment(loc.latitude, loc.longitude); 
             var congestionData = {
                target: { latitude: loc.latitude, longitude: loc.longitude, routeName: loc.routeName },
                points: [] as any[],
                congestion:"" as string
             };
             if(toms.status== 200){
                var coordinate = toms.coordinates; 
                 await Promise.all(coordinate.map( async ( coord: any  )=>{
                      var exist = await this._getExistingHeatMap(coord.latitude, coord.longitude, { latitude: loc.latitude, longitude: loc.longitude });
                       congestionData.points.push(new LocationInput({
                        latitude: coord.latitude,
                        longitude: coord.longitude, 
                        routeName: ""
                       }));
                      if(exist){
                        exist.freeFlowSpeed = toms.freeFlowSpeed;
                        exist.currentSpeed = toms.currentSpeed;
                        exist.currentTravelTime = toms.currentTravelTime;
                        exist.freeFlowTravelTime = toms.freeFlowTravelTime;
                        exist.updatedAt = Date.now();
                        this._db.update(exist);

                     }else{
                        this._db.add(new CongestionHeatMap({
                            id: this._db.generateId(),
                            createdAt: Date.now(),
                            updatedAt: Date.now(),
                            latitude: coord.latitude,
                            longitude: coord.longitude,
                            currentSpeed: toms.currentSpeed,
                            freeFlowSpeed: toms.freeFlowSpeed,
                            currentTravelTime: toms.currentTravelTime,
                            freeFlowTravelTime: toms.freeFlowTravelTime,
                            parentLocation: { latitude: loc.latitude, longitude: loc.longitude }
                        }))
                     }
                 }));

                congestionData.congestion = this._trafficLevel(this._congestionBySpeed(toms.currentSpeed, toms.freeFlowSpeed));
                returnData.push(congestionData);
             }else{
                console.error("Error getting flow segment for ", loc, toms.statusText);
                throw new Error(`Error getting flow segment for ${loc.latitude}, ${loc.longitude}: ${toms.statusText}`);
             }

        }))
        console.log("SHOULD Return")

        return returnData;
    }



    async updateHeatMap({latitude,longitude, currentSpeed}:{latitude:number, longitude:number, currentSpeed:number}, pubsub:PubSub){
        var routeInfo = await this._route.getRouteInfoBaseOnLocation({latitude, longitude});
        if(!routeInfo) return "No Route Info";
        var now = new Date();
        var tsNow = new Date(`${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`).getTime()
        var selector = {
            latitude: { "$eq": latitude },
            longitude: { "$eq": longitude },
            channel: { "$eq": CongestionHeatMap.channel },
            collection: { "$eq": CongestionHeatMap.collection },
            scope: { "$eq": CongestionHeatMap.scope }, 
            deleted: { "$eq": false },
            createdAt: {"$gte":tsNow}
        } 
        var result = await this._db.find({
            selector: selector,
            sort:[{
                "createdAt":"desc"
            }]
        }); 
      

        var record:any = null; 
      /*  if(result && result.docs.length > 0){
            var res = result.docs[0];
             res.id = res._id 
             
            record  = new CongestionHeatMap(res);
            record.currentSpeed = currentSpeed;
            if(record.freeFlowSpeed < currentSpeed){
                record.freeFlowSpeed = currentSpeed;
            }else{
                if(record.freeFlowSpeed === 0 && currentSpeed === 0){
                    record.freeFlowSpeed = 60;
                }
            }
            
            record.updatedAt = Date.now();
            await this._db.update(record);
        */    
       // }else{
      //      console.log('new record?')
             let freeFlowSpeed  = currentSpeed
             if(result && result.docs.length > 0){
                var res= result.docs[0]
                console.log(res)
                var ex= new CongestionHeatMap(res)
                if(freeFlowSpeed < ex.freeFlowSpeed){
                    freeFlowSpeed = ex.freeFlowSpeed
                }else if(freeFlowSpeed === 0){
                    freeFlowSpeed = 60
                }
             }
             record = new CongestionHeatMap({
                id: this._db.generateId(),
                createdAt: Date.now(),
                updatedAt: Date.now(),
                latitude: latitude,
                longitude: longitude,
                currentSpeed: currentSpeed,
                freeFlowSpeed: freeFlowSpeed,
                currentTravelTime: 0,
                freeFlowTravelTime: 0,
                parentLocation:routeInfo.location
            });
            await this._db.add(record) ;
           
    //    }
        console.log('free flow spped ', currentSpeed , record.freeFlowSpeed)
        pubsub.publish('congestionUpdate', {
            congestionUpdate: {
                level: this._trafficLevel(this._congestionBySpeed(currentSpeed, record.freeFlowSpeed)),
                routeName: routeInfo?.routeName || "",
                latitude: latitude,
                longitude: longitude
            }
        })
        return "OK";
        //notify via websocket
    }

} 