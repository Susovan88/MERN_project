const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Listing=require("./listing");
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email:{
        type:String,
        required:true,
    },
    image:{
        url:String,
        filename:String,
    },
    about:{
        type:String,
    },
    address:{
        type:String,
    },
    wishlist:[
        {
            type:Schema.Types.ObjectId,
            ref:"Listing",
        }
    ]
});

userSchema.plugin(passportLocalMongoose);  // passport-local-mongoose wiil add a username, hash and salt field to store the username and the hash password in schema

module.exports = mongoose.model('User', userSchema);