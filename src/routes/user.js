import express from 'express';
import { authMiddleware } from '../utils/auth.js';
import File from '../models/File.js';

const router = express.Router();

// 获取用户图片列表
router.get('/images', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, search } = req.query;
    
    // 构建查询条件
    const query = { userId: userId };
    
    // 如果有搜索关键词，添加到查询条件
    if (search) {
      query.$or = [
        { fileName: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    
    // 计算分页
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // 查询用户图片
    const files = await File.find(query)
      .sort({ uploadTime: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // 获取总数
    const total = await File.countDocuments(query);
    
    // 格式化响应
    const formattedFiles = files.map(file => ({
      id: file.fileId,
      fileName: file.fileName,
      fileSize: file.fileSize,
      uploadTime: file.uploadTime,
      url: `/file/${file.fileId}`,
      tags: file.tags || [],
      liked: file.liked
    }));
    
    return res.json({
      files: formattedFiles,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('获取用户图片错误:', error);
    return res.status(500).json({ error: '获取用户图片失败' });
  }
});

// 删除用户图片
router.delete('/images/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const fileId = req.params.id;
    
    // 查找文件
    const file = await File.findOne({ fileId, userId });
    
    if (!file) {
      return res.status(404).json({ error: '文件不存在或无权限删除' });
    }
    
    // 删除文件记录
    await File.deleteOne({ _id: file._id });
    
    return res.json({ message: '文件删除成功' });
  } catch (error) {
    console.error('删除用户图片错误:', error);
    return res.status(500).json({ error: '删除用户图片失败' });
  }
});

// 更新图片信息
router.put('/images/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const fileId = req.params.id;
    const { fileName, tags } = req.body;
    
    // 查找文件
    const file = await File.findOne({ fileId, userId });
    
    if (!file) {
      return res.status(404).json({ error: '文件不存在或无权限修改' });
    }
    
    // 更新文件信息
    if (fileName) file.fileName = fileName;
    if (tags) file.tags = tags;
    file.updatedAt = Date.now();
    
    await file.save();
    
    return res.json({
      message: '文件信息更新成功',
      file: {
        id: file.fileId,
        fileName: file.fileName,
        fileSize: file.fileSize,
        uploadTime: file.uploadTime,
        updatedAt: file.updatedAt,
        url: `/file/${file.fileId}`,
        tags: file.tags || [],
        liked: file.liked
      }
    });
  } catch (error) {
    console.error('更新图片信息错误:', error);
    return res.status(500).json({ error: '更新图片信息失败' });
  }
});

// 搜索用户图片
router.get('/images/search', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { keyword, page = 1, limit = 20 } = req.query;
    
    if (!keyword) {
      return res.status(400).json({ error: '搜索关键词不能为空' });
    }
    
    // 构建查询条件
    const query = {
      userId: userId,
      $or: [
        { fileName: { $regex: keyword, $options: 'i' } },
        { tags: { $regex: keyword, $options: 'i' } }
      ]
    };
    
    // 计算分页
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // 查询用户图片
    const files = await File.find(query)
      .sort({ uploadTime: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // 获取总数
    const total = await File.countDocuments(query);
    
    // 格式化响应
    const formattedFiles = files.map(file => ({
      id: file.fileId,
      fileName: file.fileName,
      fileSize: file.fileSize,
      uploadTime: file.uploadTime,
      url: `/file/${file.fileId}`,
      tags: file.tags || [],
      liked: file.liked
    }));
    
    return res.json({
      files: formattedFiles,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('搜索用户图片错误:', error);
    return res.status(500).json({ error: '搜索用户图片失败' });
  }
});

export default router;
