# DigitalGrave 功能规格 (SPEC)

> 本文档定义项目的完整功能范围、用户流程与技术细节。

---

## 1. 产品概述

**DigitalGrave** 是一个为 GitHub 用户生成"数字墓碑"的单页应用。用户输入 GitHub 用户名和一段"数字遗言"，系统从 GitHub 公开 API 获取用户数据，生成一张具有墓碑美学的纪念页面，支持 IPFS 永久存档模拟和社交分享。

**目标用户：** 有 GitHub 账号的开发者，尤其是开源社区活跃成员。

---

## 2. 用户流程

```
[Landing] → [Config Step 1: GitHub ID] → [Config Step 2: 遗言] → [Loading] → [Tombstone] → [IPFS 存档 / 分享]
```

**详细步骤：**

1. **Landing Page（入口页）**
   - 全屏黑色终端风格，展示品牌和引言
   - 点击"初始化遗嘱"进入配置

2. **Config Page Step 1（身份锚定）**
   - 输入 GitHub 用户名
   - 实时显示 GitHub 头像预览
   - 支持 Enter 快捷键进入下一步
   - 验证 GitHub 用户名格式

3. **Config Page Step 2（最后的 Commit）**
   - 输入"数字遗言"，限 280 字符
   - 显示字符计数器
   - 支持返回 Step 1 修改用户名

4. **Loading Screen（加载动画）**
   - 显示墓碑提取动画
   - 持续 800ms（制造仪式感）

5. **Tombstone Page（墓碑展示）**
   - 墓碑卡片（居中，古典边框）
   - 显示 GitHub 头像、用户名、Bio
   - 时间轴（注册时间 ↔ 最后活跃时间）
   - 数字遗言（斜体大字）
   - Magnum Opus（Star 最多的原创仓库）
   - GitHub Legacy Stats（可展开：Stars / Forks / Commits / Repos）
   - 最终 Commit Hash
   - IPFS 存档按钮 → CID 显示 → 分享按钮
   - "Create Another Tombstone" 重新开始

6. **分享 & 存档**
   - 复制 IPFS CID
   - 复制分享链接
   - 跳转到 GitHub 主页

---

## 3. 功能列表

### P0 - MVP 必须

- [x] Landing 页面（含动画和引言）
- [x] 双步配置表单（用户名 + 遗言）
- [x] GitHub 用户名实时验证
- [x] 头像预览
- [x] GitHub REST API 数据获取（用户 + 仓库）
- [x] 墓碑卡片渲染（头像 / 时间轴 / 遗言 / Top Repo）
- [x] GitHub API 限速友好处理（降级 + 友好提示）
- [x] localStorage 缓存（5分钟 TTL）
- [x] IPFS CID 模拟生成
- [x] 分享功能
- [x] 重新生成墓碑

### P1 - 专业版

- [ ] 真实 IPFS 接入（Web3.Storage / Pinata API）
- [ ] 墓碑画廊（保存/查看历史墓碑）
- [ ] URL 参数化（`?user=xxx&msg=xxx` 分享）
- [ ] 暗黑模式切换
- [ ] Dead Man's Switch（定时邮件通知）
- [ ] GitHub OAuth（保存墓碑到个人页面）

### P2 - 探索性

- [ ] GitHub Actions 集成（每日自动更新墓碑）
- [ ] 墓碑 NFT mint
- [ ] 多人协作墓碑（团队项目墓碑）
- [ ] 墓碑 AI 评价（调用 LLM 分析仓库 README）

---

## 4. 数据字段说明

### GitHub API 字段映射

| 墓碑元素 | GitHub 字段 |
|---------|------------|
| 头像 | `avatar_url` |
| 用户名 | `login` / `name` |
| Bio | `bio` |
| 注册时间（Initialized） | `created_at` |
| 最后活跃时间（Terminated） | 最近 push 的仓库 `pushed_at` |
| Magnum Opus | Star 最多的原创仓库 |
| 最终 Commit Hash | 本地生成 40 位十六进制字符串 |
| Total Stars | 所有原创仓库 `stargazers_count` 之和 |
| Total Forks | 所有原创仓库 `forks_count` 之和 |

### IPFS CID

- MVP：本地生成模拟 CID（`Qm` 开头，44 字符 Base58）
- 正式版：调用 Pinata API 实际上传

---

## 5. 错误处理方案

| 错误场景 | 处理方式 |
|---------|---------|
| GitHub 用户不存在 | 显示红色错误提示，留在 Step 1 |
| API 限速（60次/小时） | 显示友好提示，允许降级显示或等待 |
| 网络错误 | 降级到模拟数据 + 底部提示 |
| 用户取消/空输入 | 表单验证，不提交 |
| localStorage 满 | 静默失败，不影响功能 |

---

## 6. 性能目标

- Lighthouse Performance ≥ 90
- First Contentful Paint < 1.5s
- No external requests on initial load (fonts/libraries via CDN acceptable)
- GitHub API calls ≤ 2 per tombstone generation (user + repos)

---

## 7. 验收标准

1. `npm install && npm run dev` 能在本地成功启动
2. 输入任意真实 GitHub 用户名，墓碑正确显示该用户信息
3. 输入不存在的用户名，显示友好错误提示
4. 所有动画流畅（60fps）
5. 页面在移动端可用（响应式）
6. 所有文字有适当的语言标记（lang="zh-CN"）