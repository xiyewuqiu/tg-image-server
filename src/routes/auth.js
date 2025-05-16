import express from 'express';
import { generateToken, hashPassword, verifyPassword, authMiddleware } from '../utils/auth.js';
import User from '../models/User.js';

const router = express.Router();

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    // 验证输入
    if (!username || !password || !email) {
      return res.status(400).json({ error: '用户名、密码和邮箱都是必填项' });
    }
    
    // 检查用户名是否已存在
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ error: '用户名已存在' });
    }
    
    // 检查邮箱是否已存在
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ error: '邮箱已被注册' });
    }
    
    // 哈希密码
    const hashedPassword = await hashPassword(password);
    
    // 创建用户
    const user = new User({
      username,
      email,
      password: hashedPassword
    });
    
    await user.save();
    
    // 生成令牌
    const token = generateToken({ id: user._id, username: user.username });
    
    // 返回用户信息（不包含密码）
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt
    };
    
    return res.status(201).json({ 
      message: '注册成功', 
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('注册错误:', error);
    return res.status(500).json({ error: '注册失败' });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 验证输入
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码都是必填项' });
    }
    
    // 获取用户信息
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    // 验证密码
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    // 生成令牌
    const token = generateToken({ id: user._id, username: user.username });
    
    // 返回用户信息（不包含密码）
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt
    };
    
    return res.json({ 
      message: '登录成功', 
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('登录错误:', error);
    return res.status(500).json({ error: '登录失败' });
  }
});

// 获取当前用户信息
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    return res.json(user);
  } catch (error) {
    console.error('获取用户信息错误:', error);
    return res.status(500).json({ error: '获取用户信息失败' });
  }
});

export default router;
