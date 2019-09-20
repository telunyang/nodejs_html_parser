/**
 * 目的: 
 * 走訪、取得 Instagram 的元素，並加以分析，必要時，可以下載來檢視結果
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
 * [util]
 * Node.js 的輔助工具
 * 
 * [exec]
 * Node.js 執行指令的工具
 * 
 * [crypto]
 * 雜湊、加密工具，在本案例中，使用 md5 技術，協助建立 associated key
 * 
 * [fs]
 * 檔案系統，用來讀寫檔案的工具
 */

const Nightmare = require('nightmare');
const nightmare = Nightmare({ show: true });
const moment = require('moment');
const util = require('util');
const crypto = require('crypto');
const fs = require('fs');

//將 exec 非同步化 (可以使用 await)
const exec = util.promisify(require('child_process').exec);

//引入 jQuery 機制
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const $ = require('jquery')(window);

//走訪網址
// const strUrl = 'https://www.instagram.com/mochi_dad';
const strUrl = 'https://www.instagram.com/ntnu.taiwan';
// const strUrl = 'https://www.instagram.com/mannerproduction';

//放置主要資訊的全域變數 (陣列)
var arrLink = {}; //在這裡宣告成物件，是因為本案例索引不是數值，而是字串

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
        }, seconds * 1000 ); //等待數分鐘後，再進行抓取 Math.floor((Math.random() * 5) + 10)
    });
}

//進入待走訪的網址
async function init(){
    console.log('Initializing...');

    await nightmare
    .goto(strUrl, headers)
    // .wait('button._0mzm-.sqdOP.L3NKy')
    .wait('span.PJXu4')
    .catch(error => {
        console.error('Initialization failed: ', error)
    });
}

//滾動頁面，將動態資料逐一顯示出來
async function scroll(){
    console.log('Ready to scroll page and parse metadata/elements of Instagram photo grids...');

    let previousHeight = 0; //先前偏移的高度
    let currentHeight = 0; //目前的高度
    let offset = 0; //總偏移量

    //不斷地 scroll down，直到沒有辦法再往下捲動
    while(offset <= currentHeight) {
        //每一次滾動，都重新擷取一次 grid 的資訊，以 id 作為陣列的 key
        await parse();

        previousHeight = offset;
        currentHeight = await nightmare.evaluate(() => {
            return document.documentElement.scrollHeight;
        });

        offset += 500;
        await nightmare.scrollTo( offset, 0 ).wait(500);
        
        console.log('previousHeight = ' + previousHeight + ', currentHeight = ' + currentHeight + ', offset = ' + offset);

        // if(offset > 500) break; //強迫跳出迴圈，視情況使用
        break;
    }
}

//滾動頁面，將動態資料逐一顯示出來
async function parse(){
    //取得滾動後，得到動態產生結果的 html 元素，這裡很重要，因為裡面有需要的元素，例如單張照片、多張照片、影片等資訊
    let html = await nightmare.evaluate(() => {
        return document.documentElement.innerHTML;
    });

    //用於正規表達式的變數
    let pattern = null;
    let arrMatch = null;

    //grid 元素的 id
    let id = null;

    //待點選的連結
    let strLink = '';

    //放置縮圖資訊
    let arrThumbnails = [];

    let strSrcSet = '';

    //每三個 div 一列，一列有三個格子，每個格子都有一個 a link，我們直接從 div 裡面的 a 下手
    $(html).find('article.FyNDV div.Nnq7C.weEfm a').each((index, element) => {
        //取得 id 樣式
        pattern = /\/p\/([a-zA-Z0-9-_]+)\//g;
        if( (arrMatch = pattern.exec( $(element).attr('href') )) !== null ) {
            //取得 ig 的特別編號
            id = arrMatch[1];

            //針對 associated array 進行初始化
            arrLink[id] = {};

            //各個 ig 定義的縮圖連結字串
            strSrcSet = $(element).find('img.FFVAD').attr('srcset');

            //取得連結樣式
            pattern = /(https:\/\/[a-zA-Z0-9-./_?=&]+)\s(\d{3,4}w)/gm;
            
            //pattern.exec 會回傳一個結果「陣列」或是空值；若是有比對到資料，則透過迴圈整理、加入新資料
            while( (arrMatch = pattern.exec(strSrcSet)) !== null ){
                arrThumbnails.push({
                    size: arrMatch[2],
                    img: arrMatch[1]
                });
            }

            //待點選的連結
            strLink = strUrl + $(element).attr('href');

            //新增主要資訊到全域陣列
            arrLink[id] = {
                link: strLink,
                thumbnails: arrThumbnails
            };

            //變數初始化。
            //註: 沒有賦予 null，是因為某些資料庫平台（例如 Google Firebase Database）會將空值的節點刪除，當作不存在，有可能造成程式撰寫的困擾
            strLink = '';
            arrThumbnails = [];
        }
    });
}

