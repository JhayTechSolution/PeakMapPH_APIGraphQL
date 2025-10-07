import { Database } from "../../db/dbInstance";
import { BusActivityModel } from "../../db/model/bus_activity";
import { PubSub } from "graphql-subscriptions";
import { RouteService } from "./route_service";
import { RouteModel } from "../../db/model/route";
import { pubsub } from "../../resolvers";
import { getCongestionLevel } from "../logic/congestion_level";
import { BusService } from "./bus_service";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat.js";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import isoWeek from "dayjs/plugin/isoWeek.js";
import weekOfYear from "dayjs/plugin/weekOfYear.js";

dayjs.extend(advancedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);

export enum AnalyticsType {
    RidersTrend = "RidersTrend",
    PeakHours = "PeakHours",
    Bottleneck = "Bottleneck"
}

export enum TimeRange {
    Daily = "Daily",
    Weekly = "Weekly",
    Monthly = "Monthly"
}

export class BusActivityService {
    private db: Database;
    private dbName:any 
    constructor() {
        this.dbName = process.env.DBNAME || null;        
        this.db = new Database(this.dbName);
    }

    async createBusActivity(data: {
        createdBy: string;
        busId: string;
        lastSavedLocation: { latitude: number; longitude: number; };
        currentLocation: { latitude: number; longitude: number; };
        passengerCount: number;
        onboarded?: boolean;
    }) {

        const busActivity = new BusActivityModel({
            id: this.db.generateId(),
            createdBy: data.createdBy,
            deleted: false,
            busId: data.busId,
            lastSavedLocation: data.lastSavedLocation,
            currentLocation: data.currentLocation,
            passengerCount: data.passengerCount,
            onboarded: data.onboarded || false
        });

        try {
            await this.db.add(busActivity);
        } catch (error) {
            console.error("Error creating bus activity:", error);
            throw new Error("Failed to create bus activity");
        }
        return busActivity._id;
    }

    async getBusLastActivity(busId: string) {
        try {
            const use_index = await this.db.createOrGetIndex(["createdAt"], "createdAt-index");
            const activities = await this.db.find({
                selector: {
                    busId: busId,
                    deleted: false,
                    scope: BusActivityModel.scope,
                    collection: BusActivityModel.collection,
                    channel: BusActivityModel.channel,
                    createdAt: { "$gte": 0 },
                },
                sort: [{ createdAt: 'desc' }]
            });
            let busActivities = activities.docs.map((activity: any) => new BusActivityModel(activity));
            return busActivities.length === 0 ? null : busActivities[0];
        } catch (error) {
            console.error("Error fetching bus activities:", error);
            throw new Error("Failed to fetch bus activities");
        }
    }

    async getStationLoadRank() {
        const routeService = new RouteService();
        const today = dayjs().format("MMDDYYYY");

        const selector = {
            "selector": {
                onboarded: true,
                dateStamp: today,
                deleted: false,
                scope: BusActivityModel.scope,
                collection: BusActivityModel.collection,
                channel: BusActivityModel.channel
            },
            "fields": ["dateStamp", "onboarded", "currentLocation"]
        };

        const query = await this.db.find(selector);
        const stationData: { stationName: string; passengerCount: number; }[] = [];

        if (query.docs.length > 0) {
            await Promise.all(query.docs.map(async (doc: any) => {
                if (!doc.currentLocation) return;
                const route: RouteModel | null = await routeService.getRouteInfoBaseOnLocation(doc.currentLocation);
                if (route) {
                    const station = stationData.find(s => s.stationName === route.routeName);
                    if (station) station.passengerCount += 1;
                    else stationData.push({ stationName: route.routeName, passengerCount: 1 });
                }
            }));
            stationData.sort((a, b) => b.passengerCount - a.passengerCount);
        }

        return stationData;
    }

    async sendStationLoadUpdate(pubsub: PubSub) {
        const stationData = await this.getStationLoadRank();
        if (stationData.length > 0) {
            await pubsub.publish(`stationLoadUpdate`, { stationLoadUpdate: stationData });
        }
    }

