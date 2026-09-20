const express= require("express");
const router= express.Router();
const User= require("../models/user");
const wrapAsync = require("../utlis/wrapAsync");
const passport=require("passport");
const {saveRedirectUrl,isLoggedIn,isCurrUser,rateLimiter}= require("../middleware.js");
const userController=require("../controllers/user.js");
const multer  = require('multer');
const {storage}=require("../cloudconfig.js");
const upload = multer({ storage });

router.route("/profile/:userId")
    .get( isLoggedIn,rateLimiter({ limit: 20, windowSeconds: 60 }), userController.renderProfile)
    .put(isLoggedIn,isCurrUser,rateLimiter({ limit: 20, windowSeconds: 60 }), upload.single('image'),wrapAsync(userController.updateProfile));

router.get("/profile/:userId/edit",isLoggedIn,rateLimiter({ limit: 20, windowSeconds: 60 }),userController.renderEditprofileForm);

router.route("/signup")
    .get(rateLimiter({ limit: 20, windowSeconds: 60 }),userController.renderSignUpForm)
    .post(rateLimiter({ limit: 20, windowSeconds: 60 }),upload.single('image'),wrapAsync(userController.signUp));

router.route("/login")
    .get(rateLimiter({ limit: 20, windowSeconds: 60 }),userController.renderLogInForm)
    .post(
        rateLimiter({ limit: 20, windowSeconds: 60 }),
        saveRedirectUrl,
        passport.authenticate("local",{failureRedirect:'/login',failureFlash:true}),
        userController.logIn
    );

// logout
router.get("/logout",rateLimiter({ limit: 20, windowSeconds: 60 }),userController.logOut);

module.exports = router;