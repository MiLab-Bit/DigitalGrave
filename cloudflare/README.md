# DigitalGrave Edge (Cloudflare Worker)

Route B 的边缘函数实现，为纯前端 SPA 补齐三块必须依赖服务端的能力：

| 路由 | 能力 | 是否需要 Token |
|------|------|----------------|
| `GET /og?user=&msg=&theme=` | OG 分享卡落地页（含 OG/Twitter meta，`og:image` 指向 `/og-image`） | 否（公开数据） |
| `GET /og-image?user=&msg=&theme=` | 墓碑 OG 图（PNG 1200×630，satori + resvg 实时渲染） | 否 |
| `GET /badge?user=&metric=repos\|stars\|last` | README 动态徽章（SVG，可直接 `<img>` 嵌入） | 否 |
| `GET /heatmap?user=` + `Authorization: Bearer <token>` | GitHub 贡献热力图（GraphQL 代理，返回响应式 SVG） | **是**（用户浏览器本地提供） |

> Token 只存在于用户浏览器（localStorage），由 SPA 以 `Bearer` 头转发，**边缘端不存储**。

## 本地开发

```bash
cd cloudflare
npm install
npm run dev        # wrangler dev，默认 http://localhost:8787
```

## 部署

```bash
npm install
npx wrangler login          # 绑定你的 Cloudflare 账号
npm run deploy              # 部署到 <name>.workers.dev
# 可选：自定义域名（见 wrangler.toml 的 routes 注释）
```

部署后你会得到一个类似 `https://digitalgrave-edge.<sub>.workers.dev` 的地址。

## 接入 SPA

在仓库根目录的 `.env`（或构建环境变量）中设置：

```
VITE_CF_ENDPOINT=https://digitalgrave-edge.<sub>.workers.dev
```

SPA 读取 `VITE_CF_ENDPOINT` 后自动启用：

- `IpfsPanel` 的「分享」会优先生成 `/og?...` 富媒体链接（社交平台抓取后展示墓碑预览图）；
- 墓碑页出现「贡献年轮」模块（输入 GitHub Token 生成热力图）；
- 墓碑页出现「Badge」按钮，一键复制可嵌入 README 的徽章 `<img>` 片段。

不设置 `VITE_CF_ENDPOINT` 时，SPA 退回纯前端模式（深链分享 + 本地 PNG 导出），以上三项自动隐藏。

## 依赖

- `satori` — VDOM → SVG 布局
- `@resvg/resvg-wasm` — SVG → PNG（WASM，需 `compatibility_flags = ["nodejs_compat"]`）
- `wrangler` — 开发/部署
