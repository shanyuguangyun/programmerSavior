# Programmer Savior 管理后台小程序 · 产品规划

> 目标：让站长在手机上用 30 秒完成三件事——发现新评论、判断今天有没有人看、决定要不要回复。
>
> 这里的「小程序」先按**手机端管理后台（PWA）**规划。如果特指微信小程序，登录、实时通道和通知方式的差异见 3.3。

## 1. 结论先行

- **先做移动端 Web 管理后台，不先做微信小程序。** 后端登录、评论和文章接口都可以直接复用，实时评论用 SSE 即可，开发量最小。
- **实时只做评论，浏览量用轮询。** 评论需要及时提醒；统计晚 30 秒刷新完全可以接受，没必要为它维护长连接。
- **MVP 只有四个页面：概览、评论、文章、我的。**
- **浏览量先定义清楚，再写代码。** 建议同时看「有效 PV」和「UV」，30 分钟去重，管理员自己的访问不计入。
- **预计 2–3 周完成第一版**，其中后端埋点和统计约 1 周，管理端页面和实时评论约 1 周，联调和体验约 3–5 天。

## 2. 产品定位

### 2.1 一句话

一个装在手机浏览器里的轻量站长控制台：新评论出现时能立刻看到，打开就能知道最近有没有人访问，点一下就能回到文章。

### 2.2 目标用户

- 主要用户：站长本人（当前只有 `fengwen` 一个管理员账号）。
- 使用场景：
  - 通勤、吃饭、睡前刷一眼站点状态。
  - 收到通知后快速判断评论是否需要处理。
  - 偶尔查看某篇文章最近 7 天或 30 天的浏览趋势。
- 不服务的场景：
  - 多人协作编辑。
  - 复杂内容审核工作流。
  - 完整的数据分析平台。

### 2.3 成功标准

- 新评论从提交到管理端出现，同网络下 **≤ 2 秒**。
- 从打开管理端到看见「未读评论 / 今日浏览」 **≤ 3 秒**。
- 手机宽度 375px 时无横向滚动，单手可以完成「看评论 → 打开文章 → 标记已读」。
- 管理端所有接口在未登录时返回 401，不暴露评论者 IP。

## 3. 形态选择

### 3.1 推荐：同仓库的移动端 PWA

- 在现有 React 项目里增加 `/admin` 路由，独立移动端布局，不带主站侧栏。
- 复用现有的 `HttpSession` 登录，不引入第二套账号体系。
- 支持添加到主屏幕，体验接近小程序。
- 实时评论使用 `EventSource`，不需要额外网关。
- 后续如果确实需要微信生态，再把页面壳换成小程序，接口基本不变。

### 3.2 不建议第一版直接做微信小程序

- 需要单独的小程序工程、构建和发布流程。
- 需要配置 HTTPS 合法域名，并且 `EventSource` 不可用，实时评论要改成 `wx.connectSocket`。
- 微信登录和现有账号体系需要额外绑定。
- 仅仅为了「在手机上看评论」，投入产出比不高。

### 3.3 如果“小程序”是硬性要求

保留现有后端 API，小程序端只做展示壳：

- 登录：微信登录换取 openid，再绑定管理员账号，或者使用一次性管理码登录。
- 实时：`wx.connectSocket` 连接 WebSocket；后端同时提供 SSE 和 WebSocket 两个适配层。
- 通知：微信订阅消息，适合「有新评论」提醒；不能保证每条都即时。
- 优先做「评论提醒 + 概览」，统计图表可以晚一版。

| 维度 | PWA 管理端 | 微信小程序 |
| --- | --- | --- |
| 开发成本 | 低，复用现有前端 | 中高，需要独立工程 |
| 登录 | 复用 Session | 微信登录 + 账号绑定 |
| 实时评论 | SSE | WebSocket |
| 手机通知 | Web Push（受系统限制） | 订阅消息 |
| 发布 | 部署即生效 | 审核发布 |
| 适合阶段 | MVP 首选 | 有微信流量或强通知需求时 |

