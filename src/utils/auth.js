import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User.js';

// 生成JWT令牌
export const generateToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// 验证JWT令牌
export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { valid: true, payload: decoded };
  } catch (error) {
    return { valid: false, message: error.message };
  }
};

// 哈希密码
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// 验证密码
export const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// 认证中间件
export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未授权访问' });
    }
    
    const token = authHeader.substring(7);
    const { valid, payload, message } = verifyToken(token);
    
    if (!valid) {
      return res.status(401).json({ error: message || '无效的令牌' });
    }
    
    // 查找用户
    const user = await User.findById(payload.id);
    if (!user) {
      return res.status(401).json({ error: '用户不存在' });
    }
    
    // 将用户信息添加到请求对象
    req.user = {
      id: user._id,
      username: user.username
    };
    
    next();
  } catch (error) {
    console.error('认证错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
};
