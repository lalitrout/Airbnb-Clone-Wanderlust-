const express = require("express");
const app = express();
const mongoose = require('mongoose');
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema} = require("./schema.js");
const Review = require("./models/reviews.js");

const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';

main()
.then( () => {
    console.log("you r connected to db");
})
.catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
};

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname , "/public")));

const validateListing = (req,res,next) => {
    let {error} = listingSchema.validate(req.body);
    if (error) {
        let errMsg  = error.details.map((el) => el.message).join(",");
     throw new ExpressError(400, errMsg);
    } else {
        next();
    }
}

app.get("/",(req,res) => {
    res.send("root is working");
});

//index route
app.get("/listing", 
    wrapAsync(async(req,res) => {
    const allListing = await Listing.find({});
    res.render("listings/index.ejs", {allListing});
}));

//add route
app.get("/listing/new", 
    wrapAsync(async (req,res) => {
    res.render("listings/new.ejs");
}));

//show route
app.get("/listing/:id", 
    wrapAsync(async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    // console.log("listing =",listing); 
    res.render("listings/show.ejs", {listing});
}));

//create route
app.post("/listing",
    validateListing,
    wrapAsync(async (req,res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listing");
}));

//edit route
app.get("/listing/:id/edit", 
    wrapAsync(async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
}));

//update route
app.put("/listing/:id", 
    validateListing,
    wrapAsync(async (req,res) => {
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listing/${id}`);
}));

//delete route
app.delete("/listing/:id", wrapAsync(async (req,res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    // console.log(deletedListing);
    res.redirect("/listing");
}));

//reviews post route
app.post("/listings/:id/reviews", async (req,res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    console.log("hello");

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    console.log("new review saved");
    res.send("new review saved");
})

app.all("*" , (req,res,next) => {
    next(new ExpressError(404 , "Page Not Found!"));
});

app.use ((err,req,res,next) => {
    let {statusCode=500 , message="something went wrong"} = err;
    res.status(statusCode).render("listings/error.ejs", {message});
    // res.status(statusCode).send(message);
});

app.listen(8080, () => {
    console.log("server is listening to");
});