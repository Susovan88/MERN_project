const express= require("express");
const router= express.Router();
const User= require("../models/user");
const wrapAsync = require("../utlis/wrapAsync");
const passport=require("passport");
const {saveRedirectUrl,isLoggedIn,isCurrUser}= require("../middleware.js");
const userController=require("../controllers/user.js");
const multer  = require('multer');
const {storage}=require("../cloudconfig.js");
const upload = multer({ storage });

router.route("/profile/:userId")
    .get( isLoggedIn, userController.renderProfile)
    .put(isLoggedIn,isCurrUser, upload.single('image'),wrapAsync(userController.updateProfile));

router.get("/profile/:userId/edit",isLoggedIn,userController.renderEditprofileForm);

router.route("/signup")
    .get(userController.renderSignUpForm)
    .post(upload.single('image'),wrapAsync(userController.signUp));

router.route("/login")
    .get(userController.renderLogInForm)
    .post(
        saveRedirectUrl,
        passport.authenticate("local",{failureRedirect:'/login',failureFlash:true}),
        userController.logIn
    );

// logout
router.get("/logout",userController.logOut);

module.exports = router;