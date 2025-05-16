/**
 * 认证控制器
 * 处理用户注册、登录相关的业务逻辑
 */

import User from '../models/User.js';
import { generateToken, hashPassword, comparePassword } from '../utils/auth.js';

/**
 * 用户注册
 */
export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    
    // 检查邮箱是否已存在
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: '该邮箱已被注册' });
    }
    
    // 检查用户名是否已存在
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: '该用户名已被使用' });
    }
    
    // 创建新用户
    const hashedPassword = await hashPassword(password);
    
    const user = new User({
      username,
      email,
      password: hashedPassword
    });
    
    await user.save();
    
    // 生成JWT
    const token = generateToken(user);
    
    // 返回用户信息（不包含密码）
    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 用户登录
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // 查找用户
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: '邮箱或密码不正确' });
    }
    
    // 验证密码
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: '邮箱或密码不正确' });
    }
    
    // 生成JWT
    const token = generateToken(user);
    
    // 返回用户信息
    res.json({
      success: true,
      message: '登录成功',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取当前用户信息
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    // 用户信息来自auth中间件
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ error: '未授权' });
    }
    
    // 返回用户信息
    res.json({
      success: true,
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