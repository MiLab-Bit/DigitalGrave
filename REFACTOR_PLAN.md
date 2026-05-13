# DigitalGrave 重构计划

> 数字墓碑生成器 · 从实验项目到专业作品

---

## 1. 现状分析

### 当前问题

| 问题 | 严重度 | 说明 |
|------|--------|------|
| 没有 `package.json` | 🔴 致命 | README 说 npm install/npm start，但根目录没有 package.json |
| `index.html` 实为 JSX | 🔴 致命 | 文件内容是 React JSX，无法被浏览器直接运行 |
| 无构建工具 | 🔴 致命 | 无法运行 `npm install && npm start` |
| 无 TypeScript | 🟡 中等 | 代码无类型约束，不利于协作 |
| CSS 动画未定义 | 🟡 中等 | 使用了 `animate-fade-in` / `glitch-effect` 等 class，但无对应 CSS |
| API 无速率限制处理 | 🟡 中等 | GitHub API 60次/小时限制会导致页面崩溃 |
| IPFS 完全模拟 | 🟢 低 | MVP 阶段可接受，后续接真实 IPFS |

### 当前代码结构

```
DigitalGrave/
└── index.html   ← 实为 JSX，被错误命名为 .html
    ├── Intro       (页面)
    ├── ConfigForm  (页面)
    ├── Tombstone   (页面)
    ├── fetchGitHubData (逻辑)
    └── 状态管理    (local state in App)
```

### 目标代码结构

```
DigitalGrave/
├── public/
│   └── favicon.svg
├── src/
│   ├── main.tsx                   ← 入口
│   ├── App.tsx                    ← 路由/视图切换
│   ├── index.css                  ← 全局样式 + 动画定义
│   ├── pages/
│   │   ├── LandingPage.tsx        ← 入口介绍页 (原 Intro)
│   │   ├── ConfigPage.tsx         ← 配置页 (原 ConfigForm)
│   │   └── TombstonePage.tsx      ← 墓碑页
│   ├── components/
│   │   ├── TombstoneCard.tsx      ← 墓碑核心卡片
│   │   ├── GitHubUserInfo.tsx     ← GitHub 用户信息
│   │   ├── RepoCard.tsx           ← 仓库展示卡片
│   │   ├── IpfsPanel.tsx          ← IPFS 存档面板
│   │   ├── ProgressBar.tsx        ← 步骤进度条
│   │   └── AnimatedText.tsx        ← 动画文字
│   ├── services/
│   │   └── github.ts              ← GitHub API 封装 + 降级策略
│   ├── hooks/
│   │   ├── useGitHub.ts           ← GitHub 数据获取 hook
│   │   └── useLocalStorage.ts     ← 本地持久化
│   ├── types/
│   │   └── index.ts               ← TypeScript 类型定义
│   └── utils/
│       ├── formatters.ts          ← 日期/文本格式化
│       ├── hash.ts                ← 哈希生成工具
│       └── animations.ts           ← 动画效果工具
├── index.html                     ← Vite 入口 HTML (真正的 HTML)
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── .eslintrc.cjs
├── .prettierrc
├── SPEC.md                        ← 功能规格文档 ← 新增
└── ROADMAP.md                     ← 路线图      ← 新增
```

---

## 2. TypeScript 类型设计

```typescript
// 核心数据结构
interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  created_at: string;        // 注册时间
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
}

interface GitHubRepo {
  name: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  pushed_at: string;         // 最后推送时间
  fork: boolean;
  html_url: string;
}

interface GraveData {
  user: GitHubUser;
  message: string;           // 数字遗言
  topRepo: GitHubRepo;       // Stars 最多的原创仓库
  lastPush: string;          // 最后活跃时间
  lastHash: string;          // 模拟最终 commit hash
  ipfsHash: string | null;   // IPFS CID
  createdAt: string;         // 生成时间
}

type AppView = 'landing' | 'config' | 'tombstone';

interface ApiState {
  status: 'idle' | 'loading' | 'success' | 'error' | 'rate_limited';
  errorMessage?: string;
}
```

---

## 3. 页面设计

### LandingPage（入口页）

- 全屏黑色终端风格
- 居中显示 `DIGITAL GRAVE` 标题带 glitch 动画
- 副标题：`你的 GitHub，是你的数字墓碑`
- 引用框（法老/木乃伊主题引言）
- CTA 按钮："初始化遗嘱" 带有滑动效果
- 底部 GitHub 链接

**动画：**
- 标题 glitch（文本抖动+颜色分离效果）
- 文字逐字淡入（打字机效果）
- 按钮 hover 滑动填充

### ConfigPage（配置页）

- 双步表单（Step 1: GitHub ID → Step 2: 数字遗言）
- 顶部进度条（50% → 100%）
- Step 1: 大字输入 GitHub 用户名，带实时验证（输入时显示头像预览）
- Step 2: 大文本框输入遗言，placeholder 有引导文字
- 支持键盘快捷键（Enter 下一歩，Esc 返回）
- 底部版权提示

