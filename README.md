# 🖼️ TG-Image 图床 - 服务器版本 ✨

<div align="center">
  <h2>现代化、高颜值的 Telegram 图片托管服务 - 服务器部署版</h2>
</div>

<p align="center">
  <strong>TG-Image 服务器版</strong>是一个基于 Telegram 的现代化图片托管服务，提供简单、可靠的图片上传和存储解决方案。该项目利用 Telegram 的强大存储能力，为用户提供<strong>免费、无限制</strong>的图床服务，并拥有精美的用户界面和流畅的交互体验。
</p>

<p align="center">
  特别支持<strong>原图上传</strong>和<strong>原图下载</strong>功能，确保您的图片在分享过程中保持原始质量，不会被压缩或降低画质。
</p>

## 📋 功能特性

- 🚀 **服务器部署**：可以部署在自己的服务器上，完全控制
- 🔄 **匿名上传**：无需注册即可上传图片
- 👤 **用户系统**：支持用户注册、登录，管理个人图片
- 🔍 **图片管理**：支持图片搜索、分类、标签等功能
- 🖼️ **原图保存**：保持图片原始质量，不压缩
- 🌐 **全球加速**：利用Telegram的全球网络
- 🎨 **美观界面**：现代化设计，支持暗色模式
- 📱 **响应式设计**：完美适配各种设备尺寸

## 🛠️ 技术栈

- **后端**：Node.js + Express
- **数据库**：MongoDB
- **存储**：Telegram Bot API
- **认证**：JWT (JSON Web Tokens)
- **前端**：HTML5 + CSS3 + JavaScript

## ⚙️ 安装步骤

### 前提条件

- Node.js 14.x 或更高版本
- MongoDB 数据库
- Telegram Bot Token (通过 [@BotFather](https://t.me/BotFather) 创建)
- Telegram Chat ID (可以是群组或频道)

### 安装过程

1. **克隆仓库**

```bash
git clone https://github.com/xiyewuqiu/tg-image-server.git
cd tg-image-server
```

2. **安装依赖**

```bash
npm install
```

3. **配置环境变量**

复制 `.env.example` 文件为 `.env`，并填写必要的配置信息：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入以下信息：

```
# 服务器配置
PORT=3000
MONGODB_URI=mongodb://localhost:27017/tg-image

# Telegram配置
TG_BOT_TOKEN=your_telegram_bot_token
TG_CHAT_ID=your_telegram_chat_id

# JWT配置
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRES_IN=7d
```

4. **运行设置脚本**

```bash
npm run setup
```

5. **启动服务器**

```bash
npm start
```

开发模式（自动重启）：

```bash
npm run dev
```

6. **访问应用**

打开浏览器，访问 `http://localhost:3000`

## 📖 使用方法

### 匿名上传

1. 访问首页
2. 点击上传区域或拖拽图片到上传区域
3. 等待上传完成，获取图片链接

### 注册账户

1. 点击"登录"按钮
2. 选择"注册"选项
3. 填写用户名、邮箱和密码
4. 提交注册表单

### 管理图片

1. 登录账户
2. 访问"我的图片"页面
3. 查看、搜索、删除或编辑图片信息

## 🔧 API 接口

### 上传图片

```
POST /upload
```

### 获取图片

```
GET /file/:id
```

### 用户认证

```
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
```

### 用户图片管理

```
GET /api/user/images
DELETE /api/user/images/:id
PUT /api/user/images/:id
GET /api/user/images/search
```

## 🤝 贡献

欢迎提交 Pull Request 或创建 Issue！

## 📄 许可证

本项目采用 [AGPL-3.0-with-Commons-Clause](LICENSE) 许可证。

## 🙏 致谢

- [Telegram](https://telegram.org/) - 提供强大的API和存储能力
- [Express](https://expressjs.com/) - 提供Web框架支持
- [MongoDB](https://www.mongodb.com/) - 提供数据库支持
