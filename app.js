const express = require("express");
const app = express();
const mongoose = require('mongoose');
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");

const listings = require("./routes/listing.js");
const review = require("./routes/review.js");

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

const sessionOption = {
    secret: "mysecretcode",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        // secure: false, // HTTPS nahi hai to false rakho
        maxAge: 7 * 24 * 60 * 60 * 1000,
    },
};

app.get("/",(req,res) => {
    res.send("root is working");
});

app.use(session(sessionOption));
app.use(flash());

app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.use("/listings",listings);
app.use("/listings/:id/reviews",review);

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