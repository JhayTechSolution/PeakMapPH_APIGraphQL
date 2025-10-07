
export class TomTomService{
    _tomtomUrl:string ;
    _tomtomKey:string;
    _zoomLevel: number = 7
    constructor(){
        
        this._tomtomUrl = process.env.TOMTOM_FLOWSEGMENT || "";
        this._tomtomKey = process.env.TOMTOM_API_KEY || "";
    }

    async getFlowSegment(latitude: number, longitude: number ): Promise<{
        status?: number,
        statusText?: string,
        currentSpeed: number,
        freeFlowSpeed: number,
        currentTravelTime: number,
        freeFlowTravelTime: number,
        coordinates : [ { latitude: number, longitude: number } ]
    }>{
        var completeUrl = this._tomtomUrl.replace("%1",this._zoomLevel.toString())
        .replace("%2",latitude.toString())
        .replace("%3", longitude.toString())
        .replace("%4", this._tomtomKey);
        console.log("TomTom URL:", completeUrl);

        //call the url with get method 
        return new Promise((resolve,reject)=>{
            let xmlHttp = new XMLHttpRequest();
            xmlHttp.open( "GET", completeUrl);
            xmlHttp.send( null );
            xmlHttp.onload = function() {
                if (xmlHttp.status >= 200 && xmlHttp.status < 300) {
                    const response = JSON.parse(xmlHttp.responseText); 
                 
                    if(response && response.flowSegmentData) {
                        resolve({
                            status: xmlHttp.status,
                            statusText: xmlHttp.statusText,
                            currentSpeed: response.flowSegmentData.currentSpeed,
                            freeFlowSpeed: response.flowSegmentData.freeFlowSpeed,
                            currentTravelTime: response.flowSegmentData.currentTravelTime,
                            freeFlowTravelTime: response.flowSegmentData.freeFlowTravelTime,
                            coordinates: response.flowSegmentData.coordinates.coordinate
                        });
                    }
                } else {
                    reject({
                        status: xmlHttp.status,
                        statusText: xmlHttp.statusText
                    });
                }
            };
            xmlHttp.onerror = function() {
                reject({
                    status: xmlHttp.status,
                    statusText: xmlHttp.statusText
                });
            };
        });
    }



}