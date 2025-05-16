import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// 路由导入
import uploadRoutes from './routes/upload.js';
import fileRoutes from './routes/file.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';

// 初始化环境变量
dotenv.config();

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 初始化Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 }, // 限制文件大小为10MB
  abortOnLimit: true
}));

// 静态文件服务
app.use(express.static(path.join(__dirname, '../public')));

// API路由
app.use('/upload', uploadRoutes);
app.use('/file', fileRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// 根路径重定向到index.html
app.get('/', (req, res) => {
  res.redirect('/index.html');
});

// 连接MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB连接成功');
    // 启动服务器
    app.listen(PORT, () => {
      console.log(`服务器运行在 http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB连接失败:', err);
  });

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ error: '服务器内部错误' });
});
