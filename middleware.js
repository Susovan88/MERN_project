const session = require("express-session");
const Listing=require("./models/listing");
const Review=require("./models/review");
const User=require("./models/user");
const ExpressError= require("./utlis/ExpressError");
const {listingSchema,reviewSchema}=require("./schema");
const opencage = require('opencage-api-client');
let mapKey = process.env.MAP_API_KEY;


// listing schema validation middleware function for create route and update route.
module.exports.validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
}


// review schema validation middleware function....
module.exports.validateReview=(req,res,next)=>{
    let {error}= reviewSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }
    else{
        next();
    }
}


// middleware function that's chack in every action (create,edit,delete...)that user logged in. If user is not logged in then redrict to login page.
module.exports.isLoggedIn=(req,res,next)=>{
    // console.log(req.path, req.originalUrl);
    if(!req.isAuthenticated()){
        // store the path where you redirect after login
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","You must be logged in to get access!");
        return res.redirect("/login");
    }
    next();
}

// middleware function to store redirectUrl in res.locals
module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl; // after login passport automatically delete req.session.redirectUrl
    }
    next();
}

//middleware function to check that user is listing's owner. If not, then user can not access to delete and edit this listing
module.exports.isOwner =async(req,res,next)=>{
    let{id}=req.params;
    let listing=await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error","You are not owner of this listing! So, you can not edit and delete this listing. ");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

// middleware to get access to edit profile.
module.exports.isCurrUser=async(req,res,next)=>{
    let{userId}=req.params;
    if (userId !== String(res.locals.currUser._id)) {
        req.flash("error", "You are not authorized to edit.");
        return res.redirect(`/profile/${userId}`);
    }
    next();
}

// middleware to check if(current user == review author) then get access to delete review
module.exports.isReviewAuthor=async(req,res,next)=>{
    let{id,reviewId}=req.params;
    let review=await Review.findById(reviewId);
    if(!review.author._id.equals(res.locals.currUser._id)){
        req.flash("error","You are not author of this review! So, you can not delete this review. ");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

// middleware for create coordinates using location and country
module.exports.setCoordinates=async(req,res,next)=>{
    let lat, lng;
    try {
        const data = await opencage.geocode({ q: `${req.body.listing.location}, ${req.body.listing.country}`, key: mapKey });

        if (data.results.length > 0) {
            lat = data.results[0].geometry.lat; // Access latitude
            lng = data.results[0].geometry.lng; // Access longitude
            // console.log(`Latitude: ${lat}, Longitude: ${lng}`);
            req.coordinates={lat:lat, lng:lng};
        } else {
            console.log('No results found.');
            req.coordinates = { lat: null, lng: null };
        }
        next();
    } catch (error) {
        console.log('Error caught:', error.message);
        next(error);
    }
}