const fs = require('fs'); //透過 node.js 來操作檔案系統，例如建立資料夾、新增檔案、寫入檔案等
const util = require('util'); //node.js 的工具，目前用於將 exec 異步化（非同步化）
const moment = require('moment'); //用來顯示、分析、驗證、操作、計算日期時間的工具

//將 exec 非同步化 (可以使用 await，以及 .then, .catch)
const exec = util.promisify(require('child_process').exec);

//將 fs 功能非同步化
const mkdir = util.promisify(fs.mkdir);
const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);

//將 MySQL 連線物件的 query 與 end 方法非同步化
const pool = require('../../modules/db_wiki');
pool.query = util.promisify(pool.query);
pool.end = util.promisify(pool.end);

//引入 jQuery 機制
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const $ = require('jquery')(window);

//放置主要資訊變數 (陣列)
let arrLink = [];

//瀏覽器標頭，讓對方認為我們是人類，而非機器人 (爬蟲)
const headers = {
    'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
    'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
    'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
};

//建立一個名為 func 的 async fucntion，參數是 url
async function func(url) {
    let { stdout, stderr } = await exec(
        `curl -X GET ${url} -L 
        -H "User-Agent: ${headers['User-Agent']}" 
        -H "Accept-Language: ${headers['Accept-Language']}" 
        -H "Accept: ${headers.Accept}"`, 
        {encoding: 'utf8', maxBuffer: 500 * 1024}
    );

    //取得 html (then 回傳回來的是物件，物件的屬性 stdout 才是 html 字串)
    let html = stdout;

    //額外寫入未經網頁 js 程式變更過的 html 原始碼，到自訂檔案中
    await writeFile(`wiki.html`, html);

    //姓名, 人物的維基百科連結, 字, 籍貫, 列傳, 首回, 末回, 史構
    let wikiName = '', wikiLink = '', wikiAlias = '', wikiBirthplace = '', wikiDescription = '', wikiBeginEpisode = '', wikiEndEpisode = '', wikiIdentity = '';

    //物件變數，用來放置人物相關資訊
    let obj = {};

    //取得人物姓名的表格
    $(html).find('table.wikitable.sortable').each(function(index, element) {
        //走訪取得每一個人物的表格資料（使用 jQuery 的功能來取得 html 元素裡面的資料）
        $(element).find('tbody tr').each(function(idx, elm) { 
            //姓名
            wikiName = $(elm).find('td:eq(0)').text(); 
            //維基百科連結
            wikiLink = $(elm).find('td:eq(0)').find('a').attr('href'); 
            //字
            wikiAlias = $(elm).find('td:eq(1)').text(); 
            //籍貫
            wikiBirthplace = $(elm).find('td:eq(2)').text(); 
            //列傳
            wikiDescription = $(elm).find('td:eq(3)').text(); 
            //首回
            wikiBeginEpisode = $(elm).find('td:eq(4)').text(); 
            //末回
            wikiEndEpisode = $(elm).find('td:eq(5)').text(); 
            //史構
            wikiIdentity = $(elm).find('td:eq(6)').text(); 

            //若是姓名變數沒有文字，則跳到下一個元素去執行。
            //註：.each 是 return，while 跟 for 迴圈是 continue 或 break
            if (wikiName == '') return; 

            //整理人物資訊在物件裡
            obj = {
                name: wikiName, //姓名
                link: 'https://zh.wikipedia.org' + wikiLink, //維基百科連結
                alias: wikiAlias, //字
                birthplace: wikiBirthplace, //籍貫
                description: wikiDescription, //列傳
                beginEpisode: wikiBeginEpisode, //首回
                endEpisode: wikiEndEpisode, //末回
                identity: wikiIdentity, //史構
            };

            //過濾掉不必要的字元
            for(let key in obj){
                let str = String(obj[key]);
                obj[key] = str.replace(/\n/g, '');
            }
            
            //加入陣列變數
            arrLink.push(obj);

            //物件變數初始化，讓下一個人物能夠用
            obj = {};
        });
    });
}

//儲存三國人物 json 資料到資料庫
async function save(){
    let strJson = await readFile('output/wiki.json');
    let arrJson = JSON.parse(strJson);
    for(let i = 0; i < arrJson.length; i++){
        let arr = [
            arrJson[i].name,
            arrJson[i].link,
            arrJson[i].alias,
            arrJson[i].birthplace,
            arrJson[i].description,
            arrJson[i].beginEpisode,
            arrJson[i].endEpisode,
            arrJson[i].identity
        ];
        await pool.query('INSERT INTO `threekingdoms` (`name`, `link`, `alias`, `birthplace`, `description`, `beginEpisode`, `endEpisode`, `identity`) values (?,?,?,?,?,?,?,?)', arr)
        .then((results) => {
            console.log(`${(new moment().format("YYYY-MM-DD HH:mm:ss"))} [${results.insertId}] 的資料 新增 完成。`);
        }).catch((err) => {
            console.error(err);
            console.log(`失敗原因: ${err.code}`);
            console.log(`失敗訊息: ${err.sqlMessage}`);
            console.log();
        });
    }

    //關閉資料庫連線
    await pool.end();
}

//主程式區域
try {
    //範例: 維基百科「三國演義角色列表」
    let url = 'https://zh.wikipedia.org/wiki/%E4%B8%89%E5%9B%BD%E6%BC%94%E4%B9%89%E8%A7%92%E8%89%B2%E5%88%97%E8%A1%A8';
    
    //執行函式
    func(url)
    .then(async () => {
        //建立資料夾
        await mkdir('output', {recursive: true});

        //將物件轉成 json 格存，儲存檔案
        await writeFile('output/wiki.json', JSON.stringify(arrLink, null, 2));
    });

    //儲存三國人物 json 資料到資料庫
    // save();

    
} catch(err) {
    console.error(err);
}