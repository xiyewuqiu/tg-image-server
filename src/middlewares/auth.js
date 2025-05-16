/**
 * 认证中间件
 * 用于验证用户身份和权限
 */

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * 验证JWT令牌
 */
export const authenticate = async (req, res, next) => {
  try {
    // 获取Authorization头
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未授权，请登录' });
    }
    
    // 提取令牌
    const token = authHeader.split(' ')[1];
    
    // 验证令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 查找用户
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: '用户不存在或令牌无效' });
    }
    
    // 将用户信息添加到请求对象
    req.user = user;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: '令牌已过期，请重新登录' });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: '无效的令牌' });
    }
    
    next(error);
  }
};

/**
 * 可选的认证中间件
 * 如果有令牌，验证并添加用户信息；如果没有，继续处理
 */
export const optionalAuth = async (req, res, next) => {
  try {
    // 获取Authorization头
    const authHeader = req.headers.authorization;
    
    // 如果没有令牌，继续处理
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    
    // 提取令牌
    const token = authHeader.split(' ')[1];
    
    // 验证令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 查找用户
    const user = await User.findById(decoded.id).select('-password');
    
    if (user) {
      // 将用户信息添加到请求对象
      req.user = user;
    }
    
    next();
  } catch (error) {
    // 令牌无效，但我们不返回错误，只是继续处理
    next();
  }
};

/**
 * 管理员权限验证
 */
export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: '需要管理员权限' });
  }
  
  next();
}; 