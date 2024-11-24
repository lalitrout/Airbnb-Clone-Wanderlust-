const mongoose = require("mongoose");
const reviews = require("./reviews");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    image: {
        filename: {
            type: String,
            default: "default-image",
        },
        url: {
            type: String,
            default: "https://unsplash.com/photos/palm-tree-near-seashore-Siuwr3uCir0",
            set: (v) => v === "" ? "https://unsplash.com/photos/palm-tree-near-seashore-Siuwr3uCir0" : v,
        }
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
    ]
});

// Middleware to ensure that default values are applied if image is not provided
listingSchema.pre('save', function(next) {
    if (!this.image || !this.image.url) {
        this.image = {
            filename: "default-image",
            url: "https://unsplash.com/photos/palm-tree-near-seashore-Siuwr3uCir0"
        };
    }
    next();
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;