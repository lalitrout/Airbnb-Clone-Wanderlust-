const express = require("express");
const app = express();
const mongoose = require('mongoose');
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';

main()
.then( () => {
    console.log("you r connected to db");
})
.catch((err) => {
    console.log(err);
})

async function main() {
    await mongoose.connect(MONGO_URL);
};

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname , "/public")));

app.get("/",(req,res) => {
    res.send("root is working");
});

//index route
app.get("/listing", async(req,res) => {
    const allListing = await Listing.find({});
    res.render("listings/index.ejs", {allListing});
});

//add route
app.get("/listing/new", async (req,res) => {
    res.render("listings/new.ejs");
});

//show route
app.get("/listing/:id", async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", {listing});
});

app.post("/listing", async (req,res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listing");
});

//edit route
app.get("/listing/:id/edit" , async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
});

//update route
app.put("/listing/:id" , async (req,res) => {
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listing/${id}`);
});

app.delete("/listing/:id",async (req,res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    // console.log(deletedListing);
    res.redirect("/listing");
});

// app.get("/testListing", async(req,res) => {
    // let sampleListing = new Listing ({
        // title: "my villa",
        // description: "by the beach",
        // price: 12000,
        // location : "Goa",
        // country : "India",
    // });
    //  await sampleListing.save();
    //  console.log("sample was saved");
    //  res.send("successful testing")
// });

app.listen(8080, () => {
    console.log("server is listening to");
});