//走訪詳細頁面，看看有無進階資訊可用
async function visit(){
    let html = ''; //放置頁面元素
    let type = ''; //連結類型，例如單張圖片、多張圖片，或是影片
    let linkOfVideo = ''; //影片連結
    let linkOfVideoCoverImg = ''; //影片的預設封面
    let arrVideo = []; //放置多個影片連結
    let numOfSlide = 0; //檢查到多張圖片的頁面時，滑動圖片的次數
    let strOfTempSlideImg = ''; //每次滑動圖片，元素設定重新產生，用來臨時命名的索引名稱 (for associated key)
    let arrImg = []; //放置圖片連結
    let pattern = null; //比對樣式
    let arrMatch = null; //比對結果
    let strSrcSet = ''; //縮圖連結字串

    //逐一進入更詳細的頁面，再操作頁面元素
    for(let key in arrLink){
        console.log('Visiting url: ' + arrLink[key].link);

        //到各個影音連結的詳細頁面，並取得 html
        html = await nightmare
        .goto(arrLink[key].link, headers)
        // .wait('button._0mzm-.sqdOP.yWX7d') //等待主要元素出現
        .wait('a.FPmhX.notranslate.nJAzx')
        .evaluate(() => {
            return document.documentElement.innerHTML;
        });

        //檢查影片
        if( $(html).find('video.tWeCl').length > 0) {
            if( $(html).find('div.rQDP3 ul.YlNGR li._-1_m6').length > 0 ){
                //準備 slide 的次數，影片數量減 1 是為了避免多餘的瀏覽器滑動行為，
                //例如共有 7 個影片，因為一開始一定會先看第一個，所以滑 6 次就可以全看完了
                numOfSlide = $(html).find('div.rQDP3 ul.YlNGR li._-1_m6').length - 1;

                //原先初始設定為陣列 []，現在需要以 hash 作為陣列的索引 (associated key)，所以在這裡要改為物件 {}
                arrVideo = {};

                //格子的內容類型 - 多個影片
                type = 'videos';

                //走訪可滑動元素內容
                for(let i = 0; i < numOfSlide; i++){
                    //等個數秒，按下 slider button，然後再重抓一次 html
                    html = await nightmare
                    .wait('button._6CZji') //等待滑動圖片的右鍵出現
                    .wait(1000) //等待數秒
                    .click('button._6CZji') //按下滑動圖片的右鍵
                    .evaluate(() => {
                        return document.documentElement.innerHTML; //回傳當前的 html
                    });

                    //走訪 li 元素，再依 ig 圖片/圖片顯示機制，進行整理
                    console.log('Sliding videos: ' + i);

                    $(html).find('div.rQDP3 ul.YlNGR li._-1_m6 video.tWeCl').each((index, element) => {
                        //影片連結的字串
                        strSrcSet = $(element).attr('src');

                        //暫時的 associated key
                        strOfTempSlideImg = crypto.createHash('md5').update( strSrcSet ).digest('hex');

                        //這裡通常要先把 associated key 的先初始化，不然有可能出錯
                        arrVideo[strOfTempSlideImg] = {};

                        //associated key 有個特性，只要是指定的索引重新賦值，原先的值就會被蓋過去，用此特性來濾掉重覆的元素
                        arrVideo[strOfTempSlideImg] = strSrcSet;
                    });
                }
            } else {
                //格子的內容類型 - 單支影片
                type = 'video';

                //按下影片播放鈕
                // await nightmare.click('a.QvAa1');

                //取得影片連結
                linkOfVideo = $(html).find('video.tWeCl').attr('src');

                //影片預設封面
                linkOfVideoCoverImg = $(html).find('img._8jZFn').attr('src');
            }
        } else if($(html).find('img.FFVAD').length > 0){ //檢查圖片
            if( $(html).find('div.tN4sQ.zRsZI ul.YlNGR li._-1_m6').length > 0) { //檢查是否有「多張」圖片，但可能有不同大小的尺寸
                //準備 slide 的次數，圖片數量減 1 是為了避免多餘的瀏覽器滑動行為，例如共有 7 張圖片，因為一開始一定會先看第一張，所以滑 6 次就可以全看完了
                numOfSlide = $(html).find('div.tN4sQ.zRsZI ul.YlNGR li._-1_m6').length - 1;

                //原先初始設定為陣列 []，現在需要以 hash 作為陣列的索引 (associated key)，所以在這裡要改為物件 {}
                arrImg = {};

                //格子的內容類型 - 可 slide 的多張圖片
                type = 'images';

                //走訪可滑動元素內容
                for(let i = 0; i < numOfSlide; i++){
                    //等個數秒，按下 slider button，然後再重抓一次 html
                    html = await nightmare
                    .wait('button._6CZji') //等待滑動圖片的右鍵出現
                    .wait(1000) //等待數秒
                    .click('button._6CZji') //按下滑動圖片的右鍵
                    .evaluate(() => {
                        return document.documentElement.innerHTML; //回傳當前的 html
                    });

                    //走訪 li 元素，再依 ig 圖片/圖片顯示機制，進行整理
                    console.log('Sliding image: ' + i);

                    //圖片連結樣式
                    pattern = /(https:\/\/[a-zA-Z0-9-./_?=&]+)\s(\d{3,4}w)/gm;

                    $(html).find('div.tN4sQ.zRsZI ul.YlNGR li._-1_m6 img.FFVAD').each((index, element) => {
                        //圖片連結的字串
                        strSrcSet = $(element).attr('srcset');

                        //暫時的 associated key
                        strOfTempSlideImg = crypto.createHash('md5').update( strSrcSet ).digest('hex');

                        //這裡通常要先把 associated key 的先初始化，不然有可能出錯
                        arrImg[strOfTempSlideImg] = {};

                        //pattern.exec 會回傳一個結果「陣列」或是空值；若是有比對到資料，則透過迴圈整理、加入新資料
                        while( (arrMatch = pattern.exec(strSrcSet)) !== null ){
                            //associated key 有個特性，只要是指定的索引重新賦值，原先的值就會被蓋過去，用此特性來濾掉重覆的元素
                            arrImg[strOfTempSlideImg][arrMatch[2]] = arrMatch[1];
                        }
                    });
                }
            } else {
                //格子的內容類型 - 單一圖片
                type = 'image'

                //縮圖連結字串
                strSrcSet = $(html).find('div.eLAPa._23QFA div.KL4Bh img.FFVAD').attr('srcset');

                //連結樣式
                pattern = /(https:\/\/[a-zA-Z0-9-./_?=&]+)\s(\d{3,4}w)/gm;
                
                //pattern.exec 會回傳一個結果「陣列」或是空值；若是有比對到資料，則透過迴圈整理、加入新資料
                while( (arrMatch = pattern.exec(strSrcSet)) !== null ){
                    arrImg.push({
                        size: arrMatch[2],
                        img: arrMatch[1]
                    });
                }
            }
        }

        //新增主要資訊到全域陣列
        arrLink[key].type = type;
        arrLink[key].videoLink = linkOfVideo;
        arrLink[key].videoCoverImg = linkOfVideoCoverImg;
        arrLink[key].arrImg = arrImg;
        arrLink[key].arrVideo = arrVideo;

        // console.dir(arrLink[key].arrImg, {depth: null});

        //變數初始化。
        //註: 沒有賦予 null，是因為某些資料庫平台（例如 Google Firebase Database）會將空值的節點刪除，當作不存在，有可能造成程式撰寫的困擾
        html = type = linkOfVideo = linkOfVideoCoverImg = '';
        arrImg = [];
        arrVideo = [];
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
    });

    //將物件轉成 json 格存，儲存檔案
    await fs.writeFile('output/ig.json', JSON.stringify(arrLink, null, 2), function(err) {
        if(err) throw err;
        console.log('ig.json has been saved.');
    });
}

