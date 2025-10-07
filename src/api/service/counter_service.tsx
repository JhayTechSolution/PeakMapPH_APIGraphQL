import { Database } from "../../db/dbInstance"; 
import { BusCounterModel } from "../../db/model/bus_counter";
import { LocationInput } from "../model/location_input";
import { BusService } from "./bus_service";
export class CounterService{
    private db:Database; 
    private dbName:any 
    constructor(){
        this.dbName = process.env.DBNAME || null;
        this.db = new Database(this.dbName);
    }
    public async updateBusCounter(busId: string, passengerCount: number, location:LocationInput){
        let busService = new BusService();
        var busInfo = await busService.getBusInfo(busId);
        if (!busInfo) {
            throw new Error("Bus not found2 "+busId);
        }
        let busCounterModel = new BusCounterModel({
            id: this.db.generateId(), 
            createdBy:'system',
            location: location ,
            passengerCount: passengerCount,
            busId: busId ,
            deleted: false 
        });
        try{
            await this.db.add(busCounterModel);
            return busCounterModel._id;
        }catch (error){
            console.error("Error creating bus counter:", error);
            return null; 
        }
    }

    public async getLastCount(busId:string){
        var  use_index:any  = await this.db.createOrGetIndex(["createdAt"], "createdAt-index");
         var query = await this.db.find({
            selector: {
                scope: BusCounterModel.scope,
                collection: BusCounterModel.collection,
                channel: BusCounterModel.channel,
                busId: busId,
                createdAt : { "$gte": 0}
            },
           
            sort: [{ createdAt: 'desc' }],
            limit: 1,
            use_index:  use_index
        });
        console.log("Query result:", query);
        if (query.docs.length > 0) {
            return query.docs[0].passengerCount;
        }
        return 0;
    }

}