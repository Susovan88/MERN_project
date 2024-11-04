const mongoose=require("mongoose");
// const review = require("./review");
const Schema= mongoose.Schema;
const Review=require("./review");
const User=require("./user");
const { fileLoader } = require("ejs");
const { required } = require("joi");

const listingSchema= new Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String
    },
    image:{
        url:String,
        filename:String,
    },
    price:{
        type:Number
    },
    location:{
        type:String
    },
    country:{
        type:String
    },
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:"Review",
        }
    ],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
    },
    geometry:{
        type:{
            type:String,
            enum:["Point"],
        },
        coordinates:{
            type:[Number],
        }
    },
    category:{
        type:String,
        enum:["Tranding", "Arctic", "Tower", "Top Cities", "Rooms", "Island", "Historical", "Camping", "Amazing View", "Beachfront", "Castles", "Mountain View"],
    }
});

listingSchema.post("findOneAndDelete",async(listing)=>{
    if(listing) await Review.deleteMany({_id:{$in:listing.reviews}});
});

const Listing = mongoose.model("Listing",listingSchema);
module.exports=Listing;