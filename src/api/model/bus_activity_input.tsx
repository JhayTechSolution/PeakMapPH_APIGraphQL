import { LocationInput } from "./location_input";
export class BusActivityInput{
    busId: string;   
    currentLocation: LocationInput;
    passengerCount: number;
    constructor(data:{
        busId: string; 
        currentLocation:{latitude:number; longitude:number},
        passengerCount:number
    }){
        this.busId = data.busId; 
        this.currentLocation = new LocationInput(data.currentLocation);
        this.passengerCount = data.passengerCount;
    }

}
 