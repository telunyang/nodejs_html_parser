const fs = require('fs'); //透遛 node.js 來操作檔案系統，例如建立資料夾、新增檔案、寫入檔案等
const util = require('util'); //node.js 的工具，目前用於將 exec 異步化（非同步化）

//將 exec 非同步化 (可以使用 await，以及 .then, .catch)
const exec = util.promisify(require('child_process').exec);

const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const $ = require('jquery')(window);

const headers = {
    'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
    'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
    'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
};

//維基百科: 貓咪咖啡館
const url = 'https://zh.wikipedia.org/wiki/%E7%8C%AB%E5%92%AA%E5%92%96%E5%95%A1%E9%A6%86';

(async function(){
    let {stdout, stderr} = await exec(`curl -X GET ${url} -L -H "User-Agent: ${headers['User-Agent']}" -H "Accept-Language: ${headers['Accept-Language']}" -H "Accept: ${headers.Accept}"`, {encoding: 'utf8', maxBuffer: 500 * 1024});
    let html = stdout;
    console.log( $(html).find('div#mw-content-text div.mw-parser-output p:eq(0)').text() );
    console.log( $(html).find('div#mw-content-text div.mw-parser-output p:eq(3)').text() );
})();

