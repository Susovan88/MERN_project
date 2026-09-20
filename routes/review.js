const express= require("express");
const router= express.Router({mergeParams:true});
const Review= require("../models/review.js");
const Listing= require("../models/listing.js");
const wrapAsync= require("../utlis/wrapAsync.js");
const ExpressError= require("../utlis/ExpressError.js");
const {validateReview, isLoggedIn, isReviewAuthor,rateLimiter}= require("../middleware.js")
const reviewController=require("../controllers/review.js")

// // reviews....
// add review route....
router.post("/", isLoggedIn,rateLimiter({ limit: 20, windowSeconds: 60 }), validateReview,wrapAsync(reviewController.createReview));

// delete review route...
router.delete("/:reviewId",isLoggedIn, isReviewAuthor, rateLimiter({ limit: 20, windowSeconds: 60 }), wrapAsync(reviewController.deleteReview));

module.exports=router;