import type { ReferrenceModel } from './base_model';


export class StationModel implements ReferrenceModel {

    static scope:string  = 'reference'; 
    static collection:string = 'stations';
    static channel:string  = 'peakmap_station_reference';
    _id: string;
    createdAt: number=Date.now();
    updatedAt?: number;
    deletedAt?: number;
    deleted: boolean;
    location: { latitude: number; longitude: number } = { latitude: 0, longitude: 0 };
    stationName: string = '';
    scope: string = '';
    collection:string = '';
    channel:string = '';

    constructor(data: { id: string;  
        updatedAt?: number; 
        deletedAt?: number; 
        deleted: boolean; 
        location: { latitude: number; longitude: number };
        stationName: string;
     }) {
        this._id = data.id; 
        this.updatedAt = data.updatedAt || 0;
        this.deletedAt = data.deletedAt || 0;
        this.deleted = data.deleted || false;
        this.location = data.location || { latitude: 0, longitude: 0 };
        this.stationName = data.stationName || '';
        this.scope = StationModel.scope
        this.collection = StationModel.collection;
        this.channel  = StationModel.channel;
    }

    static create(){
        return new StationModel({
            id: "",
            deleted:false ,
            location:{
                latitude: 0,
                longitude: 0
            },
            stationName:""
        });
    }
}