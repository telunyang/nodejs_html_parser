const fs = require('fs');

new Promise(function(resolve, reject){
    fs.readFile("tmp.txt", function(err, contents){
        if(err) {
            //讀取錯誤就回傳錯誤的物件到 .catch() 中
            reject(err);
            return;
        };

        fs.writeFile("tmp1.txt", `${contents} I'm ironman!!`, function(err){
            if(err){
                throw err;
            }
            resolve('tmp1'); //成功就往 .then() 傳遞
        });
    });
}).then((tmpNum) => {
    console.log(`Write to ${tmpNum} ok`);
    let p2 = new Promise(function(resolve, reject){
        fs.readFile("tmp1.txt", function(err, contents){
            if(err) {
                //讀取錯誤就回傳錯誤的物件到 .catch() 中
                reject(err);
                return;
            };
    
            //成功就往 .then() 傳遞
            fs.writeFile("tmp2.txt", `${contents} I'm spiderman!!`, function(err){
                if(err){
                    throw err;
                }
                resolve('tmp2'); //成功就往 .then() 傳遞
            });
        });
    });
    return p2;
}).then((tmpNum) => {
    console.log(`Write to ${tmpNum} ok`);
    let p3 = new Promise(function(resolve, reject){
        fs.readFile("tmp2.txt", function(err, contents){
            if(err) {
                //讀取錯誤就回傳錯誤的物件到 .catch() 中
                reject(err);
                return;
            };
    
            //成功就往 .then() 傳遞
            fs.writeFile("tmp3.txt", `${contents} I'm superman!!`, function(err){
                if(err){
                    throw err;
                }
                resolve('tmp3'); //成功就往 .then() 傳遞
            });
        });
    });
    return p3;
}).then((tmpNum) => {
    console.log(`Write to ${tmpNum} ok`);
    let p4 = new Promise(function(resolve, reject){
        fs.readFile("tmp3.txt", function(err, contents){
            if(err) {
                //讀取錯誤就回傳錯誤的物件到 .catch() 中
                reject(err);
                return;
            };
    
            //成功就往 .then() 傳遞
            fs.writeFile("tmp4.txt", `${contents} I'm batman!!`, function(err){
                if(err){
                    throw err;
                }
                resolve('tmp4'); //成功就往 .then() 傳遞
            });
        });
    });
    return p4;
}).then((tmpNum) => {
    console.log(`Write to ${tmpNum} ok`);
})
.catch((err) => {
    console.error(err); //例外處理
});
