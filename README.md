# Nodejs-Html-Parser
Using nightmareJS or selenium driver to crawl data from websites.

使用 nightmareJS selenium driver 來爬取網站資料。

## Description
This repository is to teach students who register my information classes on how to crawl and retrieve text/hyperlink/binary data from websites. In our cases, they can help us to crawl some websites such as 104 Human Resource bank, Instagram, LINE stickers, Wikipedia page of roles list for Romance of Three Kingdoms, WineSearcher and YouTube, etc.

此專案用於指導報名資訊課程的學生如何爬取網站資料。在我們的案例中，它們能協助我們爬下一些網站，例如 104 人力銀行、Instagram、LINE 貼圖、維基百科「三國演義人物列表」、WineSearcher 酒類詢價網站和 YouTube 等。

## Prerequisites
你需要一些下面所列出的實務經驗:

You need to have some practical experiences as follows:
1. Javascript: Node.js programming language
2. jQuery: manipulate html elements
3. npm: nodejs package management
4. HTML 4/5 and relevant knowledge
5. CSS selector (**important!**)
6. Optional:
   - nvm: nodejs version management
   - MySql and SQL syntax


安裝 Node.js 套件 (與 package.json 檔案有關)

Install node.js packages (It's related to package.json)
```sh
$ npm i --save
```

## Examples
1. Wikipedia page of roles list for Romance of Three Kingdoms (維基百科「三國人物演義列表」)
2. WineSearch (WineSearcher酒類詢價網站)
3. LINE stickers (LINE官方貼圖)
4. 104 Human Resource bank (104人力銀行)
5. YouTube
6. Instagram

## New a customized database configuration file
You can add a new file of database configuration in **sql** folder as the following setting:

你能新增資料庫設定檔案在 sql 資料夾，如同下列設定:
```sh
const mysql = require('mysql');
const pool = mysql.createPool({
  connectionLimit : 10,
  host     : 'localhost',
  user     : '<Your-User-Name-Or-Account>',
  password : '<Your-Password>',
  database : '<Your-Database>',
  supportBigNumbers: true,
  charset: 'UTF8_GENERAL_CI'
});
module.exports = pool;
```
Note: In default: username **test** and password **T1st@localhost** 

我們帳號、密碼預設為「test」、「T1st@localhost」

## How to execute our code
There are some relative path we use in our cases, you might as well type commands as follows:

有一些相對路徑用在我們的案例當中，你不妨輸入下列指令:
```sh
# Ready to launch WineSearch price-history crawling
$ ~/Nodejs-Html-Parser/node examples/Wine/wine-searcher.js
```
Afterward, logger messages will appear in the terminal as shown below:

之後，終端機會顯示下列的訊息:
```
酒的名稱: 1992 Screaming Eagle Cabernet Sauvignon, Napa Valley, USA
年月日: 2017-08-01
價格(美金): 12376 元, 換算新台幣約為: 383656 元

年月日: 2017-09-01
價格(美金): 11183 元, 換算新台幣約為: 346673 元
.
.
年月日: 2018-07-01
價格(美金): 16047 元, 換算新台幣約為: 497457 元

年月日: 2018-08-01
價格(美金): 19880 元, 換算新台幣約為: 616280 元
.
.
年月日: 2019-06-01
價格(美金): 19333 元, 換算新台幣約為: 599323 元

年月日: 2019-07-01
價格(美金): 19279 元, 換算新台幣約為: 597649 元
```

```
酒的名稱: 2006 Chateau Latour, Pauillac, France
年月日: 2017-08-01
價格(美金): 638 元, 換算新台幣約為: 19778 元

年月日: 2017-09-01
價格(美金): 655 元, 換算新台幣約為: 20305 元

年月日: 2017-10-01
價格(美金): 634 元, 換算新台幣約為: 19654 元
.
.
.
年月日: 2019-05-01
價格(美金): 683 元, 換算新台幣約為: 21173 元

年月日: 2019-06-01
價格(美金): 681 元, 換算新台幣約為: 21111 元

年月日: 2019-07-01
價格(美金): 696 元, 換算新台幣約為: 21576 元
```
Note: In some cases, I will make folder and put some json file into that, it would be useful to review data you crawled.

在一些案例裡，我會新增資料夾，以及放入 json 檔，它對你檢視先前爬取的資料，可能有用。

## Video demo
WineSearcher

[![WineSearcher](https://i.ytimg.com/vi/SHmqWvO_ziw/hqdefault.jpg)](https://youtu.be/SHmqWvO_ziw "WineSearch")

LINE stickers

[![LINE stickers](https://i.ytimg.com/vi/SMwI2i5xkck/hqdefault.jpg)](https://youtu.be/SMwI2i5xkck "WineSearch")

YouTube

[![YouTube](https://i.ytimg.com/vi/885WDQjq7Vw/hqdefault.jpg)](https://youtu.be/885WDQjq7Vw "YouTube")

Instagram

[![Instagram](https://i.ytimg.com/vi/wILsmJz25d4/hqdefault.jpg)](https://youtu.be/wILsmJz25d4 "Instagram")

# Notice
You need to import all files from **sql** folder to your databases so that you can run our code smoothly, otherwise, you will get some error messages.

你需要從 sql 資料夾中，匯入所有的 sql 檔案到你的資料庫，方便你順利地執行程式碼，否則，你將會得到一些錯誤訊息。

# Change logs

### 2019-08-29: Uploading express web folder

You can review crawling results of 104 Human Resource bank via **myweb** folder from **_common**. First of all, you have to copy or move **myweb** folder out of this repository. Secondly, you have to change folder from this repository to **myweb**, then install all of packages by typing npm commands. Finally, you have to launch express web server, it will run with 3000 port number.

```sh
$ npm i -g express express-generator nodemon # install global command
$ cd /{path}/myweb # change folder
$ npm i --save # install packages
$ npm start # test your code
or
$ node bin/www
```
