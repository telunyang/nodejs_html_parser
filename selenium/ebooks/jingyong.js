/** 
 * Selenium api for javascript
 * Ref: https://seleniumhq.github.io/selenium/docs/api/javascript/
 * 
 * SheetJS js-xlsx (npm i xlsx --save)
 * Ref: https://www.npmjs.com/package/xlsx
 * 
 * Selenium Dev
 * Ref: https://selenium.dev/documentation/en/
 * 
 * */

//
const util = require('util');
const fs = require('fs');
const XLSX = require('xlsx');

//引入 jQuery 機制
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const $ = require('jquery')(window);

//引入 selenium 功能
const {Builder, By, Key, until, Capabilities} = require('selenium-webdriver');

//使用設定 chrome options
const chromeCapabilities = Capabilities.chrome();
const chromeOptions = {
    'args': [
        'User-Agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36"',
        'Accept="text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9"',
        'Accept-Language="zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7"'
    ]
};
chromeCapabilities.set('chromeOptions', chromeOptions);
// const driver = new Builder().withCapabilities(chromeCapabilities).build();

//將 fs 功能非同步化
const existsSync = fs.existsSync;
const mkdirSync = fs.mkdirSync;
const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);

//自訂變數
const urlOrigin = "https://www.bookwormzz.com";
const url = urlOrigin + '/zh/';
const pathProject = `C:\\Users\\Owner\\Documents\\repo\\Nodejs-Html-Parser\\`; //專案路徑
let arrLink = [];

//初始化設定
async function init() {
    try{
        //output 資料夾不存在，就馬上建立
        if ( !existsSync(`${pathProject}\\output`) ){ 
            mkdirSync(`${pathProject}\\output`); //建立資料夾
        }

        //download 資料夾不存在，就馬上建立
        if ( !existsSync(`${pathProject}\\downloads`) ){ 
            mkdirSync(`${pathProject}\\downloads`); //建立資料夾
        }

        //視窗放到最大
        // await driver.manage().window().maximize();        
    } catch (err) {
        throw err;
    }
}

//進入初始頁面
async function goToUrl(){
    try {
        await driver.get(url);
    } catch (err) {
        throw err;
    }
}

//滾動網頁
async function scrollPage(){
    try {
        let innerHeightOfWindow = 0;
        let totalOffset = 0;
        let sleepingMilliSecond = 1000 * 1;
        while(totalOffset <= innerHeightOfWindow) {
            totalOffset += 300;
            await driver.executeScript(`
            (
                function (){
                    window.scrollTo({ 
                        top: ${totalOffset}, 
                        behavior: "smooth" 
                    });
                }
            )();
            `);
            innerHeightOfWindow = await driver.executeScript(`return window.innerHeight;`);
            console.log(`totalOffset: ${totalOffset}, innerHeightOfWindow: ${innerHeightOfWindow}`);
            await driver.sleep(sleepingMilliSecond);
            if( totalOffset > 600 ){
                return false;
            }
        }
    } catch (err) {
        throw err;
    }
}

//整合所有小說主要名稱
async function getNovelTitles(){
    try {
        //等待元素讀取完畢
        await driver.wait(until.elementLocated({css: 'div.epub ul[data-role="listview"] li a'}), 10000 );

        let html = await driver.getPageSource(); //取得所有 a link 的 html 字串
        let obj = {}; //暫存資料用的物件
        let strTmp = ''; //使用 regex 時，暫存文字的變數
        let pattern = /\.\.\//g;

        //整合 href 的連結，並加上真實的目錄連結
        $(html).find('a[data-ajax="false"]').each((index, element) => {
            strTmp = $(element).attr('href');
            strTmp = strTmp.replace(pattern, '');
            obj.url = `${urlOrigin}/${strTmp}#book_toc`;
            obj.title = $(element).text();
            obj.links = [];
            arrLink.push(obj);
            obj = {};
        });
    } catch (err){
        throw err;
    }
}

