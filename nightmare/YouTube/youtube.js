/**
 * 目的: 
 * 走訪、取得 YouTube 的元素，並加以分析，必要時，可以下載來檢視結果
 * 
 * 工具簡介:
 * [nightmare]
 * 用來運作瀏覽器行為的工具，例如按下超連結、網頁換頁、滾動捲軸等
 * 
 * [jsdom]
 * 在 Node.js 裡頭操作 DOM 元件的工具，
 * 因為 jQuery 需要視窗元件才能在後端環境作業，
 * 所以借用 jsdom 當中的 window，讓 jQuery 能夠產生作用
 * 
 * [jQuery]
 * 前端環境操作 HTML 元素的工具，
 * 借用 jsdom 的視窗元件，達到在後端環境作業的目的
 * 
 * [moment]
 * 用來顯示、分析、驗證、操作、計算日期時間的工具
 * 
 * [mysql]
 * MySQl 的驅動元件，可以透過 Raw SQL statement 來達到 CRUD 的目的
 * 
 * [util]
 * Node.js 的輔助工具
 * 
 * [exec]
 * Node.js 執行指令的工具
 * 
 * [fs]
 * 檔案系統，用來讀寫檔案的工具
 */

const Nightmare = require('nightmare');
const nightmare = Nightmare({ show: true });
const moment = require('moment');
const util = require('util');
const fs = require('fs');

//將 exec 非同步化 (可以使用 await)
const exec = util.promisify(require('child_process').exec);

//將 MySQL 連線物件的 query 與 end 方法非同步化
const pool = require('../../modules/db_youtube');
pool.query = util.promisify(pool.query);
pool.end = util.promisify(pool.end);

//引入 jQuery 機制
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const $ = require('jquery')(window);

//關鍵字
const strSinger = '張學友';

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

//進行歌手檢索
async function search(){
    console.log('Ready to search...');
    
    //輸入關鍵字
    await nightmare
    .goto('https://www.youtube.com/', headers)
    .type('input[id="search"]', strSinger)
    .click('button#search-icon-legacy')
    .catch(error => {
        console.error('Search failed: ', error)
    });

    //讓程式休息一下
    await pause(3).then((str) => { console.log(str); });
}

//設定篩選條件
async function filter(){
    //按下篩選器
    await nightmare
    .wait('yt-formatted-string#text.style-scope.ytd-toggle-button-renderer.style-text') //等待篩選器(Filter)出現在網頁上
    .click('yt-formatted-string#text.style-scope.ytd-toggle-button-renderer.style-text') //按下篩選器
    .catch(error => {
        console.error('Entering filter failed: ', error)
    })

    //讓程式休息一下
    await pause(3).then((str) => { console.log(str); });

    //透過 jQuery 來操作當前的網頁的元素(搜尋結果 - 列表頁)
    let html = await nightmare
    .evaluate(() => {
        return document.documentElement.innerHTML;
    }).catch(error => {
        console.error('Getting result failed: ', error)
    });;

    //取得篩選器中的視訊(Video)文字連結
    let linkOfVideoInFilter = $(html)
    .find('div#collapse-content > ytd-search-filter-group-renderer.style-scope.ytd-search-sub-menu-renderer')
    .find('a#endpoint:contains("Video"), a#endpoint:contains("視訊")').attr('href');
    linkOfVideoInFilter = 'https://www.youtube.com' + decodeURIComponent(linkOfVideoInFilter);

    //前往篩選器中的視訊(Video)文字連結，並取得完整的 html 資料
    html = await nightmare
    .goto(linkOfVideoInFilter, headers)
    .wait('yt-formatted-string#text.style-scope.ytd-toggle-button-renderer.style-text')
    .click('yt-formatted-string#text.style-scope.ytd-toggle-button-renderer.style-text')
    .evaluate(() => {
        return document.documentElement.innerHTML;
    })
    .catch(error => {
        console.error('Going to [Video] link failed: ', error)
    });

    //讓程式休息一下
    await pause(5).then((str) => { console.log(str); });

    // //取得篩選器中的觀看次數(View count)連結
    // let linkOfViewCountInFilter = $(html)
    // .find('div#collapse-content > ytd-search-filter-group-renderer.style-scope.ytd-search-sub-menu-renderer')
    // .eq(4).find('a#endpoint').eq(2).attr('href');
    let linkOfViewCountInFilter = $(html)
    .find('div#collapse-content > ytd-search-filter-group-renderer.style-scope.ytd-search-sub-menu-renderer')
    .find('a#endpoint:contains("觀看次數"), a#endpoint:contains("View count")')
    .attr('href');
    linkOfViewCountInFilter = 'https://www.youtube.com' + decodeURIComponent(linkOfViewCountInFilter);

    //前往篩選器中的觀看次數(View count)連結，
    await nightmare
    .goto(linkOfViewCountInFilter, headers)
    .catch(error => {
        console.error('Going to [View Count] link failed: ', error)
    });
}

