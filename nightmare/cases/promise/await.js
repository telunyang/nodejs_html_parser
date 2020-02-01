const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile); // 讓 readFile 可以使用 await 關鍵字
const writeFile = util.promisify(fs.writeFile); // 讓 writeFile 可以使用 await 關鍵字

//IIFE, Immediately-Invoked Function Expressions
(async function(){
    try {
        let contents = await readFile("tmp.txt", "utf8"); //讀取 tmp.log
        await writeFile("await01.txt", `${contents} I'm ironman...`); //寫入 await01.log
        contents = await readFile("await01.txt", "utf8"); //讀取 await01.log
        await writeFile("await02.txt", `${contents} I'm spiderman...`); //寫入 await02.log
        contents = await readFile("await02.txt", "utf8"); //讀取 await02.log
        await writeFile("await03.txt", `${contents} I'm superman...`); //寫入 await03.log
        contents = await readFile("await03.txt", "utf8"); //讀取 await03.log
        await writeFile("await04.txt", `${contents} I'm batman...`); //寫入 await04.log
        console.log(`await.js 執行完成`);
    } catch(err) {
        throw err;
    }
})();
