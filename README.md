# DigitalGrave — 数字墓碑生成器

> 你的 GitHub，是你的数字墓碑。

一个为每个 GitHub 用户生成"数字遗产纪念碑"的单页应用。分析公开的 GitHub 数据，生成一张具有墓碑美学的纪念页面，模拟 IPFS 永久存档。

**[→ 立即体验](https://milab-bit.github.io/DigitalGrave/)**

---

## ✨ 功能特点

- 🔍 **GitHub 数据提取** — 自动获取用户信息、仓库、Stars、Fork 数
- 🪦 **墓碑美学** — 古典墓碑设计风格，时间轴、遗言、Commit Hash
- 🏆 **Magnum Opus** — 自动展示 Star 最多的原创仓库
- 📦 **IPFS 存档** — 模拟生成 IPFS CID，支持永久存储（v1.1 真实接入）
- 🔗 **一键分享** — 生成分享链接，分享你的数字墓碑
- 🌓 **响应式设计** — 完美适配桌面端和移动端

---

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | React 18 + TypeScript |
| 构建工具 | Vite 5 |
| 样式 | Tailwind CSS 3 |
| 图标 | Lucide React |
| 数据源 | GitHub REST API v3 |
| 存储 | localStorage（缓存） |
| 部署 | GitHub Pages |

---

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
npm run preview
```

---

## 📁 项目结构

```
src/
├── main.tsx              # 入口
├── App.tsx               # 视图路由 + 状态管理
├── index.css             # 全局样式 + 动画
├── pages/
│   ├── LandingPage.tsx   # 入口介绍页
│   ├── ConfigPage.tsx   # 双步配置表单
│   └── TombstonePage.tsx # 墓碑展示页
├── components/
│   ├── TombstoneCard.tsx # 墓碑核心卡片
│   ├── RepoCard.tsx      # 仓库展示卡片
│   ├── IpfsPanel.tsx     # IPFS 存档面板
│   └── ...
├── services/
│   └── github.ts         # GitHub API 封装 + 降级策略
├── hooks/
│   ├── useGitHub.ts      # GitHub 数据获取
│   └── useLocalStorage.ts # 本地持久化
├── types/
│   └── index.ts          # TypeScript 类型定义
└── utils/
    ├── formatters.ts     # 日期/文本格式化
    ├── hash.ts           # 哈希生成
    └── helpers.ts        # 通用工具函数
```

---

## 🔧 环境变量（可选）

```env
# .env.local（可选，用于 IPFS 真实接入，v1.1 实现）
VITE_PINATA_JWT=your_pinata_jwt_token
```

---

## 📝 开发说明

### 代码规范

```bash
# 检查代码格式
npm run lint

# 格式化代码
npm run format
```

### GitHub API 限制

本项目使用 GitHub 公开的未授权 API，有 **60 次/小时** 的速率限制。

- 项目内置 5 分钟 localStorage 缓存，重复查询相同用户不会消耗 API 配额
- 如果频繁触发限速，可以在 `.env.local` 中配置 GitHub Personal Access Token：

```env
VITE_GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
```

---

## 🎨 设计参考

- **墓碑配色：** Stone 950 (`#0a0a0a`) + Stone 400 (文字) + Gold (`#b8860b` 装饰)
- **字体：** Georgia / Times New Roman（墓碑文字）+ JetBrains Mono（数据）
- **动画：** glitch（标题）+ fade-in-up（页面过渡）+ 打字机效果（CID 显示）

---

## 📄 文档

- [SPEC.md](./SPEC.md) — 功能规格文档
- [ROADMAP.md](./ROADMAP.md) — 版本路线图
- [REFACTOR_PLAN.md](./REFACTOR_PLAN.md) — 重构计划

---

## 🤝 参与贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

MIT License