/**
 * 目的: 
 * 分析靜態網頁元素，結合 jQuery 套件與 Regular Expression 的技巧，來分析與擷取 Wine-Searcher 網站
 * 有關紅/白酒歷史價格的資訊，並進行簡單線性廻歸的圖表輸出。
 * 
 * 工具簡介:
 * [fs]
 * 檔案系統，用來讀寫檔案的工具
 * 
 * [util]
 * Node.js 的輔助工具
 * 
 * [moment]
 * 用來顯示、分析、驗證、操作、計算日期時間的工具
 * 
 * [exec]
 * Node.js 執行指令的工具
 * 
 * [jsdom]
 * 在 Node.js 裡頭操作 DOM 元件的工具，
 * 因為 jQuery 需要視窗元件才能在後端環境作業，
 * 所以借用 jsdom 當中的 window，讓 jQuery 能夠產生作用
 * 
 * [jQuery]
 * 前端環境操作 HTML 元素的工具，
 * 借用 jsdom 的視窗元件，達到在後端環境作業的目的
 */

const fs = require('fs');
const util = require('util');
const moment = require('moment');

//將 exec 非同步化 (可以使用 await，以及 .then, .catch)
const exec = util.promisify(require('child_process').exec);

//引入 jQuery 機制
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const $ = require('jquery')(window);

//瀏覽器標頭，讓對方得知我們是人類，而非機器人 (爬蟲)
const headers = {
    'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
    'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
    'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
};

//走訪網址
let arrUrl = [
    'https://www.wine-searcher.com/find/screaming+eagle+cab+sauv+napa+valley+county+north+coast+california+usa/1992/taiwan#t3',
    'https://www.wine-searcher.com/find/latour+pauillac+medoc+bordeaux+france/2006/taiwan#t3'
];

//建立一個名為 func 的 async fucntion，參數是 url
async function func(url) {
    //透過 curl 指令走訪 url 指定網址
    await exec(`curl ${url} -H "User-Agent: ${headers['User-Agent']}" -H "Accept-Language: ${headers['Accept-Language']}" -H "Accept: ${headers.Accept}"`)  
    .then(async (result) => {
        //放置主要資訊變數 (陣列)
        let arrLink = [];

        //取得 html (then 回傳回來的是物件，物件的屬性 stdout 才是 html 字串)
        let html = result.stdout;

        //取得貼圖的主要名稱，用來建立資料夾
        //註: .trim() 是去除字串兩側的空白
        let title = $(html).find('h1#top_header.wine').text().trim();

        console.log(`酒的名稱: ${title}`);

        //找出酒的名稱
        let pattern = /https:\/\/www\.wine-searcher\.com\/find\/(\+?[a-z+]+)\/(1[0-9]{3}|20[0-9]{2})\/taiwan#t3/g;
        let arrMatch = null;
        let strJsonFileName = ''; //json 檔案的名稱

        if((arrMatch = pattern.exec(url)) !== null){
            /**
             * arrMatch 內容: 
             * [ 'https://www.wine-searcher.com/find/screaming+eagle+cab+sauv+napa+valley+county+north+coast+california+usa/1992/taiwan#t3',
             *   'screaming+eagle+cab+sauv+napa+valley+county+north+coast+california+usa',
             *   '1992',
             *   index: 0,
             *   input: 'https://www.wine-searcher.com/find/screaming+eagle+cab+sauv+napa+valley+county+north+coast+california+usa/1992/taiwan#t3',
             *   groups: undefined ]
             */

             //先將 'screaming+eagle+cab+sauv+napa+valley+county+north+coast+california+usa' 字串帶到變數中
            strJsonFileName = arrMatch[1]; 
            
            //將上述字串當中的 + 號取代為 _
            strJsonFileName = strJsonFileName.replace(/\+/g, '_'); 

            //將後面的年份用 _ 與字串連結，例如 screaming_eagle_cab_sauv_napa_valley_county_north_coast_california_usa_1992
            strJsonFileName = strJsonFileName + '_' + arrMatch[2]; 
        }

        // //資料夾不存在，就馬上建立
        if (! await fs.existsSync('output') ){ 
            await fs.mkdirSync('output'); //建立資料夾
        }

        // //資料夾名稱
        let dir = `output/${strJsonFileName}`;

        // //若沒資料夾，則直接建立 (註: existsSync、mkdirSync 與 exists、mkdir 的差異，在於有 sync 字眼的函式，不需要 callback)
        if (! await fs.existsSync(dir) ){ 
            await fs.mkdirSync(dir); //建立資料夾
        }

        // //分析資料內容
        let strChartData = ''; //價格 json 的文字資料
        let dataChartData = {}; //將 json 轉成物件型態
        let arrMain = []; //放置價格物件的陣列
        let dateTime = ''; //放置日期時間
        let price = 0; //價格

        //取得圖表當中，字串化後的物件內容
        strChartData = $(html).find('div#hst_price_div_detail_page.card-graph').attr('data-chart-data');

        //將 json 字串轉為物件，以便程式運用
        dataChartData = JSON.parse(strChartData);
        arrMain = dataChartData.chartData.main;
        for(let arr of arrMain){
            /**
             * arr[0]: 時間戳記
             * arr[1]: 價格 (預設為美金)
             */

            //將時間戳記轉為日期時間
            //註: 有些系統或程式語言(包括 wine searcher)，時間戳記預設為 13 位數 (毫秒)，有些是 10 位數 (秒)。
            //我們將以 10 位數計算，所以除以 1000
            dateTime = moment.unix(parseInt(arr[0]) / 1000).format("YYYY-MM-DD");

            //價格。Math.round() 是指四捨五入
            //參考: http://www.eion.com.tw/Blogger/?Pid=1173
            price = Math.round(arr[1]); 
            
            console.log(`年月日: ${dateTime}`);
            console.log(`價格(美金): ${price} 元, 換算新台幣約為: ${price * 31} 元\n`);
            // console.log(); //這裡縱然沒有文字輸出，也會換行，或是在字串後面加上「\n」

            //整理資訊
            arrLink.push({
                'dateTime': dateTime,
                'price_us': price,
                'price_tw': (price * 31)
            });
        }

        return {title, strJsonFileName, arrLink}; //兩個大括號，回傳的是物件喔!!
    })
    .then(async (obj) => {
        // //將物件轉成 json 格存，儲存檔案
        await fs.writeFileSync('output/' + obj.strJsonFileName + '/price-history.json', JSON.stringify(obj.arrLink, null, 2));
    })
    .catch((err) => {
        console.log(`錯誤訊息如下：`);
        console.error(err);
    });
};

//將 arrUrl 帶進函式，迭代執行自訂函式
async function run(arrList){
    for(let url of arrList){
        /**
         * 概念:
         * for (let value of array) ，所取得的是陣列的「值」
         * for (let index in array) ，所取得的是陣列的「索引」，無論是 row key 或是 associated key 
         */
        await func(url);
    }
}

//主程式區域
try {
    run(arrUrl).then(async () => {
        console.log('Done');
    });
} catch(err) {
    console.error(err);
}
