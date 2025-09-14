import type { TransactionModel } from "./base_model";

export class BusActivityModel implements TransactionModel{
      _id: string;
      createdAt: number;
      updatedAt?: number;
      deletedAt?: number;
      createdBy: string;
      updatedBy?: string;
      deletedBy?: string;
      deleted: boolean;
      busId: string;
      lastSavedLocation : { latitude: number; longitude: number; };
      currentLocation : { latitude: number; longitude: number; };
      passengerCount:number ;
      scope:string ;
      collection:string;
      channel: string ;
      constructor(data:{
        id: string ; 
        updatedAt?: number;
        deletedAt?: number;
        createdBy: string;
        updatedBy?: string;
        deletedBy?: string;
        deleted: boolean;
        busId: string;
        lastSavedLocation : { latitude: number; longitude: number; };
        currentLocation : { latitude: number; longitude: number; };
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
        this.lastSavedLocation = data.lastSavedLocation || {latitude:0, longitude:0};
        this.currentLocation = data.currentLocation;
        this.passengerCount = data.passengerCount;
        this.scope = 'transaction';
        this.collection = 'bus_activities';
        this.channel = 'peakmap_busactivity_transaction';
      }


}