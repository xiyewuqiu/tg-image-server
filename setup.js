import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import readline from 'readline';

// 初始化环境变量
dotenv.config();

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建readline接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 检查.env文件是否存在
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

async function setup() {
  console.log('🚀 开始设置TG-Image服务器版本...');
  
  // 检查.env文件
  if (!fs.existsSync(envPath)) {
    console.log('📝 创建.env配置文件...');
    
    // 复制.env.example到.env
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env文件已创建，请编辑该文件填入您的配置信息');
    
    // 提示用户填写配置
    console.log('\n请在.env文件中填写以下配置:');
    console.log('1. MongoDB连接URI (MONGODB_URI)');
    console.log('2. Telegram Bot Token (TG_BOT_TOKEN)');
    console.log('3. Telegram Chat ID (TG_CHAT_ID)');
    console.log('4. JWT密钥 (JWT_SECRET)');
  }
  
  // 检查public目录
  const publicDir = path.join(__dirname, 'public');
  if (!fs.existsSync(publicDir)) {
    console.log('📁 创建public目录...');
    fs.mkdirSync(publicDir);
    console.log('✅ public目录已创建');
  }
  
  // 检查images目录
  const imagesDir = path.join(publicDir, 'images');
  if (!fs.existsSync(imagesDir)) {
    console.log('📁 创建images目录...');
    fs.mkdirSync(imagesDir);
    console.log('✅ images目录已创建');
  }
  
  // 创建blocked.png文件（如果不存在）
  const blockedImagePath = path.join(imagesDir, 'blocked.png');
  if (!fs.existsSync(blockedImagePath)) {
    console.log('🖼️ 创建默认的blocked.png图片...');
    // 这里可以添加创建一个简单的blocked.png图片的代码
    // 或者提示用户手动添加
    console.log('⚠️ 请手动添加blocked.png图片到public/images目录');
  }
  
  // 尝试连接MongoDB
  try {
    if (process.env.MONGODB_URI) {
      console.log('🔌 尝试连接MongoDB...');
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ MongoDB连接成功');
      
      // 关闭MongoDB连接
      await mongoose.disconnect();
      console.log('🔌 MongoDB连接已关闭');
    } else {
      console.log('⚠️ 未找到MongoDB连接URI，请在.env文件中设置MONGODB_URI');
    }
  } catch (error) {
    console.error('❌ MongoDB连接失败:', error.message);
    console.log('⚠️ 请确保MongoDB服务已启动，并且连接URI正确');
  }
  
  console.log('\n🎉 设置完成!');
  console.log('📝 请确保您已经正确配置了.env文件');
  console.log('🚀 启动服务器: npm start');
  console.log('🧪 开发模式: npm run dev');
  
  rl.close();
}

// 运行设置
setup().catch(error => {
  console.error('设置过程中出错:', error);
  rl.close();
});
