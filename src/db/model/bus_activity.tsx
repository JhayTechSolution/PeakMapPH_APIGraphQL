import type { TransactionModel } from "./base_model";

export class BusActivityModel implements TransactionModel{
    public static  readonly scope= 'transaction';
    public static  readonly collection= 'bus_activities'
    public static  readonly channel= 'peakmap_busactivity_transaction'
      _id: string;
      createdAt: number;
      dateStamp: string; //MMddYYYY
      updatedAt?: number;
      deletedAt?: number;
      createdBy: string;
      updatedBy?: string;
      onboarded: boolean; 
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
        onboarded?: boolean;  
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
        this.scope = BusActivityModel.scope;
        this.collection = BusActivityModel.collection;
        this.channel = BusActivityModel.channel;
        const date = new Date(this.createdAt);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        this.dateStamp = `${month}${day}${year}`;
        this.onboarded = data.onboarded || false;
      }


}