//關閉瀏覽器與資料庫連線
async function close() {
    //關閉瀏覽器
    await nightmare.end((err) => {
        if(err) throw err;
        console.log('Nightmare connection is close.');
    });
}

//儲存 ig 的資料
async function store(){
    await fs.readFile('output/ig.json', 'utf8', async (err, json) => {
        if (err) throw err;
        let obj = JSON.parse(json)

        for(let key in obj){
            //建立存放下載檔案的資料夾
            await fs.mkdir('files/ig/' + key, {recursive: true}, async (err) => {
                if(err) throw err;
            });

            //確認下載類型
            switch(obj[key].type){
                //單張圖片
                case 'image': 
                    for(let i = 0; i < obj[key].thumbnails.length; i++){
                        await exec('curl -o "files/ig/' + key + '/image_thumbnails_' + key + '_' + obj[key].thumbnails[i].size + '.jpg" ' + '"' + obj[key].thumbnails[i].img + '"').then((res) => {
                            console.log('檔案 image_thumbnails_' + key + '_' + obj[key].thumbnails[i].size + '.jpg 下載完成');
                        });
                    }
                break;

                //影片
                case 'video':
                    await exec('curl -o "files/ig/' + key + '/' + key + '.mp4" ' + '"' + obj[key].videoLink + '"').then((res) => {
                        console.log('檔案 ' + key + '.mp4 下載完成');
                    });
                break;

                //多張圖片
                case 'images':
                    for(let k in obj[key].arrImg){
                        for(let size in obj[key].arrImg[k]){
                            await exec('curl -o "files/ig/' + key + '/images_' + k + '_' + size + '.jpg" ' + '"' + obj[key].arrImg[k][size] + '"').then((res) => {
                                console.log('檔案 images_' + k + '_' + size + '.jpg 下載完成');
                            });
                        }
                    }
                break;

                //多個影片
                case 'videos':
                    for(let k in obj[key].arrVideo){
                        await exec('curl -o "files/ig/' + key + '/videos_' + k + '.mp4" ' + '"' + obj[key].arrVideo[k] + '"').then((res) => {
                            console.log('檔案 videos_' + k + '.mp4 下載完成');
                        });
                    }
                break;
            }
        }
    })  
}

//主程式區域
try {
    asyncArray([
        init, 
        scroll, 
        visit, 
        write,
        store, 
        close]).then(async () => {
        console.log('Done');     
    });
} catch (err) {
    console.log('try-catch: ');
    console.dir(err, {depth: null});
}