 
import { Database } from "../../db/dbInstance";
import { StationModel } from "../../db/model/station";
export class StationService{
    private db: Database ;
    private dbName: any ;
        constructor() {
        this.dbName = process.env.DBNAME || null;
        this.db = new Database(this.dbName);
    }

    async getStations(){
        const selector = {
            selector : {
                scope: StationModel.scope,
                channel:StationModel.channel , 
                collection: StationModel.collection
            }
        };
        console.log(selector)
        var result = await this.db.find(selector);
        return result.docs;
    }
};