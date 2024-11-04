const Review=require("../models/review");
const User=require("../models/user");


module.exports.renderProfile=async(req,res)=>{
    let{userId}=req.params;
    if(!userId){
        return res.render("users/profile.ejs");
    }
    let user=await User.findById(userId);
    res.render("users/profile.ejs",{user});
}

module.exports.renderEditprofileForm=async(req,res)=>{
    let{userId}=req.params;
    let user=await User.findById(userId);
    res.render("users/editprofile.ejs",{user});
}

module.exports.updateProfile=async(req,res)=>{
    let{userId}=req.params;
    let{about,address}=req.body;
    let user= await User.findByIdAndUpdate(userId,{about,address});

    if(typeof req.file !== "undefined"){
        let url=req.file.path;
        let filename=req.file.filename;
        user.image={url,filename};
        user=await user.save();
    }
    req.flash("success","Your profile Updated!");
    res.redirect(`/profile/${userId}`);
}

module.exports.renderSignUpForm=(req,res)=>{
    res.render("users/signup.ejs");
}

module.exports.signUp=async(req,res,next)=>{
    try{
        let{username,email,password}=req.body;
        const newUser=new User({email,username});
        newUser.image.url=req.file.path;
        newUser.image.filename=req.file.filename;
        const registeredUser=await User.register(newUser,password);

        // console.log(registeredUser);

        // after signup user automaticly login.
        await new Promise((resolve, reject) => {  // req.logIn is a callback-based function, so it needs to be converted into a Promise to use await effectively.
            req.logIn(registeredUser, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
        console.log(registeredUser);
        req.flash("success","Welcome to NextDestination!");
        res.redirect("/listings");
    }catch(err){
        req.flash("error",err.message);
        res.redirect("/signup");
    }
}

module.exports.renderLogInForm=(req,res)=>{
    res.render("users/login.ejs");
}

module.exports.logIn= async(req,res)=>{
    req.flash("success","Welcome back to NextDestination!");
    let redirectUrl= res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
}

module.exports.logOut=(req,res,next)=>{
    req.logOut((err)=>{
        if(err){
            return next();
        }
        req.flash("success","You are logged out!");
        res.redirect("/listings");
    });
}
