import type { ReferrenceModel } from './base_model';


export class RouteModel implements ReferrenceModel {
    static scope:string = "reference";
    static collection:string = "routes";
    static channel:string = "peakmap_routes_reference";
    _id: string;
    createdAt: number=Date.now();
    updatedAt?: number;
    deletedAt?: number;
    deleted: boolean;
    location: { latitude: number; longitude: number } = { latitude: 0, longitude: 0 };
    routeName: string = '';
    scope: string = '';
    collection:string = '';
    channel:string = '';

    constructor(data: { id: string;  
        updatedAt?: number; 
        deletedAt?: number; 
        deleted: boolean; 
        location: { latitude: number; longitude: number };
        routeName: string;
     }) {
        this._id = data.id; 
        this.updatedAt = data.updatedAt || 0;
        this.deletedAt = data.deletedAt || 0;
        this.deleted = data.deleted || false;
        this.location = data.location || { latitude: 0, longitude: 0 };
        this.routeName = data.routeName|| '';
        this.scope = RouteModel.scope;
        this.collection = RouteModel.collection;
        this.channel  = RouteModel.channel;
    }
}