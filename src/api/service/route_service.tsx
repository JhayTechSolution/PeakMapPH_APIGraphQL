import { Database } from "../../db/dbInstance";
import { RouteModel } from "../../db/model/route";
import { LocationInput } from "../model/location_input";
export class RouteService{
    private db:Database; 
    constructor(){
        this.db = new Database(process.env.DBNAME);
    }
    public async getAllRouteMaps(){
        var query = await this.db.find({  
            selector: {
                scope: RouteModel.scope,
                collection: RouteModel.collection,
                channel: RouteModel.channel,
                deleted: false
            }
        })
        var docs = query.docs;  
        
        return docs.map((doc:any = {}) =>{ 
            var data = doc.location; 
            data.routeName = doc.routeName;
            
            return new LocationInput(data)
        });
    }
}