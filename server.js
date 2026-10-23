// Starts the app. Order matters: dotenv first, so process.env is filled
// before anything reads it.
require("dotenv").config({ quiet: true });
const mongoose = require("mongoose");
const app = require("./app");

const PORT = process.env.PORT || 3000;

if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is missing. Copy .env.example to .env and fill it in.");
    process.exit(1);
}

// Connect first, listen second: no request should arrive with no database behind it.
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(PORT, () => console.log(`Class poll running on http://localhost:${PORT}`));
    })
    .catch((error) => {
        console.error("Could not connect to MongoDB:", error.message);
        process.exit(1);
    });
