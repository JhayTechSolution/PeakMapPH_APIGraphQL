import { BusActivityService, AnalyticsType, TimeRange } from "../service/bus_activity_service";


export async function getAnalyticsData(analyticsType:AnalyticsType, timeRange:TimeRange){
    const service = new BusActivityService();
    console.log('getting analytics data for', analyticsType, timeRange);
    return await service.getAnalytics(analyticsType, timeRange);
}