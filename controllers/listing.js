const Listing= require("../models/listing");
const opencage = require('opencage-api-client');
const User=require("../models/user");
const ExpressError = require("../utlis/ExpressError");
const {listingQueue}=require("../queues/listingQueue.js");
const {redisClient,getListingCacheVersion,invalidateListingCache}=require("../utlis/redis.js");

// controller functions for all listings pages
module.exports.index=async(req,res)=>{
    const page=Math.max(1,parseInt(req.params.page) || 1);
    const limit=9;
    const skip=(page-1)*limit;

    //redis caching
    const version=await getListingCacheVersion();
    const cacheKey=`cache:listings:v${version}:page:${page}`;
    const cachedData=await redisClient.get(cacheKey);

    if(cachedData){ // If data is found in cache, return it
        console.log("CACHE HIT -> Data fetched from Redis cache");
        const data=JSON.parse(cachedData);
        const {allListings,totalListings}=data;
        const totalPages=Math.ceil(totalListings/limit);
        return res.render("listings/index.ejs",{allListings,totalListings,currentPage:page,totalPages,filterType:null,filterValue:null});   
    }
    // If data is not found in cache, fetch it from the database
    console.log("CACHE MISS -> Data fetched from MongoDB");

    const [allListings,totalListings] = await Promise.all([Listing.find({})
        .select("title image price category")
        .skip(skip)
        .limit(limit),
        Listing.countDocuments({})
    ]);

    // Store the fetched data in Redis cache for future requests
    const data={allListings,totalListings};
    await redisClient.setEx(cacheKey,120,JSON.stringify(data));

    const totalPages=Math.ceil(totalListings/limit);
    res.render("listings/index.ejs",{allListings,totalListings,currentPage:page,totalPages,filterType:null,filterValue:null});
}

module.exports.renderNewForm=(req, res) => {
    res.render("listings/new.ejs");
}

module.exports.showListing=async(req,res)=>{
    let {id}=req.params;

    // redis caching
    const cacheKey=`cache:listing:${id}`;
    const cachedData=await redisClient.get(cacheKey);

    if(cachedData){ // If data is found in cache, return it
        console.log("CACHE HIT -> Data fetched from Redis cache");
        const data=JSON.parse(cachedData);
        return res.render("listings/show.ejs",{listing:data});
    }
    // If data is not found in cache, fetch it from the database
    console.log("CACHE MISS -> Data fetched from MongoDB");

    const listing= await Listing.findById(id)
        .populate({
            path:"reviews",populate:{path:"author"}
        })
        .populate("owner");

    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    // Store the fetched data in Redis cache for future requests
    await redisClient.setEx(cacheKey,120,JSON.stringify(listing));
    res.render("listings/show.ejs",{listing});
}

// controller functions for creating listings
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

    await invalidateListingCache(); // Invalidate the cache after creating a new listing    

    // Add the new listing to the BullMQ queue for background processing
    await listingQueue.add("sendListingEmail",
        {
            email:req.user.email,
            listingTitle:newListing.title
        },
        {
            attempts:3,
            backoff:{type:"exponential", delay:5000}
        }
    ).then(()=>{
        console.log("New Listing added to the queue for background processing.");
    }).catch(err=>{
        console.error("Error adding listing to the queue:", err);
    });

    req.flash(
        "success",
        "Listing created! Confirmation email will be sent shortly."
    );
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

// controller functions for updating listings
module.exports.updateListing=async(req,res)=>{
    let{id}=req.params;
    // console.log(req.body);
    let listing=await Listing.findByIdAndUpdate(id,{...req.body.listing});
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    listing.geometry.type="Point";
    listing.geometry.coordinates=[req.coordinates.lat,req.coordinates.lng];

    if(typeof req.file !== "undefined"){
        let url=req.file.path;
        let filename=req.file.filename;
        listing.image={url,filename};
    }
    await listing.save(); // update location

    await invalidateListingCache(); // Invalidate the cache after updating a listing
    await redisClient.del(`cache:listing:${id}`);

    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
}

// controller functions for deleting listings
module.exports.deleteListing=async(req,res)=>{
    let{id}=req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);

    if(!deleteListing){
        req.flash(
            "error",
            "Listing you requested for does not exist!"
        );
        return res.redirect("/listings");
    }

    await invalidateListingCache(); // Invalidate the cache after deleting a listing
    await redisClient.del(`cache:listing:${id}`);

    console.log(deleteListing,"deleted!");
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");
};

// search by category,owner,location,country
module.exports.filterSearch=async(req,res)=>{
    const {type,q}=req.query;
    if(!type || !q){
        req.flash("error","Query parameter is required");
        return res.redirect("/listings");   
    }
    const page=Math.max(1,parseInt(req.query.page)||1);
    const limit=9;
    const skip=(page-1)*limit;

    if(["category","owner","location","country"].includes(type)===false){
        req.flash("error","Invalid filter type.");
        return res.redirect("/listings");
    }

    const filter={[type]:q};
    if(type==="owner"){
        const user=await User.findOne({"username":q});
        if(!user){
            req.flash("error","No user exist with this username.");
            return res.redirect("/listings");
        }
        filter["owner"]=user._id;
    }

    //redis caching -> /listings/filter?type=owner&q=Susovan+Paul
    const query=q.trim().toLowerCase().replace(/\s+/g,'_');
    const version=await getListingCacheVersion();
    const cacheKey=`cache:listings:v${version}:filter:${type}:${query}:${page}`;
    console.log("Cache Key -> ",cacheKey);
    const cachedData=await redisClient.get(cacheKey).catch(err=>console.log("Redis get error -> ",err));
    
    if(cachedData){ // If data is found in cache, return it
        console.log("CACHE HIT -> Data fetched from Redis cache");
        const data=JSON.parse(cachedData);
        const {allListings,totalListings}=data;
        const totalPages=Math.ceil(totalListings/limit);
        return res.render("listings/index.ejs",{allListings,totalListings,currentPage:page,totalPages,filterType:type,filterValue:q});   
    }
    // If data is not found in cache, fetch it from the database
    console.log("CACHE MISS -> Data fetched from MongoDB");

    const [allListings,totalListings] = await Promise.all([Listing.find(filter)
        .select("title image price category")
        .skip(skip)
        .limit(limit),
        Listing.countDocuments(filter)
    ]);

    if(totalListings===0){
        req.flash("error","No Listing exist in this category.");
        return res.redirect("/listings");
    }

    // Store the fetched data in Redis cache for future requests
    const data={allListings,totalListings};
    await redisClient.setEx(cacheKey,120,JSON.stringify(data));

    const totalPages=Math.ceil(totalListings/limit);
    res.render("listings/index.ejs",{allListings,totalListings,currentPage:page,totalPages,filterType:type,filterValue:q});
};


module.exports.searchListing=async(req,res)=>{
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



