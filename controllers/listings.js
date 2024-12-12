const Listing = require("../models/listing.js");

module.exports.index = async (req, res, next) => {
    try {
        const allListing = await Listing.find({});
        res.render("listings/index.ejs", { allListing });
    } catch (err) {
        next(err);
    }
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showAllListing = async (req, res, next) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id)
            .populate({
                path: "reviews",
                populate: { path: "author" },
            })
            .populate("owner");

        if (!listing) {
            req.flash("error", "Your requested Listing does not EXIST!");
            return res.redirect("/listings");
        }

        res.render("listings/show.ejs", { listing });
    } catch (err) {
        next(err);
    }
};

module.exports.createListings = async (req, res, next) => {
    try {
        let newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;

        if (typeof req.file !== "undefined")
            {
            let url = req.file.path;
            let filename = req.file.filename;
            newListing.image = { url, filename };     
        }

        // Set a timeout for saving the listing
        const saveWithTimeout = Promise.race([
            newListing.save(),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Timeout: Saving took too long")), 15000) // 15 seconds timeout
            ),
        ]);

        await saveWithTimeout;

        req.flash("success", "New Listing Created!");
        res.redirect("/listings");
    } catch (err) {
        if (err.message.includes("Timeout")) {
            req.flash("error", "Server took too long to process your request. Please try again later.");
            return res.redirect("/listings"); // Redirect to an error or fallback page
        }
        next(err); // Pass other errors to the error handler middleware
    }
};

module.exports.renderEditForm = async (req, res, next) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id);

        if (!listing) {
            req.flash("error", "Your requested Listing does not EXIST!");
            return res.redirect("/listings");
        }

        res.render("listings/edit.ejs", { listing });
    } catch (err) {
        next(err);
    }
};

module.exports.updateListings = async (req, res, next) => {
    try {
        const { id } = req.params;
        let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

        if (typeof req.file !== "undefined") {
            let url = req.file.path;
            let filename = req.file.filename;
            listing.image = { url, filename };

            // Adding a timeout for the save operation using Promise.race
            const savePromise = listing.save();
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error("try again after some time")), 15000) // 15-second timeout
            );

            try {
                await Promise.race([savePromise, timeoutPromise]);
            } catch (error) {
                req.flash("error", "Taking too long to Process, " + error.message);
                return res.redirect(`/listings/${id}`);
            }
        }

        req.flash("success", "Listing Updated");
        res.redirect(`/listings/${id}`);
    } catch (err) {
        next(err);
    }
};

module.exports.destroyListings = async (req, res, next) => {
    try {
        const { id } = req.params;
        await Listing.findByIdAndDelete(id);
        req.flash("success", "Listing Deleted");
        res.redirect("/listings");
    } catch (err) {
        next(err);
    }
};