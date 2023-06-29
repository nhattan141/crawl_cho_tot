const puppeteer = require('puppeteer');

const getID = link => {
    const arrTemp = link.split('/');
    const id = arrTemp[4].split(".");
    return id[0];
}

const crawl_detail_post = async (district) => {
    const base = `https://www.vieclamtot.com/${district}`;
    const browser = await puppeteer.launch({ headless: true });
    let pageNumber = 1;

    // store all data that has been crawled
    const scrapedData = [];

    while (true) {
        const url = `${base}?page=${pageNumber}`;
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
                break;
            }

            const pagePromises = urls.map(async (link) => {
                console.log(`Crawling: ${link}...`);

                const newPage = await browser.newPage();
                await newPage.goto(link, { waitUntil: "domcontentloaded" });

                const dataObj = {};
                dataObj.id = getID(link);
                dataObj.url = link;

                const [
                    jobTitle,
                    jobSalary,
                    companyName,
                    jobAddress,
                    logo,
                    jobDetail,
                    recruiter,
                    recruiterAvatar
                ] = await Promise.all([
                    newPage.$eval('h1.AdDecription_adTitle__AG9r4', text => text.textContent),
                    newPage.$eval('.AdDecription_price__L2jjH > span', text => text.textContent),
                    newPage.$eval('.RecruiterInformation_companyName__mciU7 > div', text => text.textContent),
                    newPage.$eval('.fz13', text => text.textContent),
                    newPage.$eval('.RecruiterInformation_RecuiterInforWrapper__W_ane > div > span > img', img => img.src),
                    newPage.$eval('.AdDecription_adBody__qp2KG', text => text.textContent),
                    newPage.$eval('.SellerProfile_nameDiv__sjPxP', text => text.textContent),
                    newPage.$eval('.SellerProfile_sellerWrapper__GlDwe > div > span > img', img => img.src).catch(() => 'missing')
                ]);

                dataObj.jobTitle = jobTitle;
                dataObj.jobSalary = jobSalary;
                dataObj.companyName = companyName;
                dataObj.jobAddress = jobAddress;
                dataObj.logo = logo;
                dataObj.jobDetail = jobDetail;
                dataObj.recruiter = recruiter;
                dataObj.recruiterAvatar = recruiterAvatar;

                console.log('Completed');
                await newPage.close();
                return dataObj;
            });

            const currentPageData = await Promise.all(pagePromises);
            scrapedData.push(...currentPageData);
            pageNumber += 1;
        } catch (error) {
            console.error(error);
        }
    }

    await browser.close();
    return scrapedData;
}

module.exports = { crawl_detail_post };