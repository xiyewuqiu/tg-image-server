/**
 * 用户控制器
 * 处理用户相关的业务逻辑
 */

import File from '../models/File.js';
import User from '../models/User.js';
import { hashPassword, comparePassword } from '../utils/auth.js';

/**
 * 获取用户的图片列表
 */
export const getUserImages = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    
    // 查询用户图片
    const files = await File.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('_id originalName size url isPublic createdAt downloads');
    
    // 获取总数
    const total = await File.countDocuments({ user: userId });
    
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

/**
 * 搜索用户的图片
 */
export const searchUserImages = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { query } = req.query;
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    
    // 构建搜索条件
    const searchCondition = {
      user: userId
    };
    
    // 如果有查询参数，添加文件名搜索
    if (query) {
      searchCondition.originalName = { $regex: query, $options: 'i' };
    }
    
    // 查询用户图片
    const files = await File.find(searchCondition)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('_id originalName size url isPublic createdAt downloads');
    
    // 获取总数
    const total = await File.countDocuments(searchCondition);
    
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

/**
 * 更新用户信息
 */
export const updateUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { username, email, currentPassword, newPassword } = req.body;
    
    // 查找用户
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    // 更新用户名
    if (username && username !== user.username) {
      // 检查用户名是否已存在
      const existingUsername = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUsername) {
        return res.status(400).json({ error: '该用户名已被使用' });
      }
      user.username = username;
    }
    
    // 更新邮箱
    if (email && email !== user.email) {
      // 检查邮箱是否已存在
      const existingEmail = await User.findOne({ email, _id: { $ne: userId } });
      if (existingEmail) {
        return res.status(400).json({ error: '该邮箱已被注册' });
      }
      user.email = email;
    }
    
    // 更新密码
    if (currentPassword && newPassword) {
      // 验证当前密码
      const isPasswordValid = await comparePassword(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ error: '当前密码不正确' });
      }
      
      // 设置新密码
      user.password = await hashPassword(newPassword);
    }
    
    await user.save();
    
    // 返回更新后的用户信息
    res.json({
      success: true,
      message: '用户资料已更新',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取用户统计信息
 */
export const getUserStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // 总上传数
    const totalUploads = await File.countDocuments({ user: userId });
    
    // 总下载数
    const downloadsResult = await File.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, totalDownloads: { $sum: '$downloads' } } }
    ]);
    
    const totalDownloads = downloadsResult.length > 0 ? downloadsResult[0].totalDownloads : 0;
    
    // 总存储空间
    const storageResult = await File.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, totalSize: { $sum: '$size' } } }
    ]);
    
    const totalStorage = storageResult.length > 0 ? storageResult[0].totalSize : 0;
    
    // 返回统计信息
    res.json({
      success: true,
      data: {
        totalUploads,
        totalDownloads,
        totalStorage,
        storageFormatted: formatBytes(totalStorage)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 格式化字节大小为可读格式
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
} 