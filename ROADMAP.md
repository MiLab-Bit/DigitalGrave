# DigitalGrave 路线图 (ROADMAP)

---

## v1.0 — 重构版（当前）

> 目标：从无法运行的单文件项目，升级为可维护、可扩展的 TypeScript + React + Vite 项目

**预计时间：** 1-2 周
**状态：** 🚧 进行中

### 完成项

- [x] 项目工程化（Vite + TypeScript + Tailwind）
- [x] 目录结构重设计（pages / components / services / hooks / types / utils）
- [x] TypeScript 类型完整定义
- [x] GitHub API 服务层（含缓存 + 降级策略）
- [x] 墓碑核心组件（TombstoneCard / RepoCard / IpfsPanel）
- [x] 页面组件（LandingPage / ConfigPage / TombstonePage）
- [x] 全局样式系统（CSS 动画 / glitch / fade-in / scrollbar）
- [x] 功能规格文档（SPEC.md）

### 待完成

- [ ] 真实 IPFS 接入（Web3.Storage / Pinata）
- [ ] 功能测试（Vitest）
- [ ] CI/CD 配置（GitHub Actions → GitHub Pages）
- [ ] 文档完善（README + CONTRIBUTING）

---

## v1.1 — IPFS 真实接入

> 将"IPFS 存档"从模拟变为真实

**预计时间：** 1 周

### 任务

- [ ] 注册 [Pinata](https://pinata.cloud/) 账号
- [ ] 生成 API Key
- [ ] 实现 `services/ipfs.ts`：
  - 将墓碑数据序列化为 JSON
  - 通过 Pinata API 上传到 IPFS
  - 返回真实 CID
- [ ] 在 `.env` 中配置 `VITE_PINATA_JWT`
- [ ] 保留模拟模式（无 Token 时降级到模拟 CID）

---

## v1.2 — 用户系统与墓碑画廊

> 用户可保存、管理和分享墓碑

**预计时间：** 2-3 周

### 任务

- [ ] GitHub OAuth 登录（[Octokit.js](https://github.com/octokit/octokit.js)）
- [ ] Supabase 账号（PostgreSQL + Auth + Storage）
- [ ] 保存墓碑到 Supabase
- [ ] 墓碑画廊页面（Grid 展示所有保存的墓碑）
- [ ] 墓碑详情页 + 分享链接
- [ ] 墓碑删除功能

---

## v1.3 — 社交功能（"上香"）

> 给他人的墓碑"上香"（Star / Fork 的隐喻延伸）

**预计时间：** 2 周

### 任务

- [ ] 墓碑留言板（每块墓碑可留言）
- [ ] "上香"功能（点击一次，数字蜡烛 +1）
- [ ] 墓碑排行榜（最多次"上香"的墓碑）
- [ ] 墓碑浏览画廊（随机展示他人墓碑）

---

## v1.4 — Dead Man's Switch

> 设置触发条件（无登录 X 天），自动发送邮件通知

**预计时间：** 2-3 周

### 任务

- [ ] GitHub Actions 定时爬取用户活跃状态
- [ ] 定义触发规则（最后 Commit > X 天）
- [ ] 邮件通知（Resend / SendGrid）
- [ ] 配置面板（设置触发天数 / 接收邮箱 / 通知内容）
- [ ] 模拟模式（不真实发送邮件，只显示效果）

---

## v2.0 — 平台化

> 从工具到平台

### 远期功能

- [ ] GitHub Actions 集成（自动每日更新墓碑数据）
- [ ] 墓碑 NFT mint（通过合约铸造）
- [ ] 团队/组织墓碑（项目死后的 README 墓志铭）
- [ ] AI 生成墓志铭（调用 DeepSeek/LLM 基于仓库 README 生成）
- [ ] 多语言支持（i18n）
- [ ] PWA 支持（离线可用 + 安装到桌面）

---

## 技术债务 & 清理

- [ ] 添加 Vitest 测试（覆盖率 > 70%）
- [ ] 添加 ESLint + Prettier CI 检查
- [ ] 添加 Lighthouse CI
- [ ] 性能优化（图片懒加载 / 字体优化）
- [ ] 暗黑模式切换
- [ ] 无障碍审计（WCAG 2.1 AA）

---

## 版本发布节奏

| 版本 | 内容 | 目标 |
|------|------|------|
| v1.0 | 重构上线 | 2026-05-xx |
| v1.1 | IPFS 真实接入 | 2026-06 |
| v1.2 | 墓碑画廊 | 2026-06 ~ 07 |
| v1.3 | 社交功能 | 2026-07 ~ 08 |
| v1.4 | Dead Man's Switch | 2026-08 ~ 09 |
| v2.0 | 平台化 | 2026-Q4 |