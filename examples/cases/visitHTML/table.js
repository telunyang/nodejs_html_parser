let html = `<table>
<thead>
    <tr>
        <th>標題1</th>
        <th>標題2</th>
        <th>標題3</th>
    </tr>
</thead>
<tbody>
    <tr>
        <td>第 1 行的第 1 個表格</td>
        <td>第 1 行的第 2 個表格</td>
        <td>第 1 行的第 3 個表格</td>
    </tr>
    <tr>
        <td>第 2 行的第 1 個表格</td>
        <td>第 2 行的第 2 個表格</td>
        <td>第 2 行的第 3 個表格</td>
    </tr>
    <tr>
        <td>第 3 行的第 1 個表格</td>
        <td>第 3 行的第 2 個表格</td>
        <td>第 3 行的第 3 個表格</td>
    </tr>
</tbody>
<tfoot>
    <tr>
        <td>表格尾端第 1 個表格</td>
        <td>表格尾端第 2 個表格</td>
        <td>表格尾端第 3 個表格</td>
    </tr>
</tfoot>
</table>
`;

const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const $ = require('jquery')(window);
console.log( $(html).find('tbody tr:eq(0) td:eq(1)').text() );
console.log( $(html).find('tbody tr:eq(2) td:eq(0)').text() );
console.log( $(html).find('tfoot tr td:eq(1)').text() );