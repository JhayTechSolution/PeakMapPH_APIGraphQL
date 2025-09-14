import type { ReferrenceModel } from './base_model';


export class BusModel implements ReferrenceModel {
    _id: string;
    createdAt: number=Date.now();
    updatedAt?: number;
    deletedAt?: number;
    deleted: boolean; 
    maxPassengers: number = 0;
    busName:string  ='';
    scope: string = '';
    collection:string = '';
    channel:string = '';

    constructor(data: { id: string;  
        updatedAt?: number; 
        deletedAt?: number; 
        deleted: boolean;  
        maxPassengers: number;
        busName: string;
        
     }) {
        this._id = data.id; 
        this.updatedAt = data.updatedAt || 0;
        this.deletedAt = data.deletedAt || 0;
        this.deleted = data.deleted || false;
        this.maxPassengers = data.maxPassengers || 0;
        this.busName = data.busName || '';
        this.scope = 'reference'
        this.collection = 'buses';
        this.channel  = 'peakmap_buses_reference';
    }
}