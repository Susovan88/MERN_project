const express= require("express");
const router= express.Router();
const Listing= require("../models/listing.js");
const wrapAsync= require("../utlis/wrapAsync.js");
const {isLoggedIn,isOwner,validateListing,setCoordinates,rateLimiter}= require("../middleware.js");
const listingController=require("../controllers/listing.js")
const multer  = require('multer');
const {storage}=require("../cloudconfig.js");
const upload = multer({ storage });

// index route
router.route("/")
    .get(rateLimiter({ limit: 20, windowSeconds: 60 }), wrapAsync(listingController.index))
    .post(isLoggedIn,rateLimiter({ limit: 20, windowSeconds: 60 }), upload.single('listing[image]'),setCoordinates, validateListing, wrapAsync(listingController.createListing));

// page route for pagination
router.get("/page/:page",rateLimiter({ limit: 20, windowSeconds: 60 }),wrapAsync(listingController.index));

// new route
router.get("/new",isLoggedIn,rateLimiter({ limit: 20, windowSeconds: 60 }),listingController.renderNewForm);

// search route
router.get("/search",rateLimiter({ limit: 20, windowSeconds: 60 }),wrapAsync(listingController.searchListing));

// filter route
router.get("/filter",rateLimiter({ limit: 20, windowSeconds: 60 }),wrapAsync(listingController.filterSearch));

router.route("/:id")
    .get(rateLimiter({ limit: 20, windowSeconds: 60 }),wrapAsync(listingController.showListing))
    .put(isLoggedIn,rateLimiter({ limit: 20, windowSeconds: 60 }), isOwner, upload.single('listing[image]'),setCoordinates, validateListing, wrapAsync(listingController.updateListing))
    .delete(isLoggedIn, rateLimiter({ limit: 20, windowSeconds: 60 }), isOwner, wrapAsync(listingController.deleteListing));


//edit route
router.get("/:id/edit", isLoggedIn,rateLimiter({ limit: 20, windowSeconds: 60 }), isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;













