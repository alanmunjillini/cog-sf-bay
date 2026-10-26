# 旧金山湾区教会网站 · Church of God in SF Bay Area

纯静态网站：没有服务器、没有数据库、不需要编译。改完文件推送到 GitHub，网站一两分钟内自动更新。

A plain static site — no server, no database, no build step. Push a change to `main` and GitHub Pages updates the site in a minute or two.

## 每周更新日历 · Updating the calendar each week

只需要改一个文件：**`data/schedule.js`**

1. 在 GitHub 上打开 `data/schedule.js`，点右上角的铅笔图标（Edit）。
2. 修改后点 **Commit changes**。
3. 等一两分钟，刷新网站。

文件里有两部分：

| 部分 | 用途 | 例子 |
|---|---|---|
| `weekly` | 固定聚会，每周自动出现 | 南湾主日聚会，每周日 2–4 PM |
| `events` | 特别聚会，只出现在某一天 | 感恩节福音聚会 2026-11-22 |

- 某次固定聚会暂停：在那条后面加 `skip: ["2026-11-29"]`
- `region` 填 `"berkeley"`、`"scu"`、`"de-anza"`、`"south-bay"`、`"stanford"`，或 `"all"`（全湾区，各区页面都会显示）
- 时间用 24 小时制：`"14:00"` = 2:00 PM
- 每一条最后的逗号 `,` 和引号 `"` 不要漏掉；改完如果日历变空白，多半是少了逗号或引号

## 其他内容 · Other content

| 要改什么 | 文件 |
|---|---|
| 教会名称、邮箱、联系表格、税号、Zelle、五个区的介绍和颜色 | `data/site.js` |
| 页面上的固定文字（欢迎词、按钮文字，中英文） | `js/app.js` 顶部的 `I18N` |
| 颜色、字体、版面 | `css/style.css` |

## 文件结构 · Structure

```
index.html            主页：欢迎、五个区、每周日历、特别聚会、联系我们
berkeley.html         各区页面（内容都来自 data/ 里的文件）
scu.html
de-anza.html
south-bay.html
stanford.html
data/schedule.js      ← 每周改这个
data/site.js          ← 基本信息
js/app.js             页面逻辑（一般不用改）
css/style.css         样式
```

## 本地预览 · Preview locally

直接用浏览器打开 `index.html` 就可以，或者：

```bash
python3 -m http.server 8000
```

然后打开 http://localhost:8000
