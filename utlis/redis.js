const {createClient}=require("redis");

const redisClient=createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_SOCKET_HOST,
        port: process.env.REDIS_SOCKET_PORT
    }
});


redisClient.on("error",(err)=>console.log("redis Error -> ",err));

async function connectRedis(){
    try{
        await redisClient.connect();
        console.log("==================== Redis connected successfully ====================");
    }
    catch(err){
        console.log("Redis connection error -> ",err);
    }
};

//  function to get the current version of the listing cache
async function getListingCacheVersion(){
    let version=await redisClient.get("cache:version:listing");
    if(!version){
        await redisClient.set("cache:version:listing",1);
        version=1;
    }
    return version;
}
// function to invalidate the listing cache by incrementing the version
async function invalidateListingCache(){
    await redisClient.incr("cache:version:listing");
    console.log("Listing cache invalidated. New version -> ",await redisClient.get("cache:version:listing"));
    return;
}

module.exports={redisClient,connectRedis,getListingCacheVersion,invalidateListingCache};