## 4. MVP 范围

### 4.1 概览

首屏只放三个核心数字：

- **未读评论**：`ps_comment.admin_read_at IS NULL` 的数量。
- **今日有效浏览**：当天去重后的 PV。
- **今日访客**：当天不同 `visitor_hash` 的数量。

下面补充：

- 最近 7 天浏览趋势（折线或柱状）。
- 最近 5 条评论（作者、文章、时间、内容摘要）。
- 最近 7 天浏览最多的 5 篇文章。
- 右上角连接状态：实时 / 重连中。

### 4.2 评论

- 默认进入「未读」列表，也可以切换到「全部」。
- 支持按文章筛选。
- 每条显示：匿名昵称或管理员名、文章标题、时间、内容、未读标记。
- 操作：
  - 点击进入文章阅读页。
  - 标记已读。
  - 一键全部已读。
  - 回复（P1，可先跳转到文章评论区回复）。
- 新评论通过 SSE 插入列表顶部，并更新未读徽标。

### 4.3 文章

- 文章列表：标题、目录、最近 7 天 PV/UV、更新时间。
- 点击进入单篇统计：
  - 今日、7 天、30 天 PV/UV。
  - 按小时或按天的趋势。
  - 最近访问来源（P1）。
- 提供「打开文章」按钮，跳转现有 `/reader/{id}`。

### 4.4 我的

- 当前管理员账号。
- 实时通知开关（浏览器通知）。
- 退出登录。
- 版本号和接口连接状态。

### 4.5 明确不做

- 文章上传和编辑（继续用主站）。
- 评论删除、封禁、敏感词后台（先人工处理）。
- 多管理员和权限角色。
- 复杂漏斗、来源归因、实时在线人数。
- 微信小程序（除非确认是硬需求）。

## 5. 信息架构

底部四个 Tab，移动端单手可达：

```text
概览
├─ 三个核心数字
├─ 7 日趋势
├─ 最近评论
└─ 热门文章

评论
├─ 未读 / 全部
├─ 按文章筛选
├─ 评论详情
└─ 标记已读 / 全部已读

文章
├─ 文章列表
└─ 单篇浏览统计

我的
├─ 通知设置
├─ 账号信息
└─ 退出登录
```

关键交互原则：

- 首屏不放大表格，不做横向滚动的仪表盘。
- 数字用大字号，趋势用小图，详情再点进去。
- 任何「未读」状态都要能在一个动作内清除。
- 断网时保留上次数据，顶部显示「离线 / 重连中」，不要弹阻塞弹窗。

## 6. 实时评论设计

### 6.1 技术选择

用 **SSE（Server-Sent Events）**，不用 WebSocket：

- 新评论是典型的服务端单向推送。
- 浏览器原生 `EventSource` 自带断线重连。
- 不需要额外协议升级和心跳框架。
- Spring Boot 2.7 自带 `SseEmitter`，Java 8 可用。

### 6.2 事件流

```text
POST /api/posts/{id}/comments
        │
        ├─ 保存 ps_comment
        ├─ 发布 CommentCreatedEvent
        └─ 返回评论

CommentCreatedEvent
        │
        └─ AdminEventService
              ├─ 推送给所有在线管理员 SSE
              └─ 事件内容：commentId / postId / postTitle / authorName / preview / createdAt
```

### 6.3 管理端

- 建立 `GET /api/admin/events` 的 `EventSource`。
- 收到 `comment.created`：
  - 未读数 +1。
  - 若当前在评论页，插入列表顶部。
  - 若不在评论页，显示小红点和轻提示。
- 每 25 秒由服务端发送一次心跳，防止代理断开。
- 断线重连后先拉一次 `GET /api/admin/comments?unread=true`，再继续接收 SSE，避免漏消息。
- 页面进入后台时暂停浏览器通知，回到前台后重新同步未读数。

### 6.4 服务端注意

