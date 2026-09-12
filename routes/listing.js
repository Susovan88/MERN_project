const express= require("express");
const router= express.Router();
const Listing= require("../models/listing.js");
const wrapAsync= require("../utlis/wrapAsync.js");
const {isLoggedIn,isOwner,validateListing,setCoordinates}= require("../middleware.js");
const listingController=require("../controllers/listing.js")
const multer  = require('multer');
const {storage}=require("../cloudconfig.js");
const upload = multer({ storage });

// index route
router.route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn, upload.single('listing[image]'),setCoordinates, validateListing, wrapAsync(listingController.createListing));

// page route for pagination
router.get("/page/:page",wrapAsync(listingController.index));

// new route
router.get("/new",isLoggedIn,listingController.renderNewForm);

// search route
router.get("/search",wrapAsync(listingController.searchListing));

// filter route
router.get("/filter",wrapAsync(listingController.filterSearch));

router.route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(isLoggedIn, isOwner, upload.single('listing[image]'),setCoordinates, validateListing, wrapAsync(listingController.updateListing))
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));


//edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;













