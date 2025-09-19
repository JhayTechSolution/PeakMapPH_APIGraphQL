import { LocationInput } from "./location_input";
export class BusActivityInput{
    busId: string;   
    currentLocation: LocationInput;
    passengerCount: number;
    onboarded?: boolean;
    constructor(data:{
        busId: string; 
        currentLocation:{latitude:number; longitude:number},
        passengerCount:number,
        onboarded?: boolean
    }){
        this.busId = data.busId; 
        this.currentLocation = new LocationInput(data.currentLocation);
        this.passengerCount = data.passengerCount;
        this.onboarded = data.onboarded || false;
    }

}
 