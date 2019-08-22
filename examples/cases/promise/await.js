const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile); // 讓 readFile 可以使用 await 關鍵字
const writeFile = util.promisify(fs.writeFile); // 讓 writeFile 可以使用 await 關鍵字

(async function(){
    try {
        let contents = await readFile("tmp.log", "utf8"); //讀取 tmp.log
        await writeFile("await01.log", `${contents} I'm ironman...`); //寫入 await01.log
        contents = await readFile("tmp1.log", "utf8"); //讀取 tmp1.log
        await writeFile("await02.log", `${contents} I'm spiderman...`); //寫入 await02.log
        contents = await readFile("tmp2.log", "utf8"); //讀取 tmp2.log
        await writeFile("await03.log", `${contents} I'm superman...`); //寫入 await03.log
        contents = await readFile("tmp3.log", "utf8"); //讀取 tmp3.log
        await writeFile("await04.log", `${contents} I'm batman...`); //寫入 await04.log
    } catch(err) {
        throw err;
    }
})();