//滾動頁面，將動態資料逐一顯示出來
async function scroll(){
    console.log('Ready to scroll...');

    await pause(2); //休息數秒

    let previousHeight = 0; //先前偏移的高度
    let currentHeight = 0; //目前的高度
    let offset = 0; //總偏移量

    //不斷地 scroll down，直到沒有辦法再往下捲動
    while(offset <= currentHeight) {
        previousHeight = offset;
        currentHeight = await nightmare.evaluate(() => {
            return document.documentElement.scrollHeight; //回傳瀏覽器當前已滾動的高度
        });

        //每次滾動 500 單位的距離。offset 需要累加，才能對應到合適的距離
        offset += 500;
        await nightmare.scrollTo( offset, 0 ).wait(500);
        
        //列出當前瀏覽器滾動的程度
        console.log('previousHeight = ' + previousHeight + ', currentHeight = ' + currentHeight + ', offset = ' + offset);
        
        if(offset > 500) break; //滾動一段高度後，強迫跳出迴圈，視情況使用
    }
}

//分析、整理、收集重要資訊
async function parse(){
    console.log('Ready to parse metadata/elements of YouTube video pages...');

    //取得滾動後，得到動態產生結果的 html 元素，這裡很重要，因為裡面有需要的元素，例如歌名、播放長度等資訊
    let html = await nightmare.evaluate(() => {
        return document.documentElement.innerHTML;
    });

    //將重要資訊放到陣列中，以便後續儲存；下面範例，將使用正規表達式來擷取我們想要的資訊
    $(html)
    .find('div#contents.style-scope.ytd-item-section-renderer ytd-video-renderer.style-scope.ytd-item-section-renderer')
    .each((index, element) => {
        let pattern = null;
        let arrMatch = null;
        let obj = {}; //儲放主要資訊的物件
        
        //縮圖連結 & 影片 ID
        let linkOfImage = $(element).find('img#img.style-scope.yt-img-shadow').attr('src');
        pattern = /https:\/\/i\.ytimg\.com\/vi\/([a-zA-Z0-9_]{11})\/hqdefault\.jpg/g;
        if( (arrMatch = pattern.exec(linkOfImage)) !== null ) {
            obj.img = arrMatch[0]; //縮圖連結
            obj.id = arrMatch[1]; //從連結擷取出來的 video id (watch?v=xxxxxxxx)

            //影片名稱
            let titleOfVideo = $(element)
            .find('a#video-title.yt-simple-endpoint.style-scope.ytd-video-renderer')
            .text();
            titleOfVideo = titleOfVideo.trim(); //去掉左右側的空白
            obj.title = titleOfVideo; //將影片名稱的值，帶到物件的 title 屬性

            //影片連結
            let linkOfVideo = $(element)
            .find('a#video-title.yt-simple-endpoint.style-scope.ytd-video-renderer')
            .attr('href');
            linkOfVideo = 'https://www.youtube.com' + linkOfVideo;
            obj.link = linkOfVideo; //將影片連結的值，帶到物件的 link 屬性

            //歌手名稱
            obj.singer = strSinger;

            //收集、整理各個擷取到的影音連結元素資訊，到全域的陣列變數中
            arrLink.push(obj);
        }
    });
}

//走訪詳細頁面，看看有無進階資訊可用
async function visit() {
    console.log('Ready to visit YouTube links...');

    for(let i = 0; i < arrLink.length;i ++){
        //到各個影音連結的詳細頁面，並取得 html
        let html = await nightmare
        .goto(arrLink[i].link, headers)
        .wait('div#count.style-scope.ytd-video-primary-info-renderer')
        .evaluate(() => {
            return document.documentElement.innerHTML;
        });

        //取得觀看次數的文字描述，再用正規表達式取得我們所需要的資訊
        let strViewCount = $(html)
        .find('div#count.style-scope.ytd-video-primary-info-renderer span.view-count.style-scope.yt-view-count-renderer')
        .text();
        let pattern = /[0-9,]+/g;
        let arrMatch = null;
        let countPageView = 0;
        if( (arrMatch = pattern.exec(strViewCount)) !== null ) {
            strViewCount = arrMatch[0]; //例如「觀看次數：11,272,456次」
            strViewCount = strViewCount.replace(/,/g, ''); //去除逗號
            countPageView = parseInt(strViewCount); //轉換文字，成為數值，例如「11272456」
            arrLink[i].pageview = countPageView; //將觀看次數的資訊，新增在 i 索引順序中的物件屬性
        }
    }
}

