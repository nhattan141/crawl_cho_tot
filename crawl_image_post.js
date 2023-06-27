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

    //check if url is visible
    let isVisible = true;

    // store all data that has been scrawled
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

            if (urls.length === 0) {
                console.log('////////////////////////////////');
                console.log('Data has been crawled');
                return scrapedData;
            }

            //loop through each link and get the details of post
            let pagePromise = (link) => new Promise(async (resolve, reject) => {
                console.log(`Crawling: ${link}...`);

                // store information about the post in object
                let dataObj = {};

                //store src of image
                let images = [];

                let newPage = await browser.newPage();
                await newPage.goto(link, {
                    waitUntil: "domcontentloaded"
                });

                dataObj.post_id = getID(link);

                //get number of div containing the image of post
                const numberImage = await newPage.$$('.AdImage_imageWrapper__j1z2m');

                //loop through number of images, get src image and click on previous button
                for (let i = 0; i < numberImage.length - 1; i++) {
                    console.log(`crawling div[data-index="${i}"] > div > div > div > div > span:nth-child(2) > img`);
                    try {
                        await newPage.waitForSelector(`div[data-index="${i}"] > div > div > div > div > span:nth-child(2) > img`)
                        const urlImage = await newPage.$eval(`div[data-index="${i}"] > div > div > div > div > span:nth-child(2) > img`,
                            img => img.src
                        );
                        images.push(urlImage);

                        // Click previous button
                        await newPage.click('.AdImage_button__ho9Jx ')
                        await new Promise(r => setTimeout(r, 1000));
                    } catch (e) {
                        console.log(e);
                        return images;
                    }
                    console.log("////////////////////////////////");
                }

                // remove duplicates and src contain 'base64'
                images = [...new Set(images)].filter(el => !el.includes('base64'));

                dataObj.src = images;

                // download image
                dataObj.src.forEach((baseImage, index) => {
                    let dir = `./imgs/${dataObj.post_id}`;

                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir);
                    }

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
                });

                resolve(dataObj);
                console.log('Completed');
                await newPage.close();
            });

            for (link in urls) {
                let currentPageData = await pagePromise(urls[link]);
                scrapedData.push(currentPageData);
                // console.log(currentPageData);
            }

            pageNumber += 1;
        } catch (e) {
            isVisible = !isVisible;
            return scrapedData;
        }
    }

    await browser.close();
}

module.exports = { crawl_image_post }