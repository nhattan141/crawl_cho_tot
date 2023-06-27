const puppeteer = require('puppeteer');
const fs = require('fs');
const https = require('https');

const getID = link => {
    arrTemp = link.split('/');
    id = arrTemp[4].split(".");
    return id[0];
}

const crawl_image_post = async (district) => {
    const base = 'https://www.vieclamtot.com/tags/' + district
    let pageNumber = 1;
    let isVisible = true;

    let scrapedData = [];

    while (isVisible) {
        let url = base + '?page=' + pageNumber;
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        try {
            console.log(`Navigating to ${url}...`);
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 0 });
            // Get the link to all the jobs
            let urls = await page.$$eval('.AdItem_wrapperAdItem__S6qPH', links => {
                // Extract the links from the data
                links = links.map(el => el.querySelector('a').href)
                return links;
            });

            urls.forEach(async (url) => {
                const dataObj = {};

                let newPage = await browser.newPage();
                newPage.goto(url, { waitUntil: 'domcontentloaded' })

                dataObj.id = getID(base);

                imgs = await page.$$eval('.AdImage_imageWrapper__j1z2m > span:nth-child(2)', imgs => {
                    return imgs.map(el => el.querySelector('img').src);
                });

                dataObj.src = [...new Set(imgs)].filter(el => !el.includes('base64'));

                dataObj.src.forEach((baseImage, index) => {
                    let dir = `./imgs/${dataObj.id}`;

                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir);
                    }

                    if (baseImage !== null) {
                        const file = fs.createWriteStream(`${dir}/image_${dataObj.id}_${index}.jpg`);
                        const request = https.get(baseImage, function (response) {
                            response.pipe(file);

                            // after download completed close filestream
                            file.on("finish", () => {
                                file.close();
                            });
                        });
                    }
                });

            })

            if (urls.length === 0) {
                return scrapedData;
            }

            // console.log(scrapedData);
            pageNumber += 1;
        } catch (e) {
            isVisible = !isVisible;
            return scrapedData;
        }
    }
}
crawl_image_post("nhan-hang-gia-cong-ve-nha-lam");
// module.exports = { crawl_image_post };