- `SseEmitter` 设置超时时间，并在完成、超时、异常时移除。
- 单实例先用内存注册表；多实例再换 Redis Pub/Sub。
- 网关和 Nginx 关闭响应缓冲，避免事件被攒着发。
- SSE 接口必须校验管理员 Session，不能公开。

## 7. 浏览量统计设计

### 7.1 指标定义

| 指标 | 定义 | 用途 |
| --- | --- | --- |
| 有效 PV | 30 分钟内同一访客对同一文章只计 1 次 | 看内容热度 |
| UV | 同一天内不同 `visitor_hash` 的数量 | 看真实到访人数 |
| 今日浏览量 | 当天有效 PV | 首屏核心数字 |
| 7 日浏览 | 最近 7 个自然日的有效 PV | 趋势图 |
| 热门文章 | 按 7 日有效 PV 排序 | 内容判断 |

### 7.2 采集方式

阅读页 `/reader/{id}` 加载时调用：

```http
POST /api/posts/{id}/view
Content-Type: application/json

{ "referrer": "https://..." }
```

前端细节：

- `sessionStorage` 记录 `viewed:{postId}`，同一标签页会话只发一次。
- 使用 `fetch(..., { keepalive: true })`，不阻塞文章渲染。
- 失败静默处理，不影响阅读。
- 管理员登录时携带 `is_admin=1`，后端默认不计入公开统计。

后端细节：

- 读取 `X-Forwarded-For` 第一个 IP，结合 User-Agent 和每日盐生成 `visitor_hash`。
- 不保存原始 IP。
- 过滤明显爬虫 UA。
- 以 30 分钟为时间桶，`INSERT IGNORE` 去重。
- 写入失败不影响文章页面。

### 7.3 数据表

```sql
-- 浏览事件（保留 90 天）
CREATE TABLE ps_post_view (
  id BIGINT NOT NULL AUTO_INCREMENT,
  post_id BIGINT NOT NULL,
  visitor_hash CHAR(32) NOT NULL,
  view_bucket BIGINT NOT NULL,       -- 30 分钟时间桶
  is_admin TINYINT(1) NOT NULL DEFAULT 0,
  referrer VARCHAR(512) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_view_dedupe (post_id, visitor_hash, view_bucket),
  KEY idx_view_post_created (post_id, created_at),
  CONSTRAINT fk_view_post FOREIGN KEY (post_id) REFERENCES ps_post(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

```sql
-- 评论已读状态
ALTER TABLE ps_comment
  ADD COLUMN admin_read_at DATETIME NULL AFTER created_at,
  ADD KEY idx_comment_unread (admin_read_at, created_at);
