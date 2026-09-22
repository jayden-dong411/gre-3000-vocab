# GRE 镇考 3000

纯前端 GRE 词汇学习 PWA：每日新词（默认 100）+ 艾宾浩斯间隔复习。词库随应用打包，首次打开后可离线背词；进度写在浏览器 `localStorage`，无需后端。

**线上地址（生产 HTTPS）：** https://gre-3000-vocab.vercel.app

## 本地运行

```bash
git clone https://github.com/jayden-dong411/gre-3000-vocab.git
cd gre-3000-vocab
npm install
npm run dev
```

开发服务器默认 `http://127.0.0.1:43173`。

底部四个入口：今日、学习、复习、词库。今日页是进度看板，不带复习侧栏。学习页里单词在上、评分按钮在中间，释义默认藏起，点卡片或按空格才翻开；宽屏时右侧是到期复习，单词在上、四个选项纵向排列，复习区约占一半宽度。词库按未学、复习中、已掌握筛选，点开单词才显示释义，进入 7 天档记为已掌握。

- 新词：空格或回车翻开释义，`1` 不认识，`2` 模糊，`3` 认识

生产构建（含 Service Worker / 可安装 PWA）：

```bash
npm run build
npm run preview
```

预览同样是 `http://127.0.0.1:43173`。完整离线与「添加到主屏幕」请用 **build + preview** 或线上 HTTPS 验证；`npm run dev` 也会注册开发用 SW，但安装体验以生产构建为准。

把 `dist/` 部署到任意静态主机即可（本仓库已部署到 [Vercel](https://gre-3000-vocab.vercel.app)）。安装到手机主屏幕需要 **HTTPS**（`localhost` 例外）。

## 桌面应用

先 `npm install`（会装上可选的 Electron），再打包：

```bash
npm run build
npm run desktop          # 本机直接打开窗口
npm run pack:linux       # Linux 可执行目录 release/linux-unpacked
npm run pack:mac         # Apple Silicon 安装包 release/GRE 3000-1.0.0-arm64-mac.zip（未签名，在 Mac 上右键打开）
```

窗口默认 1440×900。应用在本机起一个只监听 127.0.0.1 的静态服务来打开 `dist/`，进度仍写在这个窗口自己的本地存储里。

## 词库从哪来

源文件是《GRE 镇考 3000 词（乱序版）》PDF（WPS 表格导出，约 199 页词表）。仓库只保留解析结果 `public/data/words.json`，**不包含原 PDF**。

解析脚本：`scripts/parse_gre_pdf.py`（依赖 `pymupdf`）。做法：

1. 用 PyMuPDF `page.find_tables()` 识别五列表格：单词 / 音标 / 释义 / 等价词 / 例句。
2. 去掉水印（「微信公众号：张巍GRE」以及拆开的单字）。
3. 按列拆英汉、拼接被行宽截断的单词（如 `th` + `ousands` → `thousands`）。
4. 按英文词形去重，保留乱序版出现顺序。

当前打包词条 **3275** 个（正文 3000 词 + 文末真题新词），每条都有中文释义、音标和英文例句。重新解析：

```bash
pip install pymupdf
python3 scripts/parse_gre_pdf.py /path/to/gre3000.pdf public/data/words.json
```

## 艾宾浩斯复习间隔

每张卡片记录 `stage`（0–7）、`nextReviewAt`、`ease`、对错次数。

| 阶段 | 间隔                        |
| ---- | --------------------------- |
| 0    | 8 分钟（落在 5–10 分钟档）  |
| 1    | 30 分钟                     |
| 2    | 12 小时                     |
| 3    | 1 天                        |
| 4    | 2 天                        |
| 5    | 4 天                        |
| 6    | 7 天                        |
| 7    | 15 天（之后仍按 15 天循环） |

实际等待时间 = 上表 × (`ease` / 2.5)。`ease` 初值 2.5，答对 +0.1（上限 3.2），答错 −0.2（下限 1.3）。

- **新词「认识」**：从阶段 3 入队（约 1 天后复习）。
- **新词「模糊」**：从阶段 1 入队（约 30 分钟后再见）。
- **新词「不认识」**：立刻进入复习队列（阶段 0）；若复习再答错，则按 8 分钟重新排期。
- **复习答对**：阶段 +1，按新阶段排期。
- **复习答错**：阶段 −1（最低 0），提前再见面。

复习题型：只显示英文单词，从 4 个中文释义里选一个（1 个正确 + 3 个其它词的干扰项）。

## 每日新词

默认每天 100 个，右上角设置里可调 50–150（10 为步进）。队列按乱序词表顺序取尚未学过的词。当天进度、连续打卡天数、每张卡片的复习状态都存在浏览器 `localStorage` 键 `gre3000.vocab.v1`。换设备不会同步。

## 快捷键

- 新词：空格或回车翻开释义，`1` 不认识，`2` 模糊，`3` 认识
- 复习：`1`–`4` 选答案，反馈后空格/回车下一题

## 添加到手机主屏幕（PWA）

本应用是可安装的 Web App：`vite-plugin-pwa`（Workbox）会生成 Web App Manifest 与 Service Worker。首次打开后会缓存应用壳和 `/data/words.json`，之后断网也能背新词、做复习（进度仍在本机 `localStorage`）。

**最快：** 手机打开 https://gre-3000-vocab.vercel.app 再按下面步骤添加。

### iPhone / iPad（Safari）

1. 用 **Safari** 打开 https://gre-3000-vocab.vercel.app （或本机 `http://127.0.0.1:43173`）。
2. 点底部分享按钮（方框加向上箭头）。
3. 滑到「添加到主屏幕」→ 添加。
4. 主屏幕会出现「GRE 3000」，以独立窗口打开。

Chrome iOS 不能完整安装 PWA，请用系统 Safari。

### Android（Chrome）

1. 用 **Chrome** 打开 https://gre-3000-vocab.vercel.app 。
2. 菜单 ⋮ →「添加到主屏幕」/「安装应用」，或等待浏览器自己的安装横幅。
3. 确认后主屏幕会出现「GRE 3000」。

手机浏览器里首次访问首页会看到可关闭的提示：「分享 → 添加到主屏幕」。关掉后记在 `localStorage` 键 `gre3000.pwa-tip.v1`。

### 如何确认装上了 / 能离线

- Chrome DevTools → **Application**：Manifest 名称应为「GRE 3000 背词」，能看到 192 / 512 图标；Service Workers 为 activated；Cache Storage 里有预缓存和 `gre-word-bank`（含 `words.json`）。
- Lighthouse → PWA：installable、离线回退应通过（需 `npm run build && npm run preview` 或 HTTPS 部署）。
- 验证离线：打开一次应用后，DevTools Network 勾选 Offline，刷新仍能进入首页并加载词库。
