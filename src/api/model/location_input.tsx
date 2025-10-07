export class LocationInput{
    latitude: number = 0;
    longitude: number = 0;
    routeName?:string='';
    constructor(data: { latitude: number; longitude: number; routeName?: string }) {
        this.latitude = data.latitude;
        this.longitude = data.longitude;
        this.routeName = data.routeName || '';
    }
}