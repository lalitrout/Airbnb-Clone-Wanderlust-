const express = require("express");
const router = express.Router({ mergeParams: true });
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {reviewSchema} = require("../schema.js");
const Review = require("../models/reviews.js");
const Listing = require("../models/listing.js");

const validateReview = (req,res,next) => {
    let {error} = reviewSchema.validate(req.body);
    if (error) {
        let errMsg  = error.details.map((el) => el.message).join(",");
     throw new ExpressError(400, errMsg);
    } else {
        next();
    }
}

// Post review route
router.post("/", validateReview, wrapAsync(async (req, res) => {
    console.log("Request body:", req.body);
    console.log(req.params.id);
    const listing = await Listing.findById(req.params.id);
    if (!listing) throw new ExpressError(404, "Listing not found!");
    const newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success", "New Review Added");
    res.redirect(`/listings/${listing._id}`);
}));

// Delete review route
router.delete("/:reviewId", wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted");
    res.redirect(`/listings/${id}`);
}));

module.exports = router;
