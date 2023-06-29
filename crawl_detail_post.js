const puppeteer = require('puppeteer');

const getID = link => {
    arrTemp = link.split('/');
    id = arrTemp[4].split(".");
    return id[0];
}

const crawl_detail_post = async (district) => {
    const base = 'https://www.vieclamtot.com/' + district
    const browser = await puppeteer.launch({ headless: true });
    let pageNumber = 1;
    //check if url is visible
    let isVisible = true;

    // store all data that has been scrawled
    let scrapedData = [];

    while (isVisible) {
        let url = base + '?page=' + pageNumber;
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
                await browser.close();
                return scrapedData;
            }

            //loop through each link and get the details of post
            let pagePromise = (link) => new Promise(async (resolve, reject) => {
                console.log(`Crawling: ${link}...`);

                // store information about the post in object
                let dataObj = {};

                let newPage = await browser.newPage();
                await newPage.goto(link, {
                    waitUntil: "domcontentloaded"
                });

                dataObj['id'] = getID(link);
                dataObj['url'] = link;
                dataObj['jobTitle'] = await newPage.$eval('h1.AdDecription_adTitle__AG9r4', text => text.textContent);
                dataObj['jobSalary'] = await newPage.$eval('.AdDecription_price__L2jjH > span', text => text.textContent);
                dataObj['companyName'] = await newPage.$eval('.RecruiterInformation_companyName__mciU7 > div', text => text.textContent);
                dataObj['jobAddress'] = await newPage.$eval('.fz13', text => text.textContent);
                dataObj['logo'] = await newPage.$eval('.RecruiterInformation_RecuiterInforWrapper__W_ane > div > span > img', img => img.src);
                dataObj['jobDetail'] = await newPage.$eval('.AdDecription_adBody__qp2KG', text => text.textContent);
                dataObj['recruiter'] = await newPage.$eval('.SellerProfile_nameDiv__sjPxP', text => text.textContent);

                //get avatar of recruiter
                const avatar = await newPage.$('.SellerProfile_sellerWrapper__GlDwe > div > span > img');
                if (!avatar) {
                    dataObj['recruiterAvatar'] = 'missing';
                } else {
                    dataObj['recruiterAvatar'] = await newPage.$eval('.SellerProfile_sellerWrapper__GlDwe > div > span > img', img => img.src);
                }

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
            await browser.close();
            return scrapedData;
        }
    }

}

module.exports = { crawl_detail_post }