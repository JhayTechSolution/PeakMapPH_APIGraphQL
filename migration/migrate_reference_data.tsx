const dotenv = require('dotenv');

const envFIle = ".env."+[process.env.NODE_ENV || 'development'];
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../', envFIle) });
 
import {Database} from '../src/db/dbInstance';
import {StationModel} from '../src/db/model/station';
import { RouteModel } from '../src/db/model/route';
import { BusModel } from '../src/db/model/bus';

const db = new Database(process.env.DBNAME);
console.log(process.env)
async function migrateStations(){
  
    var query = await db.find({ selector : { channel: "peakmap_station_reference" } })
    //delete  
    await db.deleteMany(query.docs);
    


    var monumento = new StationModel({ 
        id: db.generateId(),
        deleted:false ,
        location: { latitude: 14.6546, longitude: 120.9830 },
        stationName: 'Monumento',
    })
    await db.add(monumento);
    var pitx = new StationModel({
        id: db.generateId(),
        deleted:false ,
        location: { latitude: 14.5211, longitude: 120.9953 },
        stationName: 'PITX',
    })
    console.log(pitx);
    await db.add(pitx);
    console.log('station migrated')
}


async function migrateBus(){
    var query = await db.find({ selector : { channel: "peakmap_bus_reference" } })
    //delete  
    await db.deleteMany(query.docs);
    //generate 5 buses and auto maxpassengers
    var buses = [
        {  maxPassengers: 50, busName: 'Bus 1' },
        {  maxPassengers: 40, busName: 'Bus 2' },
        {  maxPassengers: 30, busName: 'Bus 3' },
        {  maxPassengers: 20, busName: 'Bus 4' },
        {  maxPassengers: 10, busName: 'Bus 5' },
    ];

    for (let b of buses) {
        var bus = new BusModel({
            id: db.generateId(),
            deleted: false,
            maxPassengers: b.maxPassengers,
            busName: b.busName,
        });
       await db.add(bus);
    }

    console.log('bus migrated')
}
async function migrateRoutes(){
    var query = await db.find({ selector : { channel: "peakmap_route_reference" } })
    //delete  
    await db.deleteMany(query.docs);

    var routes = [
        { routeName: 'Monumento', latitude: 14.6546, longitude: 120.9830 },
        { routeName: 'Bagong Barrio', latitude: 14.6578, longitude: 121.0013 },
        { routeName: 'Balintawak', latitude: 14.6567, longitude: 121.0169 },
        { routeName: 'Kaingin Rd', latitude: 14.6555, longitude: 121.0274 },
        { routeName: 'Roosevelt/Muñoz', latitude: 14.6574, longitude: 121.0329 },
        { routeName: 'North Ave', latitude: 14.6546, longitude: 121.0380 },
        { routeName: 'Quezon Ave', latitude: 14.6384, longitude: 121.0359 },
        { routeName: 'Kamuning', latitude: 14.6262, longitude: 121.0365 },
        { routeName: 'Nepa Q-Mart', latitude: 14.6195, longitude: 121.0432 },
        { routeName: 'Main Ave/Cubao', latitude: 14.6170, longitude: 121.0519 },
        { routeName: 'Santolan-Annapolis', latitude: 14.6032, longitude: 121.0564 },
        { routeName: 'Ortigas', latitude: 14.5857, longitude: 121.0568 },
        { routeName: 'Shaw Blvd', latitude: 14.5792, longitude: 121.0534 },
        { routeName: 'Boni Ave', latitude: 14.5727, longitude: 121.0468 },
        { routeName: 'Guadalupe', latitude: 14.5682, longitude: 121.0414 },
        { routeName: 'Buendia', latitude: 14.5588, longitude: 121.0213 },
        { routeName: 'Ayala', latitude: 14.5509, longitude: 121.0278 },
        { routeName: 'Magallanes', latitude: 14.5379, longitude: 121.0221 },
        { routeName: 'Taft Ave (EDSA-Taft)', latitude: 14.5345, longitude: 120.9972 },
        { routeName: 'Roxas Blvd/Tramo', latitude: 14.5252, longitude: 120.9916 },
        { routeName: 'PITX', latitude: 14.5211, longitude: 120.9953 },
    ];

    for (let r of routes) {
        var route = new RouteModel({
            id: db.generateId(),
            deleted: false,
            location: { latitude: r.latitude, longitude: r.longitude },
            routeName: r.routeName,
        });
        await db.add(route);
    }

    console.log('route migrated');
}


async function startMigrations(){
  await db.createIndex({ index: { fields: ["scope", "collection","channel","createdAt"] },name:"scope_collection_channel_createdAt" });
  await db.createIndex({ index: { fields: ["channel","scope", "collection","_id"] } });
  migrateStations();
  migrateRoutes();
  migrateBus();
}

startMigrations();  