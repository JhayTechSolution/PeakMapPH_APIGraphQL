import { Database } from "../../db/dbInstance";
import { BusModel } from "../../db/model/bus";
export class BusService {
    private db: Database;
    private dbName:any 
    constructor() {
        this.dbName = process.env.DBNAME || null;
        this.db = new Database(this.dbName);
    }

    public async getBusInfo(busId: string) {
        try{
            const busInfo:any = await this.db.get(busId);
            if(!busInfo) {
                return null ;
            }
            //map to BusModel
            return new BusModel(busInfo);
        }catch(error){
            console.error("Error fetching bus info:", error);
            return null;
        }
    }

    public async updateBusInfo(busId: string, data: any) {
        const busInfo = await this.db.get(busId);
        if (!busInfo) throw new Error("Bus not found");
        return this.db.update({ ...busInfo, ...data });
    }

    public async deleteBus(busId: string) {
        const busInfo = await this.db.get(busId);
        if (!busInfo) throw new Error("Bus not found");
        return this.db.delete(busId);
    }
}