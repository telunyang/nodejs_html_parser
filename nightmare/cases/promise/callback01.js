const fs = require('fs');

//讀取 source.txt 的檔案內容
fs.readFile("source.txt", function(err, contents){
    if(err){
        throw err;
    }
    console.log("讀取 source.txt 完成!");

    //若是讀取沒問題，則寫入 destination.txt 檔案
    fs.writeFile("destination.txt", contents + ' Hello NTU!',  function(error){
        if(error){
            throw error;
        }
        console.log("寫入 destination.txt 成功!");
    });
});
