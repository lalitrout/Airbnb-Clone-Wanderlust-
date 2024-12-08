const mongoose = require("mongoose");
const initdata = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';

async function main() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Connected to MongoDB!");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

const initDB = async () => {
    try {
        await Listing.deleteMany({});
        initdata.data = initdata.data.map((obj) => ({
            ...obj,
            owner: "6749e23febe97132a9b87049"
        }));
        await Listing.insertMany(initdata.data);
        console.log("Database initialized with data!");
    } catch (error) {
        console.error("Error initializing database:", error);
    } finally {
        mongoose.connection.close();
    }
};

main().then(() => initDB());