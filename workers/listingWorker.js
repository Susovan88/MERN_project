const {Worker}=require("bullmq");

const listingWorker=new Worker("listingQueue",async(job)=>{
    console.log("Processing job:",job.name);
    console.log("Job data:",job.data);
    // Here you can implement the logic to process the job data
    // For example, you can perform some database operations or any other task
    },{
        connection:{
            host:"127.0.0.1",
            port:6379
        }
    }
);

listingWorker.on("completed",(job)=>{
    console.log(`Job ${job.id} completed successfully!`);
});

listingWorker.on("failed",(job,err)=>{
    console.log(`Job ${job.id} failed : `,err.message);
})
