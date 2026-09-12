if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}
// console.log(process.env.ATLASDB_URL);
const mongoose=require("mongoose");
const initData=require("./data.js");
const Listing=require("../models/listing.js");
const opencage = require('opencage-api-client');
let mapKey = process.env.MAP_API_KEY;

const categories = ["Tranding", "Arctic", "Beachfront", "Mountain View", "Island"];

let categoryList = [];

for (let i = 0; i < 5; i++) {
    for (let j = 0; j < categories.length; j++) {
        categoryList.push(categories[j]);
    }
}

// Shuffle randomly
for (let i = categoryList.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [categoryList[i], categoryList[j]] = [categoryList[j], categoryList[i]];
}

// Assign category to each data
for (let i = 0; i < initData.data.length; i++) {
    initData.data[i].category = categoryList[i];
}


// 'mongodb://127.0.0.1:27017/nextdesination'
const MONGO_URL=process.env.ATLASDB_URL;
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
    initData.data= initData.data.map((obj)=>({ ...obj, owner:'6aa2ef53cbbe94e6eb857b8c'}));
    await Listing.insertMany(initData.data);  // insert all data...
    console.log("data was initialied!");
}

initDB();