    _getRidersTrend(docs: any, range: TimeRange) {
        if (docs.length === 0) return { record: [], value: [], changes: 0 };

        const buckets: Record<string, number> = {};
        docs.forEach((doc: any) => {
            let key: string;
            const dt = dayjs(doc.createdAt);
            if (range === TimeRange.Daily) key = dt.format("YYYY-MM-DD");
            else if (range === TimeRange.Weekly) key = `Week ${dt.isoWeek()}`;
            else key = dt.format("YYYY-MM");

            buckets[key] = (buckets[key] || 0) + doc.passengerCount;
        });

        const now = dayjs();
        let record: string[] = [];
        var daily = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        if (range === TimeRange.Daily) {
            record = Array.from({ length: 7 }, (_, i) => now.subtract(6 - i, 'day').format("YYYY-MM-DD"));
        } else if (range === TimeRange.Weekly) {
            const startWeek = now.subtract(5, 'week').isoWeek();
            record = Array.from({ length: 6 }, (_, i) => `Week ${startWeek + i}`);
        } else {
            record = Array.from({ length: 6 }, (_, i) => now.subtract(5 - i, "month").format("YYYY-MM"));
        }

        const value = record.map(r => buckets[r] || 0);
        const last = value[value.length - 1] || 0;
        const prev = value[value.length - 2] || 0;
        const changes = prev > 0 ? Math.round(((last - prev) / prev) * 100) : 0;
        if(range === TimeRange.Daily){
            // Convert day labels to day names
            record = record.map(dateStr => {
                const date = dayjs(dateStr);
                return daily[date.day()];
            }).filter((v): v is string => v!=undefined);
        }

        if(range === TimeRange.Weekly){
          record = record.map(r=> {
                const parts = r.split('-');
                const dayNum = parts[0]
                return dayNum
            }).filter((v): v is string => v!=undefined);
        }

        if(range === TimeRange.Monthly){
            record = record.map(r=> {
                const parts = r.split('-');
                let part:any = parts[1];
                const monthNum = parseInt(part) || 1;
                const monthName = dayjs().month(monthNum -1).format('MMM');
                return monthName;
            }
            );
        }
        return { record, value, changes };
    }

    _getPeakHours(docs: any, range: TimeRange) {
        
        if (docs.length === 0) return { hours: [], record: [], value: [], percent: [], changes: 0 };

        const dayHourTotals: Record<string, number> = {};
        docs.forEach((doc: any) => {
            const dt = dayjs(doc.createdAt);
            let key: string;

            if (range === TimeRange.Daily) key = dt.format("YYYY-MM-DD-HH");
            else if (range === TimeRange.Weekly) key =   `Week ${dt.isoWeek()}-${dt.day()}-${dt.hour()}`;
            else key = dt.format("YYYY-MM-HH");

            dayHourTotals[key] = (dayHourTotals[key] || 0) + doc.passengerCount;
        });
        

        const now = dayjs();
        let record: string[] = [];
        var daily = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      
        if (range === TimeRange.Daily) {
            record = Array.from({ length: 7 }, (_, i) => now.subtract(6 - i, 'day').format("YYYY-MM-DD"));
        } else if (range === TimeRange.Weekly) {
            const startWeek = now.subtract(5, 'week').week();
            record = Array.from({ length: 6 }, (_, i) => `Week ${startWeek + i}`);
            // get the peak hour for each day of the week
            for (let i = 0; i < 6; i++) {
                const week = startWeek + i;
                for (let day = 0; day < 7; day++) {
                    const key = `Week ${week}-${day}`; 
                    //actual key is `Week ${week}-${day}-${hour}`
                    //lets get the wildcard match key 
                    let peakHour = 0;
                    let peakPassengers = 0;
                    for (let hour = 0; hour < 24; hour++) {
                        const hourKey = `${key}-${hour}`;
                        const passengers = dayHourTotals[hourKey] || 0;
                         if (passengers > peakPassengers) {
                            peakPassengers = passengers;
                            peakHour = hour;
                        }
                    }
                    record[i] = `${key}`; 
                   
                }
            }
        } else {
            record = Array.from({ length: 6 }, (_, i) => now.subtract(5 - i, "month").format("YYYY-MM"));
        } 
        const dailyPeaks = record.map(dayLabel => {
             let peakHour = 0;
            let peakPassengers = 0; 
            for (let hour = 0; hour < 24; hour++) {
                let key;
                if (range === TimeRange.Daily) key = `${dayLabel}-${hour}`;
                else if (range === TimeRange.Weekly) key =  `${dayLabel}-${hour}`;
                else key = `${dayLabel}-${hour}`;
                console.log("Checking key:", key);
                const passengers = dayHourTotals[key] || 0;
                if (passengers > peakPassengers) {
                    peakPassengers = passengers;
                    peakHour = hour;
                }
            }
            
            return { day: dayLabel, hour: peakHour, passengers: peakPassengers };
        });

        const maxVal = Math.max(...dailyPeaks.map(d => d.passengers), 1);
        const value = dailyPeaks.map(d => d.passengers);
        const percent = dailyPeaks.map(d => Math.round((d.passengers / maxVal) * 100));
        const last = value[value.length - 1] || 0;
        const prev = value[value.length - 2] || 0;
        const changes = prev > 0 ? Math.round(((last - prev) / prev) * 100) : 0;
        if(range === TimeRange.Daily){
            // Convert day labels to day names
        record = dailyPeaks
            .map(d => {
            const date = dayjs(d.day);
            return daily[date.day()];
        })
        .filter((v): v is string => v !== undefined);
        }
        const hours = dailyPeaks.map(d => d.hour);
        
        if(range === TimeRange.Weekly){
            var firstRecord = dailyPeaks[0]
            var firstParts = firstRecord?.day.split('-');
            let fp:any = (firstParts|| [""])[0]
            var firstWeek = parseInt(fp.replace('Week ','')) || 0;
         
            record = dailyPeaks.map(d=> {
                const parts = d.day.split('-');
                const dayNum = parts[0]
                return dayNum
            }).filter((v): v is string => v!=undefined);
        }

        if(range === TimeRange.Monthly){
            record = dailyPeaks.map(d=> {
                const parts = d.day.split('-');
                let part:any = parts[1]
                const monthNum = parseInt(part) || 1;
                const monthName = dayjs().month(monthNum -1).format('MMM');
                return monthName;
            });
        }
            

        return { hours, record, value, percent, changes };
    }

