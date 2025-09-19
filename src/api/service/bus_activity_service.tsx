import { Database } from "../../db/dbInstance";
import {BusActivityModel} from "../../db/model/bus_activity";
import { PubSub } from "graphql-subscriptions";
import { RouteService } from "./route_service";
import { RouteModel } from "../../db/model/route";
import { pubsub } from "../../resolvers";
export class BusActivityService {
    private db: Database;
    
    constructor() {
        this.db = new Database(process.env.DBNAME);
    }

    async createBusActivity(data: {
        createdBy: string;
        busId: string;
        lastSavedLocation: { latitude: number; longitude: number; };
        currentLocation: { latitude: number; longitude: number; };
        passengerCount: number;
        onboarded?: boolean;
    }) {

        const busActivity = new BusActivityModel({
            id: this.db.generateId(),
            createdBy: data.createdBy,
            deleted: false,
            busId: data.busId,
            lastSavedLocation: data.lastSavedLocation,
            currentLocation: data.currentLocation,
            passengerCount: data.passengerCount,
            onboarded: data.onboarded || false
        });
        
        try {
            await this.db.add(busActivity);
        } catch (error) {
            console.error("Error creating bus activity:", error);
            throw new Error("Failed to create bus activity");
        }
        return busActivity._id;
    }

    async getBusLastActivity(busId: string) {
        console.log("BUSID ",busId)
        try {
         var  use_index = await this.db.createOrGetIndex(["createdAt"
         ], "createdAt-index");

            console.log('Using index:', use_index);
            const activities = await this.db.find({
                selector: {
                    busId: busId,
                    deleted: false,
                    scope:  BusActivityModel.scope,
                    collection: BusActivityModel.collection,
                    channel: BusActivityModel.channel, 
                    createdAt: { "$gte": 0 },
                },
                sort: [{ createdAt: 'desc' }]
                
            }); 
            let busActivities = activities.docs.map((activity: any) => new BusActivityModel(activity));
            if (busActivities.length === 0) {
                return null;
            }
            return busActivities[0];
        } catch (error) {
            console.error("Error fetching bus activities:", error);
            throw new Error("Failed to fetch bus activities");
        }
    }
    async getStationLoadRank() {
        var routeService = new RouteService();
        let date = new Date();
        let month = String(date.getMonth() + 1).padStart(2, '0');
        let day = String(date.getDate()).padStart(2, '0');
        let year = String(date.getFullYear());
        let today = month + day + year;

        var selector = {
            "selector":{
                onboarded: true,
                dateStamp: today,
                deleted: false,
                scope:  BusActivityModel.scope,
                collection: BusActivityModel.collection,
                channel: BusActivityModel.channel
            },
            "fields": ["dateStamp", "onboarded", "currentLocation"]
        };
        let query = await this.db.find(selector);
        var stationData: { stationName: string; passengerCount: number; }[] = [];
        if(query.docs.length > 0){
            await Promise.all(query.docs.map(async (doc:any)=>{ 
                let location = doc.currentLocation;
                console.log('LOCATION ',doc);
                if(!location) return;
                let route:RouteModel | null = await  routeService.getRouteInfoBaseOnLocation(location)                 
              
                if(route){
                    console.log("HERE")
                    //find station in stationData 
                    let station = stationData.find(s => s.stationName === route?.routeName);
                    if(station){
                        station.passengerCount += 1;
                    }else{
                        stationData.push({stationName: route.routeName, passengerCount: 1});
                    }
                    console.log(stationData);
                }

            }));

            //sort the stationData by passengerCount desc
          stationData.sort((a, b) => b.passengerCount - a.passengerCount);
            console.log("Station Load Data: ", stationData);
            
        }
        return stationData;
    }
    async sendStationLoadUpdate(pubsub: PubSub){
        //MMddYYYY today 
        let stationData = await this.getStationLoadRank();
        if(stationData.length > 0){
            console.log("Station Load Data: ", stationData);
         
            await pubsub.publish(
                `stationLoadUpdate`, // event name (string)
                stationData
            );
        }
    }
}