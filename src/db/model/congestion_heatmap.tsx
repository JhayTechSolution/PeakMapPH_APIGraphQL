import { ReferrenceModel } from "../../db/model/base_model";

export class CongestionHeatMap implements ReferrenceModel{
    public static scope:string = "reference";
    public static collection:string = "heatmap";
    public static channel:string = "peakmap_heatmap_reference";
    _id: string;
    createdAt: number;
    updatedAt: number;
    latitude: number
    longitude: number
    currentSpeed: number
    freeFlowSpeed: number
    currentTravelTime: number
    freeFlowTravelTime: number
    deleted: boolean = false;
    scope: string;
    collection:string;
    channel:string;
    parentLocation: { latitude: number, longitude: number } 
    constructor(data:{
        id: string ,
        createdAt: number,
        updatedAt: number,
        latitude: number,
        longitude: number,
        currentSpeed: number,
        freeFlowSpeed: number,
        currentTravelTime: number,
        freeFlowTravelTime: number,
        parentLocation: { latitude: number, longitude: number }

    })   {
        this._id = data.id;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
        this.latitude = data.latitude;
        this.longitude = data.longitude;
        this.currentSpeed = data.currentSpeed;
        this.freeFlowSpeed = data.freeFlowSpeed;
        this.currentTravelTime = data.currentTravelTime;
        this.freeFlowTravelTime = data.freeFlowTravelTime;
        this.scope = CongestionHeatMap.scope;
        this.collection = CongestionHeatMap.collection;
        this.channel = CongestionHeatMap.channel;
        this.parentLocation = data.parentLocation;
    }
}