**动画：**
- 步骤切换淡入动画
- 进度条平滑过渡
- 头像出现时的缩放动画

### TombstonePage（墓碑页）

- 墓碑卡片（居中，深色背景，古典边框装饰）
- 顶部：圆形黑白头像 + 用户名
- 装饰边框（四角）
- 时间轴：注册时间 ↔ 最后活跃时间
- 遗言展示（斜体大字）
- Magnum Opus：最星仓库卡片
- 底部：模拟 Commit Hash
- 操作区：IPFS 存档按钮 → CID 显示 → 分享按钮

**动画：**
- 墓碑卡片从下方滑入 + 淡入
- IPFS 按钮点击后出现旋转加载
- CID 生成时逐字显示

---

## 4. 服务层设计（github.ts）

```typescript
// 策略：优先真实 API，失败时优雅降级

async function fetchUser(username: string): Promise<GitHubUser> {
  // 1. 先检查 localStorage 缓存（5分钟有效）
  // 2. 请求 GET /users/{username}
  // 3. 若 403/429（限速）→ 使用缓存或降级数据
  // 4. 若 404 → 抛出 UserNotFoundError
}

async function fetchTopRepo(username: string): Promise<GitHubRepo> {
  // 1. GET /users/{username}/repos?sort=pushed&per_page=100
  // 2. 过滤掉 fork 的仓库
  // 3. 按 stars 排序，取最高者
  // 4. 同时找出最近 push 的仓库作为 lastPush
}

// 降级数据：当 API 不可用时返回的模拟数据
// 显示真实用户名和真实头像（通过 ui-avatars.com 生成）
```

---

## 5. 样式系统

### 配色

| Token | 色值 | 用途 |
|-------|------|------|
| `--color-bg` | `#000000` | 背景 |
| `--color-surface` | `#09090b` | 卡片/面板背景 |
| `--color-border` | `#27272a` | 边框 |
| `--color-stone` | `#78716c` | 墓碑石文字 |
| `--color-stone-light` | `#d6d3d1` | 墓碑主文字 |
| `--color-gold` | `#b8860b` | 强调/装饰 |
| `--color-error` | `#ef4444` | 错误 |

### 字体

- **墓碑文字**：Georgia / "Times New Roman"（衬线体，有碑刻感）
- **数据/代码**：JetBrains Mono（等宽）
- **UI 元素**：Inter

### 动画

| 名称 | 效果 |
|------|------|
| `glitch` | 标题文字抖动，颜色RGB分离 |
| `fade-in-up` | 从下方滑入 + 淡入 |
| `fade-in` | 简单淡入 |
| `slide-from-bottom` | 从底部滑入 |
| `spin` | 旋转（IPFS 加载） |
| `pulse` | 呼吸灯效果 |
| `typewriter` | 打字机效果（CID 显示） |

---

## 6. 新增功能（重构过程中实现）

- [ ] Step 1 输入 GitHub ID 时，**实时显示头像预览**
- [ ] GitHub API 限速时显示友好提示，不崩溃
- [ ] 墓碑页面添加"重新生成"按钮（回到 ConfigPage）
- [ ] 墓碑 URL 参数化：`?user=xxx&msg=xxx`，可直接分享
- [ ] CSS 自定义动画（glitch, fade-in-up 等）
- [ ] 墓碑底部显示统计数据（总 Stars / 总 Commits 估算）
- [ ] 暗黑主题墓碑（用户可切换）

---

## 7. 文档

### SPEC.md（功能规格）
- 完整功能列表
- 用户流程图（Mermaid）
- API 数据字段说明
- 错误处理方案

### ROADMAP.md（路线图）
- v1.0: 当前重构目标
- v1.1: IPFS 真实接入（Web3.Storage）
- v1.2: 用户系统 + 墓碑画廊
- v1.3: 社交功能（给他人上香）
- v1.4: Dead Man's Switch（定时邮件通知）

---

## 8. 里程碑

| 阶段 | 内容 | 交付物 |
|------|------|--------|
| **M1** | 工程化搭建 | package.json, vite.config.ts, tsconfig.json, index.html |
| **M2** | 类型定义 + 工具函数 | types/index.ts, utils/* |
| **M3** | 服务层 | services/github.ts（含降级策略） |
| **M4** | 共享组件 | ProgressBar, RepoCard, IpfsPanel, AnimatedText |
| **M5** | 页面组件 | LandingPage, ConfigPage, TombstonePage |
| **M6** | 墓碑卡片 | TombstoneCard（含所有动画） |
| **M7** | 样式系统 | index.css（全局 + 动画） |
| **M8** | 文档 | SPEC.md, ROADMAP.md, README.md |
| **M9** | 完整集成测试 | 手动遍历所有用户流程 |

---

## 9. 依赖清单

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.22.0",
    "lucide-react": "^0.344.0",
    "clsx": "^2.1.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vite": "^5.1.0",
    "@vitejs/plugin-react": "^4.2.1",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "eslint": "^8.57.0",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "prettier": "^3.2.0"
  }
}
```