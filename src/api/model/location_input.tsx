export class LocationInput{
    latitude: number;
    longitude: number;
    routeName?:string='';
    constructor(data: { latitude: number; longitude: number; routeName?: string }) {
        this.latitude = data.latitude;
        this.longitude = data.longitude;
        this.routeName = data.routeName || '';
    }
}