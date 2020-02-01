const fs = require('fs');

let p = new Promise(function(resolve, reject){
    fs.readFile("tmp.txt", function(err, contents){
        if(err) {
            //讀取錯誤就回傳錯誤的物件到 .catch() 中
            reject(err);
            return;
        };

        //成功就往 .then() 傳遞
        resolve(contents);
    });
});

p.then(function(contents){
    fs.writeFile("promise_tmp.txt", `${contents} I'm ironman!!`, function(err){
        if(err){
            throw err;
        }
        console.log("寫入完成");
    });
}).catch(function(err){
    console.error(err);
});
