const mongoose=require("mongoose");
const MongoStore = require('connect-mongo');

const dbUrl=process.env.ATLASDB_URL;

// connect to mongoose database
async function main() {
    try{
        await mongoose.connect(dbUrl);
        console.log("==================== connection succssfull with MongoDB =====================");
    }
    catch(err){
        console.log("Error connecting to MongoDB -> ",err);
    }
}

module.exports={main};
