const fs = require('fs');

//讀取 tmp.log 的檔案內容
fs.readFile("tmp.txt", function(err, contents){
    if(err){
        throw err;
    }

    console.log(`讀取 tmp.txt 成功`);

    //若是讀取沒問題，則加上新增的文字，然後寫入 cb1.txt 檔案
    fs.writeFile("cb1.txt", contents + ' cb1', function(err){
        if(err){
            throw err;
        }

        console.log(`寫入 cb1.txt 成功`);

        //讀取 cb1.txt 的檔案內容
        fs.readFile("cb1.txt", function(err, contents){
            if(err) throw err;

            console.log(`讀取 cb1.txt 成功`);

            //若是讀取沒問題，則加上新增的文字，然後寫入 cb2.txt 檔案
            fs.writeFile("cb2.txt", contents + ' cb2', function(err){
                if(err) throw err;

                console.log(`寫入 cb2.txt 成功`);

                //讀取 cb2.txt 的檔案內容
                fs.readFile("cb2.txt", function(err, contents){
                    if(err) throw err;

                    console.log(`讀取 cb2.txt 成功`);

                    //若是讀取沒問題，，則加上新增的文字，然後寫入 cb3.txt 檔案
                    fs.writeFile("cb3.txt", contents + ' cb3', function(err){
                        if(err) throw err;

                        console.log(`寫入 cb3.txt 成功`);

                        //讀取 cb3.txt 的檔案內容
                        fs.readFile("cb3.txt", function(err, contents){
                            if(err) throw err;

                            console.log(`讀取 cb3.txt 成功`);

                            //若是讀取沒問題，則加上新增的文字，然後寫入 cb4.txt 檔案
                            fs.writeFile("cb4.txt", contents + ' cb4', function(err){
                                if(err) throw err;

                                console.log(`寫入 cb4.txt 成功`);
                                
                            });
                        });
                    });
                });
            });
        });
    });
});
