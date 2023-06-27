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

    // while (isVisible) {
    let url = "https://www.vieclamtot.com/viec-lam-thanh-pho-thu-duc-tp-ho-chi-minh/106641530.htm";
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    // try {
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 0 });
    // Get the link to all the jobs
    // let urls = await page.$$eval('.AdItem_wrapperAdItem__S6qPH', links => {
    //     // Extract the links from the data
    //     links = links.map(el => el.querySelector('a').href)
    //     return links;
    // });

    // if (urls.length === 0) {
    //     isVisible = !isVisible;
    //     console.log('////////////////////////////////');
    //     console.log('Data has been crawled');
    //     console.log(scrapedData);
    //     return scrapedData;
    // }

    //loop through each link and get the details of post
    // let pagePromise = (link) => new Promise(async (resolve, reject) => {
    //     console.log(`Crawling: ${link}...`);

    // store information about the post in object
    let dataObj = {};

    // let newPage = await browser.newPage();
    // await newPage.goto(link, {
    //     waitUntil: "domcontentloaded"
    // });

    // dataObj.post_id = getID(link);
    //get phone number
    await new Promise(r => setTimeout(r, 1000));
    // await page.waitForSelector('.ShowPhoneButton_wrapper__B627I');
    const show_phone_number_btn = await page.$('.ShowPhoneButton_wrapper__B627I');
    // await new Promise((r) => setTimeout(r, 3000));

    if (!show_phone_number_btn) {
        dataObj['jobPhone'] = 'missing';
    } else {
        await show_phone_number_btn.click();
        await new Promise(r => setTimeout(r, 1000));
        await page.waitForSelector('.ShowPhoneButton_phoneClicked__IxuR6 > div')
        dataObj['jobPhone'] = await page.$eval('.ShowPhoneButton_phoneClicked__IxuR6 > div > span', text => text.textContent);
    }
    //             resolve(dataObj);
    //             console.log('Completed');
    //             await newPage.close();
    //         });

    //         for (link in urls) {
    //             let currentPageData = await pagePromise(urls[link]);
    //             scrapedData.push(currentPageData);
    //             // console.log(currentPageData);
    //         }
    //         pageNumber += 1;
    //     } catch (e) {
    //         isVisible = !isVisible;
    //         return scrapedData;
    //     }
    // }
    console.log(dataObj);
    await browser.close();
}
crawl_image_post("nhan-hang-gia-cong-ve-nha-lam");
// module.exports = { crawl_image_post };