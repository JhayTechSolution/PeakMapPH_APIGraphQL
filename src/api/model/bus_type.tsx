export class BusType{
    id:string;
    maxPassengers:number;
    busName:string;
    constructor(data:{
        _id:string;
        maxPassengers:number;
        busName:string;
    }){
        this.id = data._id ;
        this.maxPassengers= data.maxPassengers;
        this.busName= data.busName;
    }

};