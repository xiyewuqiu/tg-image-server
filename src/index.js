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

// 中间件导入
import { errorHandler, notFoundHandler, setupUncaughtErrorHandlers } from './middlewares/errorHandler.js';

// 初始化环境变量
dotenv.config();

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 设置未捕获的错误处理器
setupUncaughtErrorHandlers();

// 初始化Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 基本中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  limits: { 
    fileSize: process.env.MAX_FILE_SIZE ? parseInt(process.env.MAX_FILE_SIZE) : 10 * 1024 * 1024 // 默认10MB
  },
  abortOnLimit: true,
  useTempFiles: true,
  tempFileDir: path.join(__dirname, '../temp/')
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

// 404处理
app.use(notFoundHandler);

// 全局错误处理
app.use(errorHandler);

// 连接MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB连接成功');
    // 启动服务器
    app.listen(PORT, () => {
      console.log(`服务器运行在 http://localhost:${PORT}`);
      console.log(`API文档: http://localhost:${PORT}/api-docs`);
    });
  })
  .catch(err => {
    console.error('MongoDB连接失败:', err);
    process.exit(1);
  });
