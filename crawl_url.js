const puppeteer = require('puppeteer');

const crawl_all_urls = async (district) => {
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
                return links.map(el => el.querySelector('a').href);
            });

            if (urls.length === 0) {
                console.log('////////////////////////////////');
                console.log('Data has been crawled');
                await browser.close();
                return scrapedData;
            }

            scrapedData.push(...urls);
            pageNumber += 1;
        } catch (e) {
            console.error(e);
            isVisible = !isVisible;
            await browser.close();
            return scrapedData;
        }
    }

}

module.exports = { crawl_all_urls };