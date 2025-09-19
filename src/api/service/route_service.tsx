import { Database } from "../../db/dbInstance";
import { RouteModel } from "../../db/model/route";
import { LocationInput } from "../model/location_input";
export class RouteService{
    private db:Database; 
    constructor(){
        this.db = new Database(process.env.DBNAME);
    }

    private haversine(lat1:number, lon1:number, lat2:number, lon2:number) { 
        const toRad = (deg:any)=> (deg * Math.PI / 180);
        const R = 6371; 
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat/2) ** 2+ 
                Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
                Math.sin(dLon/2) ** 2;
        const c = 2* Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
        return  R*c;

    }


    public async getRouteInfoBaseOnLocation(input: {latitude:number, longitude:number}): Promise<RouteModel | null>{
        let index = await this.db.createOrGetIndex(["location.latitude","location.longitude","createdAt"], "location_created_index")
        var exact  = await this.db.find({ 
            selector: {
                scope: RouteModel.scope,
                collection: RouteModel.collection,
                channel: RouteModel.channel,
                deleted: false,
                location: {
                    latitude:  input.latitude,
                    longitude: input.longitude
                }
            }
          
        })
        if(exact.docs.length > 0 ){
            return new RouteModel(exact.docs[0]);
        }
        var all = await this.db.find({
            selector: {
                scope: RouteModel.scope,
                collection: RouteModel.collection,
                channel: RouteModel.channel,
                deleted: false
            }
        })
        var docs = all.docs;
        if(docs.length === 0 ) return null;
        var nearest = docs.reduce((closest:any, current:any) =>{ 
           var dist = this.haversine(input.latitude, input.longitude, current.location.latitude, current.location.longitude); 
           return !closest || dist < closest.dist ? {current ,dist} : closest ;
        }, null);
        console.log("Nearest route found:", nearest);
        return new RouteModel(nearest.current);

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