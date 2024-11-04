
const mongoose=require("mongoose");
const initData=require("./data.js");
const Listing=require("../models/listing.js");
const opencage = require('opencage-api-client');
let mapKey = process.env.MAP_API_KEY;


const MONGO_URL='mongodb://127.0.0.1:27017/nextdesination';
main().then(()=>{
    console.log("connection succssfull with mongoose");
}).catch(err=>{
    console.log(err);
});

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB =async()=>{
    await Listing.deleteMany({});
    initData.data= initData.data.map((obj)=>({ ...obj, owner:'671cbb9aa4a7c3ecc698768d'}));
    await Listing.insertMany(initData.data);  // insert all data...
    console.log("data was initialied!");
}

initDB();





// if(process.env.NODE_ENV != "production"){
//     require('dotenv').config();
// }
// console.log("Running environment:", process.env.NODE_ENV);

// console.log(process.env.MAP_APIKEY);

// const mongoose = require("mongoose");
// const initData = require("./data.js");
// const Listing = require("../models/listing.js");
// const opencage = require('opencage-api-client');

// const mapKey = process.env.MAP_API_KEY;
// if (!mapKey) {
//     console.error("Error: MAP_API_KEY is not defined in environment variables.");
//     process.exit(1); // Exit if API key is missing
// }

// const MONGO_URL = 'mongodb://127.0.0.1:27017/nextdestination';

// main().then(() => {
//     console.log("Connection successful with mongoose");
// }).catch(err => {
//     console.error("MongoDB connection error:", err);
// });

// async function main() {
//     await mongoose.connect(MONGO_URL);
// }

// const initDB = async () => {
//     try {
//         await Listing.deleteMany({});
//         initData.data = initData.data.map((obj) => ({
//             ...obj,
//             owner: '671cbb9aa4a7c3ecc698768d',
//             geometry: { type: "Point", coordinates: [0, 0] } // Initialize geometry property
//         }));

//         for (const listing of initData.data) {
//             try {
//                 const data = await opencage.geocode({ q: `${listing.location}, ${listing.country}`, key: mapKey });
                
//                 if (data.results.length > 0) {
//                     const lat = data.results[0].geometry.lat;
//                     const lng = data.results[0].geometry.lng;
//                     listing.geometry.coordinates = [lng, lat]; // Set coordinates in [lng, lat] format
//                     console.log(`Latitude: ${lat}, Longitude: ${lng}`);
//                 } else {
//                     console.log('No results found for', listing.location);
//                 }
//             } catch (error) {
//                 console.error('Geocoding error:', error.message);
//             }
//         }

//         await Listing.insertMany(initData.data);  // Insert all data
//         console.log("Data was initialized!");
//     } catch (err) {
//         console.error("Database initialization error:", err);
//     }
// };

// main();
// initDB();
