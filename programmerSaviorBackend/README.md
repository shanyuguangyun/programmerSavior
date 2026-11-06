# Programmer Savior Backend

Programmer Savior 的后端应用，提供账号密码登录、Session 登录态、HTML 上传、按目录查询内容、独立阅读页数据和匿名 / 管理员评论。

配套学习资料：[Spring 基础知识](../spring-basics.html)。

## 技术栈

| 用途 | 选择 |
| --- | --- |
| 语言 | Java 8 |
| 框架 | Spring Boot 2.7.18 |
| 数据库 | MySQL 8 |
| 持久层 | MyBatis-Plus 3.5.7 |
| 数据库迁移 | Flyway |
| HTML 解析 | Jsoup 1.15.4 |
| 密码加密 | BCrypt（spring-security-crypto） |
| 构建 | Maven 3.9.9 |

Spring Boot 2.7 是最后一个支持 Java 8 的 2.x 版本，不能直接升级到 Spring Boot 3。

## 当前数据库

本机 `app_user` 只能访问 `mock_prod_db`，因此默认数据源指向：

```text
数据库：mock_prod_db
账号：app_user
密码：app_password_123
```

表名是 `ps_account`、`ps_post` 和 `ps_comment`，字符集 `utf8mb4`，排序规则 `utf8mb4_general_ci`。

上传的 HTML 内容保存在 `ps_post`，评论保存在 `ps_comment`，都在同一个数据库。

> 你提供的 `utf8mb4_gen_ci` 不是 MySQL 支持的排序规则；MySQL 里对应的是 `utf8mb4_general_ci`。

如果以后有独立的 `programmer_savior` 数据库，只需要设置环境变量：

```bash
DB_URL='jdbc:mysql://127.0.0.1:3306/programmer_savior?...'
DB_USERNAME=app_user
DB_PASSWORD=app_password_123
```

## 目录结构

```text
programmerSaviorBackend/
├─ .mvn/wrapper/       # Maven 3.9.9 Wrapper 配置
├─ src/main/java/com/programmersavior/backend/
│  ├─ common/          # 统一响应、Session 工具、常量
│  ├─ config/          # 密码编码器
│  ├─ controller/      # 登录、HTML 上传、评论接口
│  ├─ dto/             # 登录、上传、评论请求 / 响应
│  ├─ entity/          # ps_account、ps_post、ps_comment 实体
│  ├─ exception/       # 业务异常与全局异常处理
│  ├─ mapper/          # MyBatis-Plus Mapper
│  ├─ service/         # 登录、HTML 解析、评论与身份业务
│  └─ ProgrammerSaviorBackendApplication.java
├─ src/main/resources/
│  ├─ application.yml
│  └─ db/migration/
│     ├─ V1__create_ps_account.sql
│     ├─ V2__create_ps_post.sql
│     └─ V3__create_ps_comment.sql
├─ mvnw                # macOS / Linux
├─ mvnw.cmd            # Windows
└─ pom.xml
```

## 启动

确保 MySQL 已启动，并且 `app_user / app_password_123` 可以访问 `mock_prod_db`：

```bash
cd programmerSaviorBackend

# Windows
mvnw.cmd spring-boot:run

# macOS / Linux
./mvnw spring-boot:run
```

Maven Wrapper 已固定到 Maven 3.9.9，本机安装的 Maven 也可以直接使用：

```bash
mvn spring-boot:run
```

启动后接口地址：`http://localhost:8080`。

首次启动时 Flyway 会自动：

1. 在 `mock_prod_db` 中创建 `flyway_schema_history`；
2. 执行 `V1__create_ps_account.sql`，创建 `ps_account` 并写入账号 `fengwen`；
3. 执行 `V2__create_ps_post.sql`，创建 `ps_post` HTML 内容表；
4. 执行 `V3__create_ps_comment.sql`，创建 `ps_comment` 评论表。

数据库里保存的是 `fengwenpsd` 的 BCrypt 哈希，不保存明文密码。

## 登录接口

### 登录

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "fengwen",
  "password": "fengwenpsd"
}
```

成功响应：

```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "username": "fengwen"
  }
}
```

密码错误或账号不存在统一返回 HTTP 401：

```json
{
  "success": false,
  "message": "账号或密码错误",
  "data": null
}
```

### 当前账号

```http
GET /api/auth/me
```

已登录返回当前账号；未登录返回 HTTP 401。前端刷新页面后调用该接口恢复登录状态。

登录态保存在服务端 `HttpSession`，浏览器只保存 `JSESSIONID` Cookie，不在前端存储密码。

### 退出登录

```http
POST /api/auth/logout
```

销毁当前 Session；即使没有 Session 也返回成功，方便前端做幂等处理。

## HTML 上传接口

只有登录后才能上传。前端会把一级、二级、三级目录信息和 HTML 文件一起提交。

```http
POST /api/posts
Content-Type: multipart/form-data
Cookie: JSESSIONID=...

