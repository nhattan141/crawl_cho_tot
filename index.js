const PORT = 5000;
const express = require("express");
const puppeteer = require('puppeteer');
const app = express();

const { crawl_all_urls } = require('./demo');
const { crawl_detail_post } = require('./crawl_detail_post');
const { crawl_image_post } = require('./crawl_image_post');
const { crawl_extra_info } = require('./crawl_extra_info');
const { crawl_phone } = require('./crawl_phone');

app.get("/api/details", async (req, res) => {
    const district = req.query.district;
    if (district === undefined) {
        return res.status(500).json({
            err: "missing district",
        });
    } else {
        try {
            const data = await crawl_detail_post(district);
            return res.status(200).json({
                total: data.length,
                data,
            });
        } catch (err) {
            return res.status(500).json({
                err: err.toString(),
            });
        }
    }
});

app.get("/api/crawl_url", async (req, res) => {
    const district = req.query.district;
    if (district === undefined) {
        return res.status(500).json({
            err: "missing district",
        });
    } else {
        try {
            const data = await crawl_all_urls(district);
            return res.status(200).json({
                total: data.length,
                data,
            });
        } catch (err) {
            return res.status(500).json({
                err: err.toString(),
            });
        }
    }
});

app.get("/api/crawl_imgs_post", async (req, res) => {
    const district = req.query.district;
    if (district === undefined) {
        return res.status(500).json({
            err: 'Missing district'
        });
    } else {
        try {
            const data = await crawl_image_post(district);
            return res.status(200).json({
                total: data.length,
                data
            })
        } catch (error) {
            return res.status(500).json({
                err: error.toString(),
            })
        }
    }
})

app.get("/api/crawl_extra_info", async (req, res) => {
    const district = req.query.district;
    if (district === undefined) {
        return res.status(500).json({
            err: 'Missing district'
        })
    } else {
        try {
            const data = await crawl_extra_info(district);
            return res.status(200).json({
                total: data.length,
                data
            })
        } catch (error) {
            return res.status(500).json({
                err: error.toString(),
            })
        }
    }
})

app.get("/api/crawl_phones", async (req, res) => {
    const district = req.query.district;
    if (district === undefined) {
        return res.status(500).json({
            err: 'Missing district'
        });
    } else {
        try {
            const data = await crawl_phone(district);
            return res.status(200).json({
                total: data.length,
                data
            })
        } catch (error) {
            return res.status(500).json({
                err: error.toString(),
            });
        }
    }
})

app.listen(PORT, () =>
    console.log(`The server is active and running on port http://localhost:${PORT}`)
);