/**
 * 目的: 
 * 分析靜態網頁元素，結合 jQuery 套件與 Regular Expression 的技巧，來分析與擷取 LINE 貼圖的相關資訊。
 * 本案例中，我們對「靜態、動畫圖片」進行擷取與分析。
 * 
 * 工具簡介:
 * [fs]
 * 檔案系統，用來讀寫檔案的工具
 * 
 * [util]
 * Node.js 的輔助工具
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

//將 exec 非同步化 (可以使用 await)
const exec = util.promisify(require('child_process').exec);

//引入 jQuery 機制
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const $ = require('jquery')(window);

//放置主要資訊的全域變數 (陣列)
var arrLink = [];

//走訪網址
let url = 'https://store.line.me/stickershop/product/14446/zh-Hant';

//(async () => {
(async function() {
    //透過 curl 指令走訪 url 指定網址
    await exec('curl ' + url, async (error, stdout, stderr) => {
        if (error) throw error;

        //給正規表達式使用的變數
        let pattern = null;
        let arrMatch = null;

        //取得 html
        let html = stdout;

        //取得貼圖的主要名稱，用來建立資料夾
        let title = $(html).find('p.mdCMN38Item01Ttl').text();

        console.log(`貼圖主題名稱: ${title}`);

        //找出網址中的編號，作為 json 與 資料夾的檔案名稱
        pattern = /https:\/\/[a-zA-Z0-9./]+\/([0-9]+)\/zh-Hant/g;
        arrMatch = pattern.exec(url);
        strJsonFileName = arrMatch[1];

        //資料夾名稱
        let dir = `C:\\Users\\telun\\stickers\\${strJsonFileName}`;

        //若沒資料夾，則直接建立 (註: existsSync、mkdirSync 與 exists、mkdir 的差異，在於有 sync 的函式，不需要 callback)
        if (! await fs.existsSync(dir) ){ 
            await fs.mkdirSync(dir); //建立資料夾
        }

        //分析資料內容
        let strJson = ''; //放置 json 的文字資料
        let strInlineCss = ''; //放置 inline css sheet 的文字資訊
        let dataPreview = {}; //將 json 轉成物件型態
        let arrThumbnails = []; //放置縮圖

        //整理資料結果的物件
        let obj = {};

        $(html).find('ul.mdCMN09Ul.FnStickerList li.mdCMN09Li.FnStickerPreviewItem').each((index, element) => {
            //資料預覽屬性中，有一些重要的資訊可用
            strJson = $(element).attr('data-preview');

            //將 json 文字，轉成物件，讓程式運用
            dataPreview = JSON.parse(strJson);

            //找出預覽當中的圖片
            pattern = /https:\/\/stickershop\.line-scdn\.net\/stickershop\/v1\/sticker\/([0-9]+)\/(android|iPhone)\/sticker(?:_key|)@2x\.png/gm;

            //找出 inline css sheet，每一個 li 底下的 span，有兩個，在這裡需將兩個過濾出來的字串，暫時連接在一起，以便後續的正規表達式運作
            $(element).find('span.mdCMN09Image.FnCustomBase, span.mdCMN09Image.FnPreview').each((idx, elm) => {
                //在這裡會連接字串 ( str1 += str2 )
                strInlineCss += $(elm).attr('style');
            });            

            //將配對到的貼圖連結字串，擷取出來
            while( (arrMatch = pattern.exec(strInlineCss)) !== null ){
                // console.log(`貼圖流水號 ${index+1}: ${arrMatch[0]}`);
                arrThumbnails.push(arrMatch[0]);
            }

            //預設貼圖資訊
            obj = {
                type: dataPreview.type,
                id: dataPreview.id,
                staticUrl: dataPreview.staticUrl,
                originalImg: dataPreview.fallbackStaticUrl
            }

            switch(dataPreview.type){
                //預設貼圖類型
                case 'static': 
                    //沒事沒事…
                break; 

                //有聲圖片
                case 'animation_sound': 
                    obj.animationUrl = dataPreview.animationUrl;
                    obj.soundUrl = dataPreview.soundUrl;
                break;

                default:
                    //沒事沒事…
                break;
            }

            //將整理過的縮圖資訊帶入物件
            obj.thumbnailsImg = arrThumbnails;

            //整理結果
            arrLink.push(obj);

            //變數初始化
            pattern = null;
            arrMatch = null;
            strJson = '';
            strInlineCss = '';
            dataPreview = {};
            arrThumbnails = [];
        });

        //在這裡簡單展示 callback hell，之後的範例會用更簡單的方式來逐一執行
        await fs.mkdir('output', {recursive: true}, async (err) => {
            if(err) throw err;
    
            //將物件轉成 json 格存，儲存檔案
            await fs.writeFile('output/' + strJsonFileName + '.json', JSON.stringify(arrLink, null, 2), async function(err) {
                if(err) throw err;
                console.log('JSON 檔案已儲存.');

                //讀取
                await fs.readFile('output/' + strJsonFileName + '.json', 'utf8', async (err, json) => {
                    if (err) throw err;
                    let arr = JSON.parse(json);
                    console.log(`length: ${arr.length}`);

                    for(let i = 0; i < arr.length; i++){
                        //下面的 exec，不受 await 影響，自行發出下載圖片的請求，取得不同時間的回覆(下載完成的訊息)
                        exec('curl ' + arr[i].originalImg + ' -o ' + dir + '\\' + arr[i].id + '.png', (error, stdout, stderr) => {
                            if (error) throw error;
                            console.log(`[${i+1}] 檔案 ${arr[i].id} 已下載.`);
                        });
                    }
                });
            });
        });

    });
}
)();