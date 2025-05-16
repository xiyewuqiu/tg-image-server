import express from 'express';
import { authMiddleware } from '../utils/auth.js';
import { sendToTelegram, getFileId } from '../utils/telegram.js';
import File from '../models/File.js';

const router = express.Router();

// 处理文件上传
router.post('/', async (req, res) => {
  try {
    // 检查是否有认证头
    const user = req.user;
    const userId = user ? user.id : null;
    
    // 检查是否有文件上传
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: '未上传文件' });
    }
    
    // 获取上传的文件
    const uploadedFiles = Array.isArray(req.files.file) ? req.files.file : [req.files.file];
    
    // 处理所有文件上传
    const uploadResults = [];
    for (const uploadFile of uploadedFiles) {
      if (!uploadFile) continue;
      
      const fileName = uploadFile.name;
      const fileExtension = fileName.split('.').pop().toLowerCase();
      
      // 发送到Telegram
      const result = await sendToTelegram(uploadFile, fileName);
      
      if (!result.success) {
        console.error(`文件 ${fileName} 上传失败:`, result.error);
        continue;
      }
      
      const fileId = getFileId(result.data);
      
      if (!fileId) {
        console.error(`文件 ${fileName} 获取文件ID失败`);
        continue;
      }
      
      // 创建文件记录
      const fileKey = `${fileId}.${fileExtension}`;
      const timestamp = Date.now();
      
      // 保存文件信息到数据库
      const fileRecord = new File({
        fileId: fileKey,
        fileName: fileName,
        fileSize: uploadFile.size,
        fileExtension: fileExtension,
        userId: userId,
        isAnonymous: !userId,
        uploadTime: timestamp
      });
      
      await fileRecord.save();
      
      // 添加到上传结果
      uploadResults.push({ 'src': `/file/${fileKey}` });
    }
    
    console.log(`成功上传${uploadResults.length}个文件`);
    return res.json(uploadResults);
  } catch (error) {
    console.error('上传错误:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 认证后的上传路由
router.post('/auth', authMiddleware, async (req, res) => {
  // 这个路由会先经过authMiddleware验证，然后再处理上传
  // 实际处理逻辑与上面相同，但确保用户已登录
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: '未上传文件' });
    }
    
    // 获取上传的文件
    const uploadedFiles = Array.isArray(req.files.file) ? req.files.file : [req.files.file];
    
    // 处理所有文件上传
    const uploadResults = [];
    for (const uploadFile of uploadedFiles) {
      if (!uploadFile) continue;
      
      const fileName = uploadFile.name;
      const fileExtension = fileName.split('.').pop().toLowerCase();
      
      // 发送到Telegram
      const result = await sendToTelegram(uploadFile, fileName);
      
      if (!result.success) {
        console.error(`文件 ${fileName} 上传失败:`, result.error);
        continue;
      }
      
      const fileId = getFileId(result.data);
      
      if (!fileId) {
        console.error(`文件 ${fileName} 获取文件ID失败`);
        continue;
      }
      
      // 创建文件记录
      const fileKey = `${fileId}.${fileExtension}`;
      const timestamp = Date.now();
      
      // 保存文件信息到数据库
      const fileRecord = new File({
        fileId: fileKey,
        fileName: fileName,
        fileSize: uploadFile.size,
        fileExtension: fileExtension,
        userId: req.user.id,
        isAnonymous: false,
        uploadTime: timestamp
      });
      
      await fileRecord.save();
      
      // 添加到上传结果
      uploadResults.push({ 'src': `/file/${fileKey}` });
    }
    
    console.log(`成功上传${uploadResults.length}个文件`);
    return res.json(uploadResults);
  } catch (error) {
    console.error('上传错误:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
