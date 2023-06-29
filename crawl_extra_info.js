const puppeteer = require('puppeteer');

const getID = link => {
    const arrTemp = link.split('/');
    const id = arrTemp[4].split(".");
    return id[0];
}

const getExtraInfo = (page) => {
    return page.$$eval('.AdParam_adMediaParam__3epxo ', links => {
        let extraInfoObj = {};
        links.forEach(el => {
            let icons = el.querySelector('.media-left > img').alt;
            switch (icons) {
                case 'Hình thức trả lương':
                    icons = 'formSalary';
                    break;

                case 'Loại công việc':
                    icons = 'jobType';
                    break;
                case 'Ngành nghề':
                    icons = 'career';
                    break;
                case 'Kinh nghiệm':
                    icons = 'experience';
                    break;
                case 'Giới tính':
                    icons = 'sex';
                    break;
                case 'Tên công ty':
                    icons = 'companyName';
                    break;
                case 'Số lượng tuyển dụng':
                    icons = 'numberRecruitments';
                    break;
                case 'Các quyền lợi khác':
                    icons = 'otherBenefit';
                    break;
                case 'Học vấn tối thiểu':
                    icons = 'education';
                    break;
                case 'Chứng chỉ / kỹ năng':
                    icons = 'skills';
                    break;
                case 'Tuổi tối thiểu':
                    icons = 'minAge';
                    break;
                case 'Tuổi tối đa':
                    icons = 'maxAge';
                    break;
                default:
                    break;
            }
            const value = el.querySelector('.media-body > span > span:nth-child(2)').textContent;

            extraInfoObj[icons] = value;
        });
        return extraInfoObj;
    })
}

const crawl_extra_info = async (district) => {
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
            const urls = await page.$$eval('.AdItem_wrapperAdItem__S6qPH', links => {
                // Extract the links from the data
                return links.map(el => el.querySelector('a').href);
            });

            if (urls.length === 0) {
                isVisible = !isVisible;
                console.log('////////////////////////////////');
                console.log('Data has been crawled');
                // console.log(scrapedData);
                await browser.close();
                return scrapedData;
            }

            //loop through each link and get the details of post
            const pagePromises = urls.map(async (link) => {
                console.log(`Crawling: ${link}...`);

                // store information about the post in object
                let dataObj = {};

                let newPage = await browser.newPage();
                await newPage.goto(link, {
                    waitUntil: "domcontentloaded"
                });

                dataObj.post_id = getID(link);

                dataObj.extraInfo = await getExtraInfo(newPage);

                await newPage.close();

                console.log('Completed');
                return dataObj;
            });

            const currentPageData = await Promise.all(pagePromises);
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

module.exports = { crawl_extra_info };