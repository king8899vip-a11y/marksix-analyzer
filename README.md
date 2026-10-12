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
