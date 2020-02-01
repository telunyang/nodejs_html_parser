const util = require('util');
const exec = util.promisify(require('child_process').exec);

let str = `歡迎收看本週的臺大計中狂新聞
因為擔心使用學員照片，會被告
所以講師親自下海，親自示範解說
這是講師上課的樣子，很正常對吧
哇靠，怎麼講師開起戶外教學課程
裡面有個藍藍的傢伙，感覺似曾相識
疑，這不是七龍珠裡面的情節嗎
講師會這招，怎麼上課都不教我們
原來這個人還會指揮飛彈，我還以為是講師呢
感謝收看臺大計中狂新聞，咱們下次見`;

let pattern = /.*(?:\S)/gm;
let match = null;
let count = 1;

const headers = {
    'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
};

//IIFE
(
    async function () {
        while( (match = pattern.exec(str)) !== null ){
            // console.log(match[0]);
            
            //下載檔案
            await exec(`curl -X GET "https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q=${encodeURIComponent(match[0])}&tl=zh-TW" -H "User-Agent: ${headers['User-Agent']}" -o "examples/cases/regex/${count}.mp3"`, {encoding: 'utf8', maxBuffer: 5000 * 1024});
            
            //使用 ffmpeg 轉檔
            await exec(`ffmpeg -i examples/cases/regex/${count}.mp3 -filter:a "atempo=1.5" examples/cases/regex/file_${count}.mp3`);

            //遞增檔案流水號
            count++;
        }
    }
)();