    async _getBottleneck(docs: any, range: TimeRange) {
        if (docs.length === 0) return  { record: [], value: [], changes: 0 };

        const routeService = new RouteService();
        const bottlenecks: Record<string, number> = {};
        const now = dayjs();
        const routeMaps = await routeService.getAllRouteMaps();
        routeMaps.forEach((route:any) => {
            bottlenecks[route.routeName] = 0;
        });
         
        await Promise.all(docs.map(async (doc: any) => {
            if(range === TimeRange.Daily){
                const docDate = dayjs(doc.createdAt).format("YYYY-MM-DD");
                const targetDate = dayjs().subtract(6, 'day').format("YYYY-MM-DD");
                if (docDate < targetDate) return;
            }
            else if(range === TimeRange.Weekly){
                const docWeek = dayjs(doc.createdAt).isoWeek();
                const targetWeek = now.isoWeek() - 5;
                if (docWeek < targetWeek) return;
            }
            else{
                const docMonth = dayjs(doc.createdAt).format("YYYY-MM");
                const targetMonth = dayjs().subtract(5, "month").format("YYYY-MM");
                if (docMonth < targetMonth) return;
            }

            if (!doc.currentLocation) return;

            const route = await routeService.getRouteInfoBaseOnLocation(doc.currentLocation);
            if (!route) return;
            bottlenecks[route.routeName] = (bottlenecks[route.routeName] || 0) + doc.passengerCount;
        }));
         // Sort bottlenecks by passenger count in descending
        const sorted = Object.entries(bottlenecks).sort((a, b) => b[1] - a[1])

        const record = sorted.map(([key]) => key);
        const value = sorted.map(([_, passengers]) => passengers);
        const last = value[value.length - 1] || 0;
        const prev = value[value.length - 2] || 0;
        const changes = prev > 0 ? Math.round(((last - prev) / prev) * 100) : 0;

        return { record, value, changes };
    }

    async getAnalytics(type: AnalyticsType, range: TimeRange) {
        const now = dayjs();
        let startdate;

        if (range === TimeRange.Daily) startdate = now.subtract(6, "day");
        else if (range === TimeRange.Weekly) startdate = now.subtract(6, "week");
        else startdate = now.subtract(6, "month");
        var  selector = {
                onboarded: true,
                scope: BusActivityModel.scope,
                collection: BusActivityModel.collection,
                channel: BusActivityModel.channel,
                createdAt: {
                    $gte: startdate.valueOf(),
                    $lte: now.valueOf()
                }
            }
        const result = await this.db.find({
            selector,
            fields: ["createdAt", "passengerCount", "currentLocation"]
        });
        console.log(selector)

        const docs = result.docs;
        if (type === AnalyticsType.RidersTrend) return this._getRidersTrend(docs, range);
        if (type === AnalyticsType.PeakHours) return this._getPeakHours(docs, range);
        if (type === AnalyticsType.Bottleneck) return this._getBottleneck(docs, range);
        return null;
    }

    async getTodayBusActivity(){
        console.log("Triggering the bus")
        var busService = new BusService();
        var now = new Date() ;
        var keyDate = new Date(`${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`)
        var selector = {
            scope: BusActivityModel.scope,
            channel : BusActivityModel.channel,
            collection: BusActivityModel.collection,
            createdAt: {"$gte": keyDate.getTime()}

        };
        const result =await this.db.find({
            selector,
            sort:[
                {createdAt: "desc"}
            ]
        })
        var resultData :any[]= []
        const seenBusIds = new Set<string>();

        await Promise.all(
            result.docs.map(async (doc: any) => {
            const busId = doc.busId;

            if (!seenBusIds.has(busId)) {
                seenBusIds.add(busId);

                const bus = await busService.getBusInfo(busId);
                const maxPassenger = bus?.maxPassengers ?? 0;

                doc.congestionLevel = getCongestionLevel(doc.passengerCount, maxPassenger);
                resultData.push(doc);
                }
            })
        );

        return resultData ;


    }
}
