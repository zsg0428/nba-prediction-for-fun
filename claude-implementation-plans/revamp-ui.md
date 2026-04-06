# UI Revamp — Modern Sports Prediction App

## Design Reference

参考业界体育预测/竞猜类 app：
- **FanDuel / DraftKings** — 深色主题 + 亮色 CTA，卡片式比赛列表，选中态明显
- **ESPN** — 清晰的比分展示，team logo 为视觉锚点，tab 式导航
- **Yahoo Fantasy** — 排行榜有 podium 风格，用户头像 + 积分高亮

### 设计方向
- **深色优先**（体育类 app 标配），light mode 保留但不是重点
- **卡片 + 层级感** — 比赛卡片有微妙阴影 + hover 抬起效果
- **橙色主色调**（NBA 能量感）+ 蓝色辅助
- **比赛状态清晰** — Scheduled(灰)、Live(绿色脉动)、Final(白) 状态标签
- **选中预测有强反馈** — 选中后卡片/按钮有 ring + glow 效果

---

## Color System

| Token | Light | Dark | 用途 |
|-------|-------|------|------|
| `--bg` | `#F1F5F9` slate-100 | `#0F172A` slate-900 | 页面背景 |
| `--card` | `#FFFFFF` | `#1E293B` slate-800 | 卡片背景 |
| `--card-hover` | `#F8FAFC` | `#334155` slate-700 | 卡片 hover |
| `--primary` | `#EA580C` orange-600 | `#F97316` orange-500 | 主 CTA / 选中态 |
| `--accent` | `#2563EB` blue-600 | `#3B82F6` blue-500 | 链接 / 辅助 |
| `--success` | `#16A34A` green-600 | `#4ADE80` green-400 | 预测正确 |
| `--error` | `#DC2626` red-600 | `#F87171` red-400 | 预测错误 |
| `--muted` | `#64748B` slate-500 | `#94A3B8` slate-400 | 次要文字 |

---

## Typography
- **Font:** 保持 Inter/Geist（现代、清晰）
- **比分数字:** `font-variant-numeric: tabular-nums` 确保数字对齐
- **层级:** Hero 2xl bold → Section title xl semibold → Card title base semibold → Body sm

---

## Task Breakdown

### Task 1: Tailwind 设计 Token + 全局样式
**改动文件:** `tailwind.config.ts`, `styles/globals.css`

- 在 tailwind 添加自定义颜色 token（nba-orange, nba-dark 等）
- 添加 glassmorphic utility（`.glass-card` = backdrop-blur + bg/border）
- 添加 hover lift utility（`.hover-lift`）
- 添加状态 badge 样式（scheduled/live/final）
- 替换所有 emoji icon 为 Lucide SVG（🏀→Basketball icon, ✅→CheckCircle, 🗓️→Calendar）

### Task 2: GameCard 重设计（核心组件）
**改动文件:** `components/Predicitions/GameCard.tsx`

**布局参考 FanDuel matchup card：**
```
┌─────────────────────────────────┐
│  [状态 badge]    [时间]    [轮次] │
│                                  │
│   [Logo]    0 : 0    [Logo]     │
│   Hawks      vs     Knicks      │
│                                  │
│  ┌──────────┐  ┌──────────┐     │
│  │  Hawks ✓ │  │  Knicks  │     │  ← 选中态有 ring + 背景色
│  └──────────┘  └──────────┘     │
│                                  │
│  Others: Alice→Hawks Bob→Knicks │
└─────────────────────────────────┘
```

- 顶部：状态 badge(左) + 时间(中) + 轮次(右)
- 中间：两队 logo + 名字，比分居中，大字体
- 预测按钮：选中态 = `bg-orange-500 text-white ring-2`，未选 = `border border-slate-300`
- 非 admin 用户隐藏 "Please assign a round"，显示轮次名或空
- 卡片 hover: `hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200`

### Task 3: Navbar 重设计
**改动文件:** `components/Nav/NavBar.tsx`

- 深色 navbar（dark mode 下 `bg-slate-900/80 backdrop-blur`）
- 活跃链接下方有 orange 指示条
- 移动端：底部 tab bar 而非汉堡菜单（更像原生 app）
- Logo 用篮球 Lucide icon + 文字

### Task 4: Predictions 页面布局
**改动文件:** `components/Predicitions/PredictionDashboard.tsx`, `app/(protected)/predictions/page.tsx`

- 顶部 hero 区域：用户头像 + 当前积分 summary（类似 DraftKings 余额展示）
- "Today's Games" 有高亮 section header + 比赛数量 badge
- "Upcoming" 按日期分组，日期标签为 pill badge
- 空状态：Lucide icon + 文案，不是纯文字

### Task 5: Today's Games & All Games Section
**改动文件:** `components/Games/TodaysGameSection.tsx`, `components/Games/AllGamesSection.tsx`

- Section header: icon + 标题 + count badge
- 卡片 grid: mobile 1列, tablet+ 2列
- Load More 按钮样式化
- 去掉 admin 功能对普通用户的视觉干扰

### Task 6: Leaderboard 页面
**改动文件:** `app/(protected)/leaderboard/page.tsx`

**参考 Yahoo Fantasy 排行榜：**
- Top 3 podium 展示（#1 金色, #2 银色, #3 铜色）大卡片
- 其余用户列表：rank badge + avatar + name + points
- 当前用户行高亮（orange border）
- 响应式表格

### Task 7: Past Games 页面
**改动文件:** `components/Games/PastGamesSection.tsx`

- 赢家高亮为绿色
- 显示用户的预测结果：✓ 正确(绿) / ✗ 错误(红)
- 时间线式布局或按日期分组

### Task 8: Login 页面
**改动文件:** `app/(auth)/login/page.tsx`

- 全屏深色背景 + 居中白色卡片
- 篮球主题渐变背景
- Google 登录按钮用官方样式
- App 名称 + tagline

### Task 9: Admin 页面
**改动文件:** `app/(protected)/admin/page.tsx`, `components/Admin/RefreshButtons.tsx`

- 操作卡片化布局
- 按钮有 loading spinner
- 成功/失败状态反馈

### Task 10: Rules 页面
**改动文件:** `app/(protected)/rules/page.tsx`

- 用卡片展示每个轮次的分数
- 视觉化积分规则（图标 + 颜色对应轮次）

### Task 11: 最终 Polish
- 响应式测试 375px / 768px / 1024px
- 所有 interactive 元素加 `cursor-pointer`
- Touch target ≥ 44px
- 去掉所有 emoji，统一用 Lucide icons
- 确保 dark/light mode 对比度达标

---

## Implementation Order

1. **Task 1** (设计 token) → 所有后续任务的基础
2. **Task 2** (GameCard) → 影响最大的核心组件
3. **Task 3** (Navbar) → 每个页面都能看到
4. **Task 4 + 5** (Predictions 页面) → 主页面
5. **Task 6** (Leaderboard) → 高可见度
6. **Task 7** (Past Games)
7. **Task 8** (Login)
8. **Task 9 + 10** (Admin + Rules)
9. **Task 11** (Polish)

## 原则
- **功能不变** — 纯视觉改造
- **shadcn/ui 为基础** — 用 Tailwind 重新样式化，不重写组件
- **Dark/Light mode 都支持** — dark 为主，light 也要好看
- **渐进式** — 每个 task 可以独立 commit 和测试