```

P1 再加日聚合表，避免长期扫描原始事件：

```sql
CREATE TABLE ps_post_stats_daily (
  post_id BIGINT NOT NULL,
  stat_date DATE NOT NULL,
  pv INT NOT NULL DEFAULT 0,
  uv INT NOT NULL DEFAULT 0,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (post_id, stat_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

### 7.4 查询策略

- 今日数据：直接查 `ps_post_view`，按 `post_id` 和 `created_at` 过滤。
- 7 天趋势：按天 `GROUP BY DATE(created_at)`。
- 热门文章：按 `post_id` 聚合后 join `ps_post`。
- 数据量变大后：每天凌晨把前一天数据写入 `ps_post_stats_daily`，管理端优先读聚合表。
- 原始事件保留 90 天，聚合数据长期保留。

## 8. 后端接口

```text
# 公开埋点
POST   /api/posts/{id}/view

# 管理员
GET    /api/admin/overview?range=7d
GET    /api/admin/comments?status=unread&postId=&limit=20
POST   /api/admin/comments/{id}/read
POST   /api/admin/comments/read-all
GET    /api/admin/events                  # SSE
GET    /api/admin/posts?range=7d
GET    /api/admin/posts/{id}/stats?range=30d
```

返回结构继续使用现有的 `ApiResponse<T>`。

`GET /api/admin/overview` 示例：

```json
{
  "success": true,
  "data": {
    "unreadComments": 8,
    "todayPv": 126,
    "todayUv": 73,
    "sevenDayPv": 842,
    "trend": [
      { "date": "2026-11-01", "pv": 108, "uv": 66 }
    ],
    "latestComments": [],
    "topPosts": []
  }
}
```

## 9. 安全与隐私

- 管理端接口统一校验管理员 Session；当前单账号也保留 `role` 字段，避免以后加账号时重写。
- SSE 同样需要鉴权，不能只靠前端隐藏入口。
- `visitor_hash` 使用服务端盐 + 日期，不保存原始 IP。
- 管理端不展示评论者 IP，只展示匿名昵称或管理员名。
- 浏览量接口做基础限流，例如同一 IP 每分钟最多 30 次。
- 评论和浏览统计都只保存必要字段，不接入第三方统计脚本。
- 生产环境使用 HTTPS，Session Cookie 加 `Secure`。

## 10. 迭代计划

### 第 1 周：数据基础

- 新增 `ps_post_view` 和评论 `admin_read_at`。
- 增加阅读页浏览上报和去重。
- 实现概览、文章列表、单篇统计查询。
- 用 SQL 和 Postman 验证 PV/UV 计算。

### 第 2 周：管理端页面

- 新增 `/admin` 移动端布局和路由守卫。
- 概览、评论、文章、我的四个页面。
- 评论已读和未读徽标。
- SSE 实时评论和断线重连。
- 复用现有登录弹窗或做轻量登录页。

### 第 3 周：体验与上线

- 375px / 390px 手机适配检查。
- PWA manifest、添加到主屏幕、离线提示。
- 浏览器通知（可选）。
- 错误态、空状态、加载骨架。
- 接口鉴权、限流和基本压测。

## 11. 验收清单

- [ ] 新评论提交后 2 秒内出现在管理端，未读数同步 +1。
- [ ] SSE 断开后 5 秒内自动重连，重连后不丢未读评论。
- [ ] 同一访客 30 分钟内刷新同一文章，有效 PV 不重复增加。
- [ ] 管理员访问文章不计入公开浏览量。
- [ ] 手机 375px 宽度无横向滚动，底部 Tab 不遮挡内容。
- [ ] 未登录访问任意 `/api/admin/*` 返回 401。
- [ ] 概览数据 30 秒内可刷新，加载失败有重试入口。
- [ ] 一条评论的直接回复超过 5 条仍能在文章页正确折叠。

## 12. 主要风险

| 风险 | 影响 | 应对 |
| --- | --- | --- |
| SSE 被代理缓冲 | 评论不实时 | 关闭 Nginx 缓冲，加心跳 |
| 手机后台挂起 | 收不到提醒 | 回前台重新拉取未读 |
| 浏览事件写入量 | 拖慢文章页 | 异步写入、去重、日聚合 |
| 爬虫刷 PV | 数据失真 | UA 过滤、限流、30 分钟去重 |
| 单管理员账号 | 无法审计 | 先保留 role，后续扩展 |
| 微信小程序审核 | 上线周期不可控 | PWA 先上线，小程序后置 |

## 13. 需要确认的产品决策

1. 「小程序」是否必须是微信小程序？如果只是手机端管理后台，建议直接做 PWA。
2. 新评论是否需要手机系统通知？如果必须强提醒，再考虑 Web Push 或微信订阅消息。
3. 浏览量是否需要区分来源（搜索、直接访问、外链）？MVP 可以先不展示。
4. 评论是否需要管理员直接回复？如果需要，管理端要加回复编辑器和评论定位。
5. 原始浏览事件保留 90 天是否可以接受？超过后只保留日聚合。

---

**建议下一步**：先确认第 13 节的两个关键问题（是否微信小程序、是否需要系统通知），然后按第 1 周的「浏览埋点 + 概览接口」开始实现。