//將擷取的資訊儲存在資料庫中
async function save(){
    //在這個地方，你可以將資料寫入自己的資料庫，無論是關聯式資料庫，或是 NoSQL (Not Only SQL)，依照您的需求而定
    for(let i = 0; i < arrLink.length;i ++){
        //陣列元素的放置，要與 raw sql statement 的欄位對齊
        let arr = [
            arrLink[i].id,
            arrLink[i].singer,
            arrLink[i].title, 
            arrLink[i].img, 
            arrLink[i].link, 
            arrLink[i].pageview
        ];

        //執行 SQL 語法
        await pool.query('INSERT INTO `songs` (`id`, `singer`, `title`, `img`, `link`, `pageview`) values (?,?,?,?,?,?)', arr)
        .then((results) => {
            console.log(`${(new moment().format("YYYY-MM-DD HH:mm:ss"))} YouTube ID [${arrLink[i].id}] 的資料 新增 完成。`);
        }).catch((err) => {
            console.log(`${(new moment().format("YYYY-MM-DD HH:mm:ss"))} YouTube ID [${arrLink[i].id}] 的資料 寫入 失敗 !!`);
            console.log(`失敗原因: ${err.code}`);
            console.log(`失敗訊息: ${err.sqlMessage}`);
            console.log();
        });
    }

    //因為我們已經將相關資訊儲存到資料庫，所以可以在這裡先關閉瀏覽器
    await nightmare.end((err) => {
        if(err) throw err;
        console.log('Nightmare is close.');
    });
}

//下載影音
async function download(){
    // Ref: https://ytdl-org.github.io/youtube-dl/download.html
    // Ref: https://ffmpeg.zeranoe.com/builds/
    // Ref: https://github.com/ytdl-org/youtube-dl/blob/master/README.md#format-selection-examples

    //在這裡，請記得設定 youtube-dl 跟 ffmpeg 等執行檔的環境變數
    //我的電腦→內容→進階系統設定→環境變數→系統變數→Path→編輯→新增→放上 youtube-dl 跟 ffmpeg 的資料夾路徑→確定
    //設定完後，記得重開 Visual Studio Code，讓它重新抓取環境變數

    console.log('Ready to download files...');

    //取得所有的影音資料
    let results = await pool.query('select `id`, `link` from `songs` order by `created_at` asc');

    for(let i = 0; i < results.length;i ++){
        //下載影音檔案
        await exec('youtube-dl.exe -f mp4 -i ' + results[i].link + ' -o "files/%(id)s.%(ext)s"').then((res) => {
            console.log("=================================================");
            console.log(`編號: ${i}`);
            console.log();
            console.log(`影片連結: ${results[i].link}`);
            console.log();
            console.log(`元素資料擷取中...`);
            console.log();

            //若正確訊息不是空字串，則顯示出來
            if(res.stdout !== ''){
                // console.log('正確訊息: ' + res.stdout);
                // console.log();
            }

            //若錯誤訊息不是空字串，則顯示出來
            if(res.stderr !== ''){
                // console.log('錯誤訊息: ' + res.stderr);
                // console.log();
            }
        });
        
        //執行 SQL 語法
        await pool.query(
            'UPDATE `songs` SET `downloaded_at` = ? where `id` = ?', 
            [(new moment().format("YYYY-MM-DD HH:mm:ss")), results[i].id])
        .then((res) => {
            console.log(`${(new moment().format("YYYY-MM-DD HH:mm:ss"))} YouTube ID [${results[i].id}] 的資料 更新 完成。`);
            console.log("=================================================");
            console.log();
        })
        .catch((err) => {
            console.log(`${(new moment().format("YYYY-MM-DD HH:mm:ss"))} YouTube ID [${results[i].id}] 的資料 更新 失敗 !!`);
            console.log(`失敗原因: ${err.code}`);
            console.log(`失敗訊息: ${err.sqlMessage}`);
            console.log();
        });       
    }

}

//照順序執行各個函式
async function asyncArray(functionsList) {
    for(let func of functionsList){
        await func();
    }
}

//寫入 json 資料
async function write(){
    //建立資料夾
    await fs.mkdir('output', {recursive: true}, async (err) => {
        if(err) throw err;

        //將物件轉成 json 格存，儲存檔案
        await fs.writeFile('output/youtube.json', JSON.stringify(arrLink, null, 2), function(err) {
            if(err) throw err;
            console.log('Saved.');
        });
    });
}

//關閉相關的功能
async function close() {
    //關閉資料庫連線
    await pool.end(async (err) => {
        if(err) throw err;
        console.log('MySQL connection is close.');
    });
}

//主程式區域
try { //search, filter, scroll, parse, visit, save, download, write, close
    asyncArray([search, filter, scroll, parse, visit, save, write, close]).then(async () => {
        console.log('Done');
    });
} catch (err) {
    console.log('try-catch: ');
    console.dir(err, {depth: null});
}