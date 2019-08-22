const mysql = require('mysql');
const pool = mysql.createPool({
  connectionLimit : 10,
  host     : 'localhost',
  user     : 'test',
  password : 'T1st@localhost',
  database : 'youtube',
  supportBigNumbers: true,
  charset: 'UTF8_GENERAL_CI'
});

module.exports = pool;
