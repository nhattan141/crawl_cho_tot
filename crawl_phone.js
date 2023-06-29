const puppeteer = require('puppeteer');
const fs = require('fs');
const https = require('https');

const getID = link => {
    const arrTemp = link.split('/');
    const id = arrTemp[4].split(".");
    return id[0];
}

const crawl_phone = async (district) => {
    const base = 'https://www.vieclamtot.com/' + district;
    let pageNumber = 1;
    const browser = await puppeteer.launch({ headless: true });

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
                isVisible = !isVisible;
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

                const newPage = await browser.newPage();
                await newPage.goto(link, {
                    waitUntil: "domcontentloaded"
                });

                dataObj.post_id = getID(link);
                // get phone number
                await newPage.waitForSelector('.ShowPhoneButton_wrapper__B627I', { timeout: 5000 }).catch(() => { });
                const show_phone_number_btn = await newPage.$('.ShowPhoneButton_wrapper__B627I');

                if (!show_phone_number_btn) {
                    dataObj.jobPhone = 'missing';
                } else {
                    await show_phone_number_btn.click();
                    await newPage.waitForSelector('.ShowPhoneButton_phoneClicked__IxuR6 > div', { timeout: 5000 }).catch(() => { });
                    dataObj.jobPhone = await newPage.$eval('.ShowPhoneButton_phoneClicked__IxuR6 > div > span', text => text.textContent).catch(() => { });
                }

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

module.exports = { crawl_phone };