import { channel } from "diagnostics_channel";
import { Database } from "../../db/dbInstance";
import {BusActivityModel} from "../../db/model/bus_activity";
import { create } from "domain";

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
    }) {

        const busActivity = new BusActivityModel({
            id: this.db.generateId(),
            createdBy: data.createdBy,
            deleted: false,
            busId: data.busId,
            lastSavedLocation: data.lastSavedLocation,
            currentLocation: data.currentLocation,
            passengerCount: data.passengerCount
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
         var  use_index = await this.db.createOrGetIndex(["deleted","createdAt"
         ], "deleted-createdAt-index");

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
}