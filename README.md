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
