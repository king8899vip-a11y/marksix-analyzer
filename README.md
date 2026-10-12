# 六合彩分析助手 · GitHub Pages 版

这是一个手机优先的静态 Web App / PWA，可直接部署到 GitHub Pages。

## 最快部署
1. 在 GitHub 新建仓库，例如 `marksix-analyzer`。
2. 将本文件夹内 **所有文件** 上传到仓库根目录（不要只上传 zip）。
3. 进入 `Settings → Pages`。
4. `Source` 选 `Deploy from a branch`。
5. Branch 选 `main`，Folder 选 `/(root)`，保存。
6. 数分钟后访问 `https://你的用户名.github.io/marksix-analyzer/`。

## 数据更新结构
- 默认读取 `data/snapshot.json`。
- `config.js` 里 `DATA_URL` 留空时使用本地 JSON。
- 将来有自己的 API 后，只需把 `DATA_URL` 改成公开 JSON 接口地址，前端无需重写。
- 页面请求数据时使用 `no-store`，同时 Service Worker 保留最后一次可用快照用于离线展示。

## 数据 JSON 最小结构
```json
{
  "latest":{"issue":"26/096","date":"2026-09-05","main":[9,18,26,30,33,45],"special":28},
  "sampleCount":50,
  "hotNumber":7,
  "hotZodiac":"鼠",
  "numberRanking":[],
  "zodiacRanking":[],
  "specialPool":[]
}
```

## 当前定位
开奖记录与统计分析 / 娱乐模拟选号。历史偏热不代表下一期真实概率更高。

## V3.0.2 运维说明

- 部署仅使用现有 Pages 的 `main / (root)` 分支发布。自动更新工作流负责核验数据、生成独立页面并提交，已移除重复的 Actions Pages 部署及 75 秒等待。
- 每小时 17、47 分触发更新；GitHub 定时任务可能延迟。失败会保留已发布的数据。页面每 30 分钟刷新本站历史数据，官方即时核对是补充；跨域接口无法连接时保留原数据。
- 独立页包含 canonical，所有数据入口使用真实路径；SEO 收录和排名需由搜索引擎决定。
- `THIRD_PARTY_LINK` 仅预留配置，默认关闭、网址为空、合规确认未通过，没有渲染外链。收到网址并完成适用地区的博彩推广合规确认前，不开启或接入推广。本站不开发游戏。
- 验证：`node scripts/test-update.mjs`、`node scripts/generate-pages.mjs`。更新接口拒绝重复号码、非法日期、未来日期、重复期号和来源倒退。

## V3.1 内容导航平台

首页提供资料搜索、开奖记录／号码／生肖／特别号分类入口。新增 `/draw/`、`/number/`、`/zodiac/`、`/search/` 和 `/archive/<年份>/`，年度记录覆盖当前历史数据的全部年份。号码页与生肖页通过链接连接到相关资料。

搜索支持号码、生肖、期号、日期、年份；旧期号进入年份页对应记录。首页号码和生肖目录在禁用 JavaScript 时仍可访问。自动更新脚本同步重新生成分类目录、年度记录和首页静态入口，并保存进分支供 Pages 发布。

流量入口的定位是资料检索与内容导航；搜索引擎收录、排名与实际访问量需持续积累，版本上线不等于已获得流量。

## V3.1.1 统计与机器专题

- 首页和独立资料页加载既有 Cloudflare Web Analytics token 的官方 beacon，提供页面访问、来源、设备、地区与加载性能统计；搜索页及本地开发不加载 beacon，生成号码不作为自定义事件上报。
- 当前使用独立页面路径观察资料访问热度；没有自定义点击事件接收后端。统计报表在 token 所属 Cloudflare 账户的 Web Analytics 后台查看，不在公开网站暴露账户密钥或捏造访问数据。客户端上报成功不等于已验证后台报表。
- 新增 `/machine/compare/`：以 2026-05-05 为时期分界，换机前最后 N 期与换机后最近 N 期取等量样本；分开列出49个号码的正选与特别号次数、出现率差值。JSON 下载：`data/machine-comparison.json`。
- 分界依据：https://corporate.hkjc.com/en-US/news-and-publications/corporate-news/2026-04/news_2026042101511 。接口没有逐期机器编号，所以不能据此把临时备用机归为某台主机；页面明确是时期对比，不能证明机器偏差。
- 检查：`node scripts/test-comparison.mjs`；自动更新会重新生成对比页和 JSON。
- Beacon 接入依据：https://developers.cloudflare.com/web-analytics/data-metrics/data-origin-and-collection/ 。
