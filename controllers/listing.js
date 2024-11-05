const Listing= require("../models/listing");
const opencage = require('opencage-api-client');
const ExpressError = require("../utlis/ExpressError");
let mapKey = process.env.MAP_API_KEY;


module.exports.index=async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}

module.exports.renderNewForm=(req, res) => {
    res.render("listings/new.ejs");
}

module.exports.showListing=async(req,res)=>{
    let {id}=req.params;
    const listing= await Listing.findById(id)
        .populate({
            path:"reviews",populate:{path:"author"}
        })
        .populate("owner");

    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs",{listing});
}

module.exports.createListing=async(req,res,next)=>{
    let url=req.file.path;
    let filename=req.file.filename;
    const newListing= new Listing(req.body.listing);
    newListing.owner=req.user._id;
    newListing.image={url,filename};

    newListing.geometry.type="Point";
    newListing.geometry.coordinates=[req.coordinates.lat,req.coordinates.lng];
    await newListing.save();
    // console.log(saveedListing);
    req.flash("success","New Listing Created!");
    res.redirect("/listings");
}

module.exports.renderEditForm=async (req,res)=>{
    let{id}=req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    let originalImg=listing.image.url;
    originalImg=originalImg.replace("/upload","/upload/w_250/e_blur:300");
    res.render("listings/edit.ejs",{listing,originalImg});
}

module.exports.updateListing=async(req,res)=>{
    let{id}=req.params;
    // console.log(req.body);
    let listing=await Listing.findByIdAndUpdate(id,{...req.body.listing});

    if(typeof req.file !== "undefined"){
        let url=req.file.path;
        let filename=req.file.filename;
        listing.image={url,filename};
        await listing.save(); // update file
    }

    listing.geometry.type="Point";
    listing.geometry.coordinates=[req.coordinates.lat,req.coordinates.lng];
    await listing.save(); // update location

    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
}

module.exports.deleteListing=async(req,res)=>{
    let{id}=req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing,"deleted!");
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");
}

module.exports.searchListing=async(req,res,next)=>{
    const { query } = req.query;
    if (!query) {
        req.flash("error","Query parameter is required");
        return res.redirect("/listings");
    }
    const searchRegex = new RegExp(query, "i"); // Case-insensitive regex for the search
    const allListings = await Listing.find({
      $or: [{ location: searchRegex }, { country: searchRegex }],
    });

    if(allListings.length===0){
        req.flash("error","Query parameter is required");
        throw new ExpressError(402,"No Listing exist in this location / country. Or, Please search by either location or country, not both in one query.");
    }
     res.render("listings/index.ejs",{allListings});
}


module.exports.categorySearch=async(req,res)=>{
    let {q}=req.query;
    // console.log(q);
    const allListings = await Listing.find({category:q});
    if(allListings.length===0){
        throw new ExpressError(402,"No listing exist in this category.");
    }

    res.render("listings/index.ejs",{allListings});
}



