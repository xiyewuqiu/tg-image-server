/**
 * 上传控制器
 * 处理图片上传相关的业务逻辑
 */

import { uploadImageToTelegram } from '../utils/telegram.js';
import File from '../models/File.js';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 处理图片上传请求
 */
export const uploadImage = async (req, res, next) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: '没有选择文件上传' });
    }

    const image = req.files.image;
    
    // 上传到Telegram
    const telegramResponse = await uploadImageToTelegram(image);
    
    if (!telegramResponse.success) {
      return res.status(500).json({ error: '上传到Telegram失败', details: telegramResponse.error });
    }
    
    // 创建数据库记录
    const fileRecord = new File({
      originalName: image.name,
      mimeType: image.mimetype,
      size: image.size,
      telegramFileId: telegramResponse.fileId,
      url: telegramResponse.url,
      user: req.user ? req.user.id : null, // 如果用户已登录，关联用户ID
      isPublic: true // 默认公开
    });
    
    await fileRecord.save();
    
    // 返回成功响应
    res.status(201).json({
      success: true,
      message: '图片上传成功',
      data: {
        id: fileRecord._id,
        url: telegramResponse.url,
        originalName: image.name,
        size: image.size,
        publicUrl: `${req.protocol}://${req.get('host')}/file/${fileRecord._id}`
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取最近上传的公开图片
 */
export const getRecentPublicImages = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    
    // 查询公开图片
    const files = await File.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('_id originalName size url createdAt');
    
    // 获取总数
    const total = await File.countDocuments({ isPublic: true });
    
    // 返回结果
    res.json({
      success: true,
      data: {
        files,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
}; 