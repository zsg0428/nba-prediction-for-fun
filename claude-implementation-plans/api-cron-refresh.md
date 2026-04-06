# API Data Refresh: Cron Job + Admin Manual Refresh

## Problem
当前每次用户打开 predictions 页面都会调用 Balldontlie API 3 次，导致：
- 免费 API 频繁被限流 (429)
- 页面加载慢（等外部 API 响应）
- 多用户同时访问时更容易触发限流

## Solution
页面只从数据库读数据。数据刷新通过两种方式：
1. **Vercel Cron Job** — 定时自动刷新
2. **Admin 手动刷新按钮** — 需要时手动触发

---

## Task 1: 创建 API Route 用于刷新数据

创建 `app/api/cron/refresh-games/route.ts`：
- 调用 `refreshGamesWithinOneMonth()` 同步比赛日程
- 调用 `refreshGameRounds()` 自动分配 playoff 轮次
- 调用 `refreshPredictions()` 更新预测正确性（比赛结束后）
- 添加 `CRON_SECRET` 环境变量验证，防止被外部随意调用
- 返回 JSON 结果（成功/失败，刷新了多少条数据）

## Task 2: 配置 Vercel Cron Job

创建/更新 `vercel.json`：
```json
{
  "crons": [
    {
      "path": "/api/cron/refresh-games",
      "schedule": "*/30 * * * *"
    }
  ]
}
```
- 每 30 分钟刷新一次
- Vercel 免费版支持每天最多调用 1 次 cron（Hobby plan）
- **注意：Vercel Hobby plan cron 最小间隔是每天 1 次。如果需要 30 分钟间隔，需要 Pro plan 或者用外部 cron 服务（如 cron-job.org）**

**替代方案（如果 Hobby plan）：**
- 设为每天刷新 1 次（`0 10 * * *`，每天上午 10 点 ET）
- 结合 admin 手动刷新来覆盖比赛日的需求

## Task 3: 修改 predictions 页面 — 只读数据库

修改 `app/(protected)/predictions/page.tsx`：
- 移除 `init()` 中的 `refreshGamesWithinOneMonth()` 调用
- 移除直接调用 `fetchGames()` 和 `fetchGamesInSingleDay()` 
- 改为从数据库查询今日比赛和未来比赛
- 新增 `fetchTodaysGamesFromDb()` 和 `fetchUpcomingGamesFromDb()` 在 `actions/games.ts`

改动点：
```
// Before (每次页面加载都调 API)
await refreshGamesWithinOneMonth();
const todaysGames = await fetchGamesInSingleDay(today);  // API call
const allGames = await fetchGames();  // API call

// After (只读数据库)
const todaysGames = await fetchTodaysGamesFromDb(today);  // DB query
const allGames = await fetchUpcomingGamesFromDb();  // DB query
```

## Task 4: Admin 页面添加手动刷新按钮

在 admin 页面添加：
- "刷新比赛数据" 按钮，调用 `refreshGamesWithinOneMonth()` + `refreshGameRounds()`
- "刷新预测结果" 按钮，调用 `refreshPredictions()`
- 显示 loading 状态和结果 toast
- 只有 ADMIN 角色可以操作

## Task 5: 添加 CRON_SECRET 环境变量

- 生成一个随机 secret
- 添加到 `.env` 和 Vercel 环境变量
- cron route 里验证 `Authorization: Bearer <CRON_SECRET>`

## Task 6: Past Games 页面同样改为只读 DB

检查 `pastGames/page.tsx`，确保也不直接调 API。

---

## 数据结构注意

当前 predictions 页面用的是 Balldontlie API 返回的 `NBAGame` 类型，包含 `home_team.name`、`visitor_team`、`home_team_score` 等字段。改为从 DB 读取后，数据结构是 Prisma 的 `Game` model（`homeTeam`、`awayTeam`）。

**需要统一数据类型**，可能需要：
- 调整组件 props 适配 DB 数据格式
- 或者在查询时转换为组件期望的格式

这是改动最大的部分，需要检查所有用到 `NBAGame` 类型的组件。

---

## Implementation Order
1. Task 1 (API route) + Task 5 (env var)
2. Task 3 (predictions 页面改 DB) — 这是核心改动，涉及组件类型适配
3. Task 4 (admin 手动刷新)
4. Task 2 (cron 配置)
5. Task 6 (past games)
