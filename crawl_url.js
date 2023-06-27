const puppeteer = require('puppeteer');

const crawl_all_urls = async (district) => {
    const base = 'https://www.vieclamtot.com/' + district
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

            scrapedData.push(urls);
            // console.log(scrapedData);
            pageNumber += 1;
        } catch (e) {
            isVisible = !isVisible;
            return scrapedData;
        }
    }

    await browser.close();
}

module.exports = { crawl_all_urls }