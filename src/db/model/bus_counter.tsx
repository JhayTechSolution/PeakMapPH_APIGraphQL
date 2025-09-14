import type { TransactionModel } from "./base_model";

export class BusCounterModel implements TransactionModel{

    static scope:string = "transaction";
    static collection:string = "bus_counters";
    static channel:string = "peakmap_bus_counter_transaction";
      _id: string;
      createdAt: number;
      updatedAt?: number;
      deletedAt?: number;
      createdBy: string;
      updatedBy?: string;
      deletedBy?: string;
      deleted: boolean;
      busId: string;
      location : { latitude: number; longitude: number; };
      passengerCount:number ;
      scope:string ;
      collection:string;
      channel: string ;
      constructor(data:{
        id: string ; 
        updatedAt?: number ;
        deletedAt?: number;
        createdBy: string;
        updatedBy?: string;
        deletedBy?: string;
        deleted: boolean;
        busId: string;
        location : { latitude: number; longitude: number; };
        passengerCount:number ;
      }){
        this._id = data.id;
        this.createdAt = Date.now();
        this.updatedAt = data.updatedAt || 0;
        this.deletedAt = data.deletedAt || 0;
        this.createdBy = data.createdBy;
        this.updatedBy = data.updatedBy || "";
        this.deletedBy = data.deletedBy || "";
        this.deleted = data.deleted;
        this.busId = data.busId;
        this.location = data.location;
        this.passengerCount = data.passengerCount;
        this.scope = BusCounterModel.scope;
        this.collection = BusCounterModel.collection;
        this.channel = BusCounterModel.channel;
      }


}