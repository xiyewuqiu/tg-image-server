/**
 * 文件控制器
 * 处理文件访问和管理相关的业务逻辑
 */

import File from '../models/File.js';
import { downloadImageFromTelegram } from '../utils/telegram.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 获取文件详情
 */
export const getFileInfo = async (req, res, next) => {
  try {
    const fileId = req.params.id;
    
    // 查找文件
    const file = await File.findById(fileId);
    
    if (!file) {
      return res.status(404).json({ error: '文件不存在' });
    }
    
    // 检查访问权限
    if (!file.isPublic && (!req.user || file.user.toString() !== req.user.id)) {
      return res.status(403).json({ error: '没有权限访问此文件' });
    }
    
    // 返回文件信息
    res.json({
      success: true,
      data: {
        id: file._id,
        originalName: file.originalName,
        mimeType: file.mimeType,
        size: file.size,
        url: file.url,
        isPublic: file.isPublic,
        createdAt: file.createdAt,
        downloads: file.downloads
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 访问/下载文件
 */
export const getFile = async (req, res, next) => {
  try {
    const fileId = req.params.id;
    
    // 查找文件
    const file = await File.findById(fileId);
    
    if (!file) {
      // 发送默认的blocked.png图片
      const blockedImagePath = path.join(__dirname, '../../public/images/blocked.png');
      return res.sendFile(blockedImagePath);
    }
    
    // 检查访问权限
    if (!file.isPublic && (!req.user || file.user.toString() !== req.user.id)) {
      // 发送默认的blocked.png图片
      const blockedImagePath = path.join(__dirname, '../../public/images/blocked.png');
      return res.sendFile(blockedImagePath);
    }
    
    // 增加下载计数
    file.downloads += 1;
    await file.save();
    
    // 检查是否需要直接下载文件
    const download = req.query.download === 'true';
    
    if (download) {
      // 从Telegram下载
      const imageData = await downloadImageFromTelegram(file.telegramFileId);
      
      if (!imageData.success) {
        return res.status(500).json({ error: '从Telegram下载文件失败' });
      }
      
      // 设置Content-Disposition头，使浏览器下载文件
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalName)}"`);
      res.setHeader('Content-Type', file.mimeType);
      
      return res.send(imageData.buffer);
    }
    
    // 直接重定向到Telegram URL
    res.redirect(file.url);
  } catch (error) {
    next(error);
  }
};

/**
 * 删除文件
 */
export const deleteFile = async (req, res, next) => {
  try {
    const fileId = req.params.id;
    
    // 查找文件
    const file = await File.findById(fileId);
    
    if (!file) {
      return res.status(404).json({ error: '文件不存在' });
    }
    
    // 检查权限
    if (!req.user || (file.user && file.user.toString() !== req.user.id && req.user.role !== 'admin')) {
      return res.status(403).json({ error: '没有权限删除此文件' });
    }
    
    // 删除文件
    await file.remove();
    
    // 返回成功响应
    res.json({ success: true, message: '文件已成功删除' });
  } catch (error) {
    next(error);
  }
};

/**
 * 更新文件信息
 */
export const updateFile = async (req, res, next) => {
  try {
    const fileId = req.params.id;
    const { isPublic } = req.body;
    
    // 查找文件
    const file = await File.findById(fileId);
    
    if (!file) {
      return res.status(404).json({ error: '文件不存在' });
    }
    
    // 检查权限
    if (!req.user || (file.user && file.user.toString() !== req.user.id && req.user.role !== 'admin')) {
      return res.status(403).json({ error: '没有权限更新此文件' });
    }
    
    // 更新文件
    if (isPublic !== undefined) {
      file.isPublic = isPublic;
    }
    
    await file.save();
    
    // 返回更新后的文件
    res.json({
      success: true,
      message: '文件信息已更新',
      data: {
        id: file._id,
        originalName: file.originalName,
        isPublic: file.isPublic
      }
    });
  } catch (error) {
    next(error);
  }
}; 