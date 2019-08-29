var express = require('express');
var router = express.Router();

//將 MySQL 連線物件的 query 與 end 方法非同步化
const util = require('util');
const pool = require('../modules/db_104');
pool.query = util.promisify(pool.query);

//在這裡不使用 pool.end 來關閉資料庫，是因為 web server 啟動時，資料庫會處於連線狀態，執意關閉，會造成後續請求資料庫的錯誤
// pool.end = util.promisify(pool.end);

/* GET home page. */
router.get('/', async function (req, res, next) {
    let results = await pool.query('SELECT `sn`, `keyword`, `position`, `positionLink`, `location`, `companyName`, `companyLink`, `category`, `created_at`, `updated_at` FROM `jobs` ORDER BY `created_at` ASC');

    return res.render('ntu', {
        title: '我的成果展示',
        msg: '測試變數傳遞',
        data: results
    });
});

//路由接收 POST 方式請求資料，再將資料庫查詢結果，以 json 物件方式回傳(或稱回應)
router.post('/update', async function (req, res, next) {
    /**
     * 從前端傳來的請求，稱為 request，參數為 req，前面 fetch 指定的 body，在後端以「req.body」來取得資料，
     * 格式為「req.body.前端傳遞過來的屬性名稱」，例如 req.body.sn
     */
    let field = req.body.field;
    let sn = req.body.sn;
    let value = req.body.value;

    //更新資料，取得資料庫查詢結果的物件
    let results = await pool.query('UPDATE `jobs` SET `' + field + '` = ? WHERE `sn` = ?', [value, sn]);
    
    //查看資料庫查詢結果
    console.dir(results);
    
    //以 json 物件方式回傳
    return res.json(results);
});

module.exports = router;