sectionId=works
sectionLabel=作品
menuId=works-projects
menuLabel=项目
childId=works-projects-active
childLabel=进行中
routePath=/works/projects/active
file=@page.html
```

成功响应会返回解析后的内容：

```json
{
  "success": true,
  "message": "上传成功",
  "data": {
    "id": 1,
    "title": "页面标题",
    "imageUrl": "/default-cover.svg",
    "routePath": "/works/projects/active",
    "htmlContent": "<!doctype html>...",
    "plainText": "从 body 提取的纯文本"
  }
}
```

解析和存储规则：

| 字段 | 规则 |
| --- | --- |
| `title` | `<title>` → 第一个 `<h1>` → 文件名 |
| `image_url` | 第一个绝对 `http(s)` 图片；否则 `/default-cover.svg` |
| `html_content` | 保存完整原始 HTML，供阅读页 iframe 展示 |
| `plain_text` | 保存 `body.text()`，用于估算阅读页高度和后续搜索 |
| 文件限制 | 只允许 `.html` / `.htm`，最大 2MB |

### 按目录查询

```http
GET /api/posts?path=/works/projects/active
```

按创建时间倒序返回该目录下的所有 HTML 内容，该接口是公开的。

### 单篇详情

```http
GET /api/posts/{id}
```

返回阅读页需要的标题、目录、封面、原始 HTML 和纯文本。前端打开 `/reader/{id}` 后调用。

## 评论接口

评论不需要登录，任何访客都可以发表；管理员登录后会自动使用真实账号名。

### 查询评论

```http
GET /api/posts/{postId}/comments
Cookie: JSESSIONID=...   # 可选，用于识别管理员
X-Forwarded-For: 203.0.113.10
```

返回扁平评论列表和当前访客身份：

```json
{
  "success": true,
  "data": {
    "viewerName": "用户e303b868c252",
    "viewerAdmin": false,
    "comments": [
      {
        "id": 1,
        "postId": 2,
        "parentId": null,
        "content": "这是一条评论。",
        "authorName": "用户e303b868c252",
        "admin": false,
        "createdAt": "2026-11-05T14:04:00"
      }
    ]
  }
}
```

前端根据 `parentId` 组装嵌套树，所以评论层级不受接口限制。

### 发表评论

```http
POST /api/posts/{postId}/comments
Content-Type: application/json
```

```json
{
  "content": "评论内容",
  "parentId": null
}
```

- `parentId` 为空：顶级评论
- `parentId` 为某条评论 id：回复该评论
- 内容会去掉首尾空白，限制 1000 个字符
- 父评论必须存在且属于同一篇文章

### 匿名昵称规则

1. 读取 `X-Forwarded-For` 的第一个 IP；没有该头时使用连接地址。
2. 对 IP 做 MD5，取前 12 位。
3. 昵称格式：`用户 + 12 位 MD5`，例如 `用户e303b868c252`。
4. 数据库只保存 32 位 `ip_hash`，不保存原始 IP；同一 IP 的昵称稳定。

### 管理员昵称

- 如果请求携带有效的 `JSESSIONID`，按账号表查出用户名。
- 管理员评论的 `authorName` 保存账号名，`admin` 为 `true`。
- 未登录用户仍使用匿名昵称。
- 评论没有单独的昵称输入框，避免昵称冲突。

## 和前端联调

前端开发服务器把 `/api` 代理到 `http://127.0.0.1:8080`：

```ts
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:8080',
      changeOrigin: true,
      xfwd: true,
    },
  },
},
```

前端点击右上角头像会打开登录框，只包含账号、密码和登录按钮。登录后账号旁显示上传图标，可打开 HTML 上传框；点击头像会打开账号菜单，可退出登录。

上传后的内容在作品 / 文章 / 随笔页显示为紧凑列表。点击某一项会以 `target="_blank"` 打开 `/reader/{id}`，这个页面单独加载文章详情和评论区，不使用主站侧栏。管理员在当前浏览器登录后，阅读页的评论身份会自动变成真实账号名。

完整的前端启动步骤见同级目录的 [前端 README](../programmerSavior/README.md)：

```bash
cd ../programmerSavior
pnpm install
pnpm dev
```

打开 `http://localhost:5173`，点击右上角头像，输入 `fengwen / fengwenpsd` 即可登录。

## 数据库手工检查

```sql
USE mock_prod_db;

SHOW CREATE TABLE ps_account;
SHOW CREATE TABLE ps_post;
SHOW CREATE TABLE ps_comment;
SELECT id, username, created_at FROM ps_account;
SELECT id, title, section_label, menu_label, child_label, route_path, created_at FROM ps_post;
SELECT id, post_id, parent_id, author_name, author_is_admin, created_at FROM ps_comment ORDER BY id;
```

## 安全说明

- 密码使用 BCrypt，不保存明文。
- 登录失败返回统一提示，避免暴露账号是否存在。
- 登录成功会销毁旧 Session 并创建新 Session，降低会话固定风险。
- Session Cookie 设置为 `HttpOnly` 和 `SameSite=Lax`。
- 上传接口从 Session 读取账号 id，未登录返回 401。
- 评论只保存纯文本，前端按文本渲染，不执行 HTML。
- 匿名评论只保存 IP 的 MD5，不保存原始 IP。
- 管理员评论通过 Session 识别，不信任前端传入的昵称或管理员标记。
- 文章 HTML 在前端 `sandbox=""` iframe 中展示，脚本不会执行。
- 当前没有实现注册、验证码、登录限流、评论审核 / 删除和评论频率限制。
- 生产环境应启用 HTTPS，并将 Session Cookie 改为 `Secure`。
