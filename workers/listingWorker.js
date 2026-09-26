require("dotenv").config();
const {Worker}=require("bullmq");
const {sendListingCreatedEmail}=require("../utlis/mailer.js");

const listingWorker=new Worker("listingQueue",
    async(job)=>{
        console.log("Processing job:",job.name);
        console.log("Job data:",job.data);
        if(job.name === "sendListingEmail"){
            const {email,listingTitle}=job.data;
            await sendListingCreatedEmail(email,listingTitle);
            console.log("Email notification job completed");
        }
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