//取得所有文章的連結
async function getNovelLinks(){
    let html = '';
    let objLink = {}; //暫存資料用的物件

    for(let obj of arrLink){
        //走訪實際連結頁面
        await driver.get(obj.url);

        //等待小說連結完整顯示在網頁上
        await driver.wait(until.elementLocated({css: 'div[data-role="content"] > div > ul'}), 3000)
        .catch((err) => {
            return false;
        })

        //取得小說連結
        html = await driver.getPageSource(); //取得所有 a link 的 html 字串
        
        //整合 href 的連結，並加上真實的目錄連結
        $(html).find('a.ui-link').each((index, element) => {
            strTmp = $(element).attr('href');
            objLink.url = `${urlOrigin}${strTmp}`;
            objLink.title = $(element).text();
            objLink.content = null;
            obj.links.push(objLink);
            objLink = {};
        });

        await driver.sleep(500);
    }
}

//讀取每一篇小說的內文
async function getNovelContent(){
    let html = '';
    let strTmp = '';
    let pattern = /\s|\r\n|\n/g;

    for(let obj of arrLink){
        for(let objLink of obj.links){
            //走訪實際連結頁面
            await driver.get(objLink.url);

            //等待小說連結完整顯示在網頁上
            await driver.wait(until.elementLocated({css: 'div#html[data-role="content"]'}), 3000)
            .catch((err) => {
                return false;
            })

            //取得小說連結
            html = await driver.getPageSource(); //取得所有 a link 的 html 字串
            
            //
            strTmp = $(html).find('div#html[data-role="content"] div:eq(0)').text();

            //
            objLink.content = strTmp.replace(pattern, '');
        
            await driver.sleep(500);
        }
    }
}

//
async function writeTxt(){
    try {
        let strJson = await readFile(`${pathProject}\\output\\jingyong.json`);
        arrLink = JSON.parse(strJson);
        let strFileName = '';
        let pattern = /\/|,|\(|\)|\.txt|—|\s|:|\./g;
        let count = 1;
        for(let obj of arrLink){
            for(let objLink of obj.links){
                if( objLink.content === "" ) continue;
                strFileName = `${obj.title}_${objLink.title}`; //將檔案名稱串接起來
                strFileName = strFileName.replace(pattern, ''); //去除不需要的文字
                strFileName = `jingyong_${strFileName}.txt`; //加上副檔名

                //印出檔案，檢視結果
                console.log(`[${count}] ${strFileName}`); 
                count++;

                //若檔案不存在，則新增檔案，同時寫入內容
                if(!existsSync(`${pathProject}\\downloads\\${strFileName}`)){
                    await writeFile(`${pathProject}\\downloads\\${strFileName}`, objLink.content);
                }
            }
        }
    } catch (err) {
        throw err;
    }
}

//將 excel 檔案特定內容取出後，以 json 格式儲存
async function xlsxToJson(){
    try{
        let workbook = XLSX.readFile(`${xlsxPath}\\JournalHomeGrid.xlsx`); //讀取 excel 並建立物件
        let worksheet = workbook.Sheets[ workbook.SheetNames[0] ]; //取得 excel 第 1 個 sheet
        let range = XLSX.utils.decode_range(worksheet['!ref']); //取得 excel 所有表格的範圍 eg. { s: { c: 0, r: 0 }, e: { c: 7, r: 93 } }
        let str = '';
        for(let rowNum = range.s.r; rowNum <= range.e.r; rowNum++){
            if(rowNum < 3 || rowNum > (range.e.r - 2) ) continue;
            cell = worksheet[ XLSX.utils.encode_cell({r: rowNum, c: 1}) ];
            // console.log(cell.v);
            str = cell.v;
            str = str.trim();
            arrJournals.push(str);
        }
        
    } catch(err){
        throw err;
    }
}

//關閉 chrome
async function close(){
    await driver.quit();
}

//照順序執行各個函式
async function asyncArray(functionsList) {
    for(let func of functionsList){
        await func();
    }
}

//主程式區域
try {
    asyncArray([
        // init,
        // goToUrl,
        // scrollPage,
        // getNovelTitles,
        // getNovelLinks,
        // getNovelContent,
        writeTxt,
        // close
    ]).then(async () => {
        // await writeFile( 'output\\jingyong.json', JSON.stringify(arrLink, null, 4) );
        console.log('Done');     
    });
} catch (err) {
    console.log('try-catch: ');
    console.dir(err, {depth: null});
}