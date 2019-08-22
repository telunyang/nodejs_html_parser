let html = `<!DOCTYPE html> 
<html>
    <head>
        <meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
        <title>歡迎來到我的家</title>
    </head>
    <body>
        <div id="wrapper">
            <!-- nav 在這裡是網頁上緣導覽列 -->
            <header class="head-info">
                <nav class="nav nav-info">
                    <ul class="nav-body">
                        <li class="nav-list">
                            <a class="center link-custom">首頁</a>
                        </li>
                        <li class="nav-list">
                            <a class="center link-custom">連結1</a>
                        </li>
                        <li class="nav-list">
                            <a class="center link-custom">連結2</a>
                        </li>
                        <li class="nav-list">
                            <a class="center link-custom">連結3</a>
                        </li>
                    </ul>
                </nav>
            </header>

            <!-- aside 在這裡是左側的選單列表 -->
            <aside class="menu">
                <ul class="menu-body">
                    <li class="menu-list">
                        <a class="center">側欄連結1</a>
                    </li>
                    <li class="menu-list">
                        <a class="center">側欄連結2</a>
                    </li>
                    <li class="menu-list">
                        <a class="center">側欄連結3</a>
                    </li>
                </ul>
            </aside>

            <!-- main 是主要顯示內容的區域 -->
            <main class="content-container">
                <article class="article-paragraph">
                    <section class="episode">
                        <h3 class="title">HTML parser 開發不求人 - 第三節</h3>
                        <div class="content">
                            <p>動態網頁的元素走訪，都需要透過不斷地實作、練習（自己手動輸入程式碼），同時...</p>
                        </div>
                        <div class="content-more">
                            <a class="more-link">More</a>    
                        </div>
                    </section>
                    <section class="episode">
                        <h3 class="title">HTML parser 開發不求人 - 第二節</h3>
                        <div class="content">
                            <p>動態網頁的元素走訪，都需要透過不斷地實作、練習（自己手動輸入程式碼），同時...</p>
                        </div>
                        <div class="content-more">
                            <a class="more-link">More</a>
                        </div>
                    </section>
                    <section class="episode">
                        <h3 class="title">HTML parser 開發不求人 - 第一節</h3>
                        <div class="content">
                            <p>動態網頁的元素走訪，都需要透過不斷地實作、練習（自己手動輸入程式碼），同時...</p>
                        </div>
                        <div class="content-more">
                            <a class="more-link">More</a>
                        </div>
                    </section>
                </article>
            </main>

            <!-- footer 在這裡是簡單提供網站的基礎資訊 -->
            <footer class="footer">
                <p>歡迎光臨！本站由 Darren Yang 本人親自虛構…</p>
            </footer>
        </div>
    </body>
</html>`;


/**
 * jsdom + jquery 第一種作法
 */
// const jsdom = require("jsdom");
// const { JSDOM } = jsdom;
// const { window } = new JSDOM();
// const $ = require('jquery')(window);
// console.log( $(html).find('nav.nav.nav-info ul.nav-body li.nav-list:eq(0) a.center.link-custom').text() );
// console.log( $(html).find('aside.menu ul.menu-body li.menu-list:eq(2) a.center').text() );
// console.log( $(html).find('footer.footer p').text() );

/**
 * jsdom + jquery 第二種作法 (實體化時，參數放置了 html 原始文字資料)
 */
// const jsdom = require("jsdom");
// const { JSDOM } = jsdom;
// const { window } = new JSDOM(html); //←重點在於參數放置了 html 原始文字資料
// const $ = require('jquery')(window);
// console.log( $('nav.nav.nav-info ul.nav-body li.nav-list:eq(0) a.center.link-custom').text() );
// console.log( $('aside.menu ul.menu-body li.menu-list:eq(2) a.center').text() );
// console.log( $('footer.footer p').text() );

/**
 * 使用 cheerio
 */
// const cheerio = require('cheerio');
// const $ = cheerio.load(html);
// console.log( $('nav.nav.nav-info ul.nav-body li.nav-list').eq(0).find('a.center.link-custom').text() );
// console.log( $('aside.menu ul.menu-body li.menu-list').eq(2).find('a.center').text() );
// console.log( $('footer.footer p').text() );