const { Schema, model } = require("mongoose");
const schema = new Schema({
    url: String,
    slug: String,
    created_at: String,
    clicks: Number,
    clicks_from: Array
});

module.exports = model('urls', schema);