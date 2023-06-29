const puppeteer = require('puppeteer');
const fs = require('fs');
const https = require('https');

const getID = link => {
    const arrTemp = link.split('/');
    const id = arrTemp[4].split(".");
    return id[0];
}

const crawl_image_post = async (district) => {
    const base = 'https://www.vieclamtot.com/' + district;
    const browser = await puppeteer.launch({ headless: true });
    let pageNumber = 1;

    //check if url is visible
    let isVisible = true;

    // store all data that has been scrawled
    const scrapedData = [];

    while (isVisible) {
        const url = base + '?page=' + pageNumber;
        const page = await browser.newPage();
        try {
            console.log(`Navigating to ${url}...`);
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 0 });
            // Get the link to all the jobs
            const urls = await page.$$eval('.AdItem_wrapperAdItem__S6qPH', links => {
                // Extract the links from the data
                return links.map(el => el.querySelector('a').href)
            });

            if (urls.length === 0) {
                console.log('////////////////////////////////');
                console.log('Data has been crawled');
                await browser.close();
                return scrapedData;
            }

            // loop through each link and get the details of post
            const promises = urls.map(async (link) => {
                console.log(`Crawling: ${link}...`);

                // store information about the post in object
                const dataObj = {};

                //store src of image
                const images = [];

                const newPage = await browser.newPage();
                await newPage.goto(link, {
                    waitUntil: "domcontentloaded"
                });

                dataObj.post_id = getID(link);

                //get number of div containing the image of post
                const numberImage = await newPage.$$eval('.AdImage_imageWrapper__j1z2m', elements => elements.length);

                //loop through number of images, get src image and click on previous button
                for (let i = 0; i < numberImage - 1; i++) {
                    console.log(`crawling div[data-index="${i}"] > div > div > div > div > span:nth-child(2) > img`);
                    try {
                        await newPage.waitForSelector(`div[data-index="${i}"] > div > div > div > div > span:nth-child(2) > img`, { timeout: 5000 });
                        const urlImage = await newPage.$eval(`div[data-index="${i}"] > div > div > div > div > span:nth-child(2) > img`, img => img.src);
                        images.push(urlImage);

                        // Click previous button
                        await newPage.click('.AdImage_button__ho9Jx ');
                        await newPage.waitForTimeout(1000);
                    } catch (e) {
                        console.error(e);
                    }
                }

                // remove duplicates and src contain 'base64'
                dataObj.src = [...new Set(images)].filter(el => !el.includes('base64'));

                // download image
                const dir = `./imgs/${dataObj.post_id}`;
                fs.mkdirSync(dir, { recursive: true });

                await Promise.all(dataObj.src.map(async (baseImage, index) => {
                    if (baseImage !== null) {
                        const file = fs.createWriteStream(`${dir}/image_${dataObj.post_id}_${index}.jpg`);
                        const request = https.get(baseImage, function (response) {
                            response.pipe(file);

                            // after download completed close filestream
                            file.on("finish", () => {
                                file.close();
                            });
                        });
                    }
                }));

                console.log('Completed');
                await newPage.close();
                return dataObj;
            });

            const currentPageData = await Promise.all(promises);
            scrapedData.push(...currentPageData);
            pageNumber += 1;
        } catch (e) {
            console.error(e);
            isVisible = !isVisible;
            await browser.close();
            return scrapedData;
        }
    }
}

module.exports = { crawl_image_post }