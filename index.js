require("dotenv").config();
const express = require("express");
const app = express();
const connectMongo = require("./functions/connectMongo");
const urls = require("./mongo/schema/urls");

const { nanoid } = require("nanoid");
const axios = require("axios");

function routeLog(req, res, next) {
    console.log(`${req.method} - ${req.url}`);
    next()
};

app.use(express.json());
app.set("view engine", "ejs");
app.use(routeLog);

app.get("/", (req, res) => {
    res.render('index.ejs', {
        url: `${req.headers["x-forwarded-proto"] || "http"}://${req.headers["host"]}/`
    });
});

app.post("/urls/create", async (req, res) => {
    if (!req.body.url) return res.status(400).send({ message: `"url" not provided.` });
    const regex = new RegExp("((http|https)://)(www.)?[a-zA-Z0-9@:%._\\+~#?&//=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%._\\+~#?&//=]*)");
    if (!regex.test(req.body.url)) return res.status(400).send({ message: "Invalid URL provided." });

    let slug = req.body.slug;
    if (!slug) slug = nanoid(5);

    console.log(req.body);

    const alreadyExists = await urls.findOne({ slug: slug });
    if (alreadyExists) return res.status(400).send({ message: "The provided slug already exists." });

    res.status(200).send({
        slug: slug,
        url: req.body.url
    });

    new urls({
        url: req.body.url,
        slug,
        created_at: Date.now().valueOf(),
        clicks: 0,
        clicks_from: []
    }).save();
});

app.get("/urls/get", async (req, res) => {

    const slug = req.body.slug || req.query.slug;
    if (!slug) return res.status(400).send({ message: `"slug" not provided.` });

    const data = await urls.findOne({ slug });
    if (!data) return res.status(200).send({ message: `No slugs with name "${slug}" found.` });

    res.send({
        url: data.url,
        createdAt: Number(data.created_at),
        slug: data.slug,
        clicks: data.clicks
    });

})

app.get("/*", async (req, res) => {

    const url = await urls.findOne({ slug: req.params[0] });
    if (!url) return res.render("notFound.ejs")

    res.redirect(url.url);
    const { data: ip } = await axios.get(`https://httpbin.org/ip`);
    const { data: country } = await axios.get(`http://ip-api.com/json/${ip.origin}`);

    await urls.findOneAndUpdate(
        {
            slug: req.params[0]
        },
        {
            $push: {
                clicks_from: {
                    country: country.country
                }
            },
            $inc: {
                clicks: 1
            }
        },
        {
            upsert: true
        }
    )
});

const port = process.env.PORT || 1000;
app.listen(port, () => {
    connectMongo();
    console.log(`Listening on port`, port);
});