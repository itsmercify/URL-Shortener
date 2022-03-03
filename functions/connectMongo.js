const mongoose = require("mongoose");
module.exports = async () => {
    await mongoose.connect(process.env.mongoURI, { useNewUrlParser: true, keepAlive: true });
    console.log("Connected to the database!");
};