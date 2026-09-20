const {Queue} =require("bullmq");

module.exports.listingQueue=new Queue("listingQueue",{
    connection:{
        host:"127.0.0.1",
        port:6379
    }
});
