# 🖼️ TG-Image 图床 - 服务器版本 ✨

<div align="center">
  <h2>现代化、高颜值的 Telegram 图片托管服务 - 服务器部署版</h2>
  
  <p>
    <img src="https://img.shields.io/badge/Node.js-14.x+-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js 版本">
    <img src="https://img.shields.io/badge/MongoDB-支持-47A248?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB">
    <img src="https://img.shields.io/badge/Telegram-API-26A5E4?style=flat-square&logo=telegram&logoColor=white" alt="Telegram">
    <img src="https://img.shields.io/badge/许可证-AGPL--3.0-blue?style=flat-square" alt="许可证">
  </p>
</div>

<p align="center">
  <strong>TG-Image 服务器版</strong>是一个基于 Telegram 的现代化图片托管服务，提供简单、可靠的图片上传和存储解决方案。该项目利用 Telegram 的强大存储能力，为用户提供<strong>免费、无限制</strong>的图床服务，并拥有精美的用户界面和流畅的交互体验。
</p>

<p align="center">
  特别支持<strong>原图上传</strong>和<strong>原图下载</strong>功能，确保您的图片在分享过程中保持原始质量，不会被压缩或降低画质。
</p>

<div align="center">
  <kbd>
    <img src="https://via.placeholder.com/800x450.png?text=TG-Image+预览图" alt="TG-Image 预览图" width="800">
  </kbd>
</div>

## ✨ 亮点特色

- 💯 **完全免费** - 利用 Telegram 存储，无需支付任何费用
- 🔒 **安全可靠** - 数据存储在 Telegram 服务器，安全且稳定
- 🚫 **无限容量** - 没有存储上限，轻松应对大量图片需求
- 🖥️ **自托管** - 完全控制自己的数据和服务

## 📋 功能特性

<table>
  <tr>
    <td>
      <h3>🚀 基础功能</h3>
      <ul>
        <li>✅ 服务器部署：完全控制</li>
        <li>✅ 匿名上传：无需注册</li>
        <li>✅ 用户系统：注册与登录</li>
        <li>✅ 原图保存：无压缩</li>
      </ul>
    </td>
    <td>
      <h3>🔍 高级功能</h3>
      <ul>
        <li>✅ 图片管理：搜索与分类</li>
        <li>✅ 全球加速：Telegram网络</li>
        <li>✅ 美观界面：暗色模式</li>
        <li>✅ 响应式设计：多设备适配</li>
      </ul>
    </td>
  </tr>
</table>

## 🛠️ 技术栈

<table>
  <tr>
    <th>类别</th>
    <th>技术</th>
  </tr>
  <tr>
    <td>后端框架</td>
    <td>Node.js + Express</td>
  </tr>
  <tr>
    <td>数据存储</td>
    <td>MongoDB</td>
  </tr>
  <tr>
    <td>图片存储</td>
    <td>Telegram Bot API</td>
  </tr>
  <tr>
    <td>用户认证</td>
    <td>JWT (JSON Web Tokens)</td>
  </tr>
  <tr>
    <td>前端技术</td>
    <td>HTML5 + CSS3 + JavaScript</td>
  </tr>
</table>

## ⚙️ 安装指南

### 前提条件

- Node.js 14.x 或更高版本
- MongoDB 数据库
- Telegram Bot Token (通过 [@BotFather](https://t.me/BotFather) 创建)
- Telegram Chat ID (可以是群组或频道)

### 快速安装

> 💡 按照以下步骤，轻松部署您自己的图床服务

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

```ini
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

## 📖 使用指南

### 匿名上传

<table>
  <tr>
    <td width="80">步骤 1</td>
    <td>访问首页</td>
  </tr>
  <tr>
    <td>步骤 2</td>
    <td>点击上传区域或拖拽图片到上传区域</td>
  </tr>
  <tr>
    <td>步骤 3</td>
    <td>等待上传完成，获取图片链接</td>
  </tr>
</table>

### 注册账户

<table>
  <tr>
    <td width="80">步骤 1</td>
    <td>点击"登录"按钮</td>
  </tr>
  <tr>
    <td>步骤 2</td>
    <td>选择"注册"选项</td>
  </tr>
  <tr>
    <td>步骤 3</td>
    <td>填写用户名、邮箱和密码</td>
  </tr>
  <tr>
    <td>步骤 4</td>
    <td>提交注册表单</td>
  </tr>
</table>

### 管理图片

<table>
  <tr>
    <td width="80">步骤 1</td>
    <td>登录账户</td>
  </tr>
  <tr>
    <td>步骤 2</td>
    <td>访问"我的图片"页面</td>
  </tr>
  <tr>
    <td>步骤 3</td>
    <td>查看、搜索、删除或编辑图片信息</td>
  </tr>
</table>

## 🔧 API 接口文档

> 以下是主要API接口，用于集成和开发

### 图片操作

| 方法 | 路径 | 描述 |
|------|------|------|
| `POST` | `/upload` | 上传新图片 |
| `GET` | `/file/:id` | 获取指定图片 |

### 用户认证

| 方法 | 路径 | 描述 |
|------|------|------|
| `POST` | `/api/auth/register` | 注册新用户 |
| `POST` | `/api/auth/login` | 用户登录 |
| `GET` | `/api/auth/me` | 获取当前用户信息 |

### 用户图片管理

| 方法 | 路径 | 描述 |
|------|------|------|
| `GET` | `/api/user/images` | 获取用户全部图片 |
| `DELETE` | `/api/user/images/:id` | 删除指定图片 |
| `PUT` | `/api/user/images/:id` | 更新图片信息 |
| `GET` | `/api/user/images/search` | 搜索用户图片 |

## 🤝 贡献指南

欢迎为 TG-Image 图床贡献代码或提出建议！

1. Fork 本项目
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建一个 Pull Request

## 📄 许可证

本项目采用 [AGPL-3.0-with-Commons-Clause](LICENSE) 许可证。

## 🙏 致谢

<p align="center">
  <a href="https://telegram.org/">
    <img src="https://img.shields.io/badge/Telegram-26A5E4?style=for-the-badge&logo=telegram&logoColor=white" alt="Telegram" height="30">
  </a>
  <a href="https://expressjs.com/">
    <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" height="30">
  </a>
  <a href="https://www.mongodb.com/">
    <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" height="30">
  </a>
</p>

<div align="center">
  <sub>Made with ❤️ for the developer community</sub>
</div>
