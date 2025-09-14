import { LocationInput } from "./location_input";

export class BusCounterInput{
    busId: string;
    location: LocationInput;
    action: 'ONBOARD' | 'ALIGHT'; 
    constructor(data:{
        busId: string;
        location: {latitude:number; longitude:number},
        action: 'ONBOARD' | 'ALIGHT'
    }){
        this.busId = data.busId;
        this.location = new LocationInput(data.location);
        this.action = data.action;
    }
}