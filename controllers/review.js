const Listing = require("../models/listing.js");
const Review = require("../models/reviews.js");
const ExpressError = require("../utils/ExpressError.js");

module.exports.createReview = async (req, res) => {
        const listing = await Listing.findById(req.params.id);
        if (!listing) throw new ExpressError(404, "Listing not found!");
        const newReview = new Review(req.body.review);
        newReview.author = req.user._id;
        listing.reviews.push(newReview);
        await newReview.save();
        await listing.save();
        req.flash("success", "New Review Added");
        res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted");
    res.redirect(`/listings/${id}`);
};