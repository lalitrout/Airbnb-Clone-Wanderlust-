const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner ,validateListing} = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer  = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });

//index route
router.route("/")
      .get(wrapAsync(listingController.index))
      .post(
        isLoggedIn,
        upload.single('listing[image]'),
        // validateListing,
        wrapAsync(listingController.createListings));
//add new route
router.get("/new", 
    isLoggedIn, listingController.renderNewForm);

//show route
router.route("/:id") 
    .get(wrapAsync(listingController.showAllListing))
    .put( 
        isLoggedIn,
        isOwner,
        validateListing,
        wrapAsync(listingController.updateListings))//update route
    .delete(
        isLoggedIn,
        isOwner,
        wrapAsync(listingController.destroyListings));//delete route

//edit route
router.get("/:id/edit", 
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.renderEditForm));

module.exports = router;
  