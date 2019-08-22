const Nightmare = require('nightmare');
const nightmare = Nightmare({ show: true, width: 1280, height: 800 });
const moment = require('moment');
const util = require('util');
const fs = require('fs');

//將 MySQL 連線物件的 query 與 end 方法非同步化
const pool = require('../../modules/db_104');
pool.query = util.promisify(pool.query);
pool.end = util.promisify(pool.end);

//將 fs 相關功能非同步化 (可以使用 await)
const mkdir = util.promisify(fs.mkdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

//引入 jQuery 機制
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const $ = require('jquery')(window);

//關鍵字
let strKeyword = '清潔工';

//放置影音重要資訊的全域變數 (陣列)
var arrLink = [];

//瀏覽器標頭，讓對方得知我們是人類，而非機器人 (爬蟲)
const headers = {
    'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
    'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
    'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
};

//讓程式休息一下，作為瀏覽器執行下一個動作前的緩衝
async function pause(seconds) {
    console.log('Take a break...');
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve("Go!");
        }, seconds * 1000 ); //這裡的參數為毫秒，所以需要乘上 1000
    });
}

//進行檢索
async function searchKeyword(){
    console.log('Ready to search...');
    
    //輸入關鍵字，選擇地區，再按下搜尋
    await nightmare
    .goto('https://www.104.com.tw', headers)
    .type('input#ikeyword', strKeyword) //輸入關鍵字
    .wait(2000) //等待數秒…
    .click('span#icity') //按下「地區」
    .wait(1000) //等待數秒...
    .click('input#e104menu2011_m_cb_0_0') //點選「台北市」
    .wait(1000) //等待數秒...
    .click('input#e104menu2011_m_cb_0_1') //點選「新北市」
    .wait(1000) //等待數秒...
    .click('input.e104menu2011_but') //按下「確定」
    .wait(2000) //等待數秒...
    .click('button.js-formCheck') //按下「搜尋」
    .catch(error => {
        console.error('Search failed: ', error)
    });
}

//選擇全職、兼職等選項
async function setJobType(){
    console.log('Choose your location...');

    await nightmare
    .click('ul#js-job-tab > li[data-value="1"]') //點選「全職」
    .catch(error => {
        console.error('setJobType failed: ', error)
    });
}

//滾動頁面，將動態資料逐一顯示出來
async function scrollPage(){
    console.log('Ready to scroll...');

    let previousHeight = 0; //先前偏移的高度
    let currentHeight = 0; //目前的高度
    let offset = 0; //總偏移量

    //不斷地 scroll down，直到沒有辦法再往下捲動
    while(offset <= currentHeight) {
        previousHeight = offset;
        currentHeight = await nightmare.evaluate(() => {
            return document.documentElement.scrollHeight;
        });
        offset += 500;
        await nightmare.scrollTo( offset, 0 ).wait(500);
        
        console.log('previousHeight = ' + previousHeight + ', currentHeight = ' + currentHeight + ', offset = ' + offset);
        
        // if(offset > 500) break; //強迫跳出迴圈，視情況使用
        
        //接近底部時，按下一頁
        if( (currentHeight - offset) < 2000 && await nightmare.exists('button.b-btn.b-btn--link.js-more-page') ) {
            await _checkPagination();
        }
    }
}

//按「下一頁」
async function _checkPagination(){
    await nightmare
    .wait('button.b-btn.b-btn--link.js-more-page')
    .click('button.b-btn.b-btn--link.js-more-page');
}

//分析、整理、收集重要資訊
async function parseHtml(){
    console.log('Ready to parse metadata/elements ...');

    //取得滾動後，得到動態產生結果的 html 元素，這裡很重要，因為裡面有需要的元素，例如歌名、播放長度等資訊
    let html = await nightmare.evaluate(() => {
        return document.documentElement.innerHTML;
    });

    //將重要資訊放到陣列中，以便後續儲存；下面範例，將使用正規表達式來擷取我們想要的資訊
    $(html)
    .find('div#js-job-content article')
    .each((index, element) => {
        //找到主要資訊的網頁區塊
        let elm = $(element).find('div.b-block__left');

        let obj = {}; //儲放主要資訊的物件

        //將網頁元素的資訊帶入變數
        let position = elm.find('h2.b-tit a.js-job-link').text();
        let positionLink = 'https:' + elm.find('h2.b-tit a.js-job-link').attr('href');
        let location = elm.find('ul.b-list-inline.b-clearfix.job-list-intro.b-content li:eq(0)').text();
        let companyName = elm.find('ul.b-list-inline.b-clearfix li a').text().trim();
        let companyLink = 'https:' + elm.find('ul.b-list-inline.b-clearfix li a').attr('href');
        let category = elm.find('ul.b-list-inline.b-clearfix li:eq(2)').text();

        //將變數值帶入物件屬性當中
        obj.keyword = strKeyword;
        obj.position = position;
        obj.positionLink = positionLink;
        obj.location = location;
        obj.companyName = companyName;
        obj.companyLink = companyLink;
        obj.category = category;

        //收集、整理各個擷取到的元素資訊，到整理資料用的陣列變數中
        arrLink.push(obj);
    });
}

//寫入 json 資料
async function writeJson(){
    //建立資料夾
    await mkdir('output', {recursive: true});

    //將物件轉成 json 格存，儲存檔案
    await writeFile('output/104.json', JSON.stringify(arrLink, null, 2));
}

//儲存三國人物 json 資料到資料庫
async function saveToDb(){
    let strJson = await readFile('output/104.json');
    let arrJson = JSON.parse(strJson);
    for(let i = 0; i < arrJson.length; i++){
        let arr = [
            arrJson[i].keyword,
            arrJson[i].position,
            arrJson[i].positionLink,
            arrJson[i].location,
            arrJson[i].companyName,
            arrJson[i].companyLink,
            arrJson[i].category
        ];
        await pool.query('INSERT INTO `jobs` (`keyword`, `position`, `positionLink`, `location`, `companyName`, `companyLink`, `category`) values (?,?,?,?,?,?,?)', arr)
        .then((results) => {
            console.log(`${(new moment().format("YYYY-MM-DD HH:mm:ss"))} [${results.insertId}] 的資料 新增 完成。`);
        }).catch((err) => {
            console.error(err);
            console.log(`失敗原因: ${err.code}`);
            console.log(`失敗訊息: ${err.sqlMessage}`);
            console.log();
        });
    }
}

//關閉相關的功能
async function close() {
    //因為我們已經將相關資訊儲存到資料庫，所以可以在這裡先關閉瀏覽器
    await nightmare.end((err) => {
        if(err) throw err;
        console.log('Nightmare is close.');
    });

    //關閉資料庫連線
    await pool.end((err) => {
        if(err) throw err;
        console.log('Database is close.');
    });
}

//照順序執行各個函式
async function asyncArray(functionsList) {
    for(let func of functionsList){
        await func();
    }
}

//主程式區域
try {
    asyncArray([searchKeyword, setJobType, scrollPage, parseHtml, writeJson, saveToDb, close]).then(async () => {
        console.log('Done');     
    });
} catch (err) {
    console.log('try-catch: ');
    console.dir(err, {depth: null});
}