# Gmail SMTP 邮件发送迁移

## 背景

原有实现使用 Resend 发送提醒邮件 (`lib/email.ts`),但免费版 Resend 的默认发件地址 `onboarding@resend.dev` 只允许发送给 Resend 账号注册邮箱,无法发给其他用户。由于项目没有自有域名(`*.vercel.app` 不是可用于邮件 DNS 验证的根域),无法 verify Resend domain。

用户量不大,改用 Gmail SMTP + Nodemailer(Gmail 每日 500 封上限足够)。

## 改动范围

- 替换邮件发送底层:Resend → Nodemailer(Gmail SMTP)
- 保留 `lib/email.ts` 的导出签名 `sendUnbidReminder(to, userName, unbidGames)` 不变
- HTML 模板完全保留,不改动视觉
- `app/api/cron/send-reminders/route.ts` 无需修改

## 步骤

### 1. 依赖
```
npm uninstall resend
npm install nodemailer
npm install -D @types/nodemailer
```

### 2. 环境变量

**本地 `.env`**(占位符,真实值用户自行填写):
```
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password
```

**Vercel(Production + Preview + Development 全部勾选):**
- `GMAIL_USER` = `zhang.dempsey@gmail.com`
- `GMAIL_APP_PASSWORD` = 从 https://myaccount.google.com/apppasswords 生成的 16 位 App Password(去掉空格)

迁移完成后 Resend 相关变量(`RESEND_API_KEY`)可删除。

### 3. 重写 `lib/email.ts`

- 用 `nodemailer.createTransport({ service: 'gmail', auth: { user, pass } })` 创建 transporter
- 保持 `FROM_ADDRESS = '"NBA Predictor" <${process.env.GMAIL_USER}>'`,让收件人看到的 sender 名是 "NBA Predictor"
- 保留原 HTML 模板与 subject 逻辑
- 保留 `sendUnbidReminder` 函数签名,调用方 (`send-reminders/route.ts`) 零修改

### 4. 验证

- `npm run build` 通过类型与构建
- 本地 `curl` 测试 cron 路由(带 `Authorization: Bearer <CRON_SECRET>`),至少发出一封真实邮件到自己的 Gmail
- 部署到 Vercel 后手动在 Cron Jobs 面板点 "Run" 触发,观察 Function Logs

## 限制与注意

- Gmail 每日 500 封发送上限;超出会被 Google 临时 block
- 发件地址必须是账号本人邮箱,不能伪造
- App Password 一旦泄露应立刻在 Google Account 里撤销重新生成
- Gmail SMTP 对邮件频率敏感,建议 cron 里发送循环加 200ms 左右的间隔(当前规模可不加)
