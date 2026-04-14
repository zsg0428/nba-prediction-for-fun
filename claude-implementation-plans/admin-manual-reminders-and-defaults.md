# Admin 手动发送提醒邮件 + 用户邮件提醒默认开启

## 背景

当前邮件提醒只能依赖 cron(每天 16:00 UTC),且暂未触发。希望管理员能在 admin 面板里:
- 看到今天还有谁没有竞猜
- 一键给所有未竞猜用户发提醒
- 单独给某个用户发提醒
- 预览邮件长什么样(不实际发送)

同时把所有现存用户的 `emailReminders` 改为 `true`(数据库 schema 默认值已经是 `true`,但历史数据可能还是 `false`)。

## 改动范围

### A. 共享逻辑抽取
- 新建 `lib/reminders.ts`,把 `app/api/cron/send-reminders/route.ts` 里的核心循环抽出来:
  ```ts
  export type ReminderResult = { sent: number; failed: number; skipped: number; details: Array<{ email: string; status: "sent" | "failed" | "skipped"; error?: string }> };
  export async function getTodaysUnbidUsers(): Promise<UnbidUserRow[]>;
  export async function sendRemindersForUsers(userIds: string[]): Promise<ReminderResult>;
  ```
- `route.ts` 改为调用 `sendRemindersForUsers(allEnabledUserIds)` 后返回结果

### B. Admin 页面重构成 Tabs
- 现有 `app/(protected)/admin/page.tsx` 三个 section(RefreshButtons / RoundPointsManager / BulkGameManager)用 shadcn `<Tabs>` 包起来
- 4 个 tab:
  - **Data Refresh** — 现有 RefreshButtons
  - **Rounds** — 现有 RoundPointsManager
  - **Games** — 现有 BulkGameManager
  - **Reminders** — 新增

### C. Reminders Tab 内容(新组件 `components/Admin/ReminderManager.tsx`)
- 顶部统计行:`今日未开打比赛 N 场 | 启用提醒用户 X 人 | 仍有未押注用户 Y 人`
- 顶部"一键发送给所有未押注用户"按钮 → AlertDialog 确认弹窗显示"将给 Y 人发送提醒邮件",确认后调用 `sendBulkReminders` server action
- 用户列表表格:
  | 用户 | 邮箱 | 未押注场次 | 操作 |
  |---|---|---|---|
  | 头像 + 名字 | xxx@gmail.com | 红色 badge `3 unbid` 或灰色 `All bid` | [预览] [发送] |
- 单独"发送"按钮 → 直接调用 `sendReminderToUser(userId)`,Sonner toast 反馈
- "预览"按钮 → 弹一个 Dialog,iframe `srcDoc` 渲染该用户即将收到的邮件 HTML(不实际发送)

### D. Server actions(新文件 `actions/reminders.ts`)
- `getReminderOverview()` — 调 `getTodaysUnbidUsers()`,返回所有 `emailReminders=true` 用户及其未押注比赛
- `sendBulkReminders()` — 取所有未押注 user 的 id,调 `sendRemindersForUsers`
- `sendReminderToUser(userId)` — 调 `sendRemindersForUsers([userId])`
- `previewReminderHtml(userId)` — 调 `lib/email.ts` 内部模板函数返回 HTML 字符串(不发送)。需要把 HTML 模板从 `sendUnbidReminder` 里抽成独立 `buildUnbidReminderHtml(userName, unbidGames)`
- 所有 action 开头都做 admin 权限检查(`auth()` + `Role.ADMIN`)

### E. 数据库:批量更新现有用户
- 跑一次 SQL:`UPDATE "User" SET "emailReminders" = true WHERE "emailReminders" = false`
- 可以用 prisma client 在一个一次性 tsx 脚本里跑(`seed/enableAllReminders.ts`),也可以用 supabase MCP 直接执行
- prod 和 dev 共用同一个 DB,跑一次即可
- schema 里 `emailReminders Boolean @default(true)` 已经是 true,无需改动

## 文件清单

**新增:**
- `lib/reminders.ts` — 共享逻辑
- `actions/reminders.ts` — admin server actions
- `components/Admin/ReminderManager.tsx` — UI
- `seed/enableAllReminders.ts` — 一次性 update 脚本

**修改:**
- `app/api/cron/send-reminders/route.ts` — 改用 `lib/reminders.ts`
- `app/(protected)/admin/page.tsx` — 重构成 Tabs
- `lib/email.ts` — 抽出 `buildUnbidReminderHtml`(供 preview 复用)

## 验证步骤

1. `npm run build` 类型 + 构建通过
2. 跑 `npx tsx --env-file=.env seed/enableAllReminders.ts`,确认所有用户被 update
3. 本地 `npm run dev`,以 admin 账号登录 → /admin → Reminders tab:
   - 看到用户列表与未押注 badge
   - 点单个用户的 "Preview" 弹窗能渲染邮件
   - 点 "Send" 给自己发一封,查 Gmail 收到
   - 点 "Send to all unbid" 触发确认弹窗 → 确认 → toast 显示结果
4. 部署后在生产 admin 面板再测一次

## 注意

- iframe 预览要用 `sandbox="allow-same-origin"`(防 XSS)且不允许 form / scripts
- 单次 bulk send 如果用户多,Gmail 频率限制下可能慢——加 200ms throttle 或 `Promise.all` 都行,目前规模 `Promise.all` 即可
- 每个 send action 完成后调用 `revalidatePath('/admin')` 刷新数据
