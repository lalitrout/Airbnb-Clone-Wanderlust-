const mongoose = require("mongoose");
const reviews = require("./reviews");
const Schema = mongoose.Schema;
const Review = require("./reviews.js");
const { ref } = require("joi");

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        url: String,
        filename: String,
    },
    price: {
        type: Number,
        min: 0,
    },
    location: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        // enum: ["USA", "Canada", "UK", "Australia"],
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref:"Reviews",
        }
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    }
});

// Middleware to ensure that default values are applied if image is not provided
listingSchema.pre("save", function (next){ 
  if (!this.image || !this.image.url || this.image.url.trim() === "")
    this.image =  "https://cdn.pixabay.com/photo/2022/09/27/19/46/ai-generated-7483596_960_720.jpg",
  next();
});

listingSchema.post("findOneAndDelete", async(listing) => {
    if(listing) {
    await Review.deleteMany({_id: {$in: listing.reviews}});
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;