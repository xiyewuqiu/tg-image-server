import express from 'express';
import { register, login, getCurrentUser } from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';
import { validateUserRegistration, validateLogin } from '../middlewares/validator.js';
import { rateLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// 用户注册
router.post('/register',
  rateLimiter(60 * 60 * 1000, 5), // 每小时最多5次注册请求
  validateUserRegistration,        // 验证注册信息
  register                         // 处理注册
);

// 用户登录
router.post('/login',
  rateLimiter(15 * 60 * 1000, 10), // 15分钟内最多10次登录请求
  validateLogin,                   // 验证登录信息
  login                            // 处理登录
);

// 获取当前用户信息
router.get('/me',
  authenticate,                   // 验证用户身份
  getCurrentUser                  // 获取用户信息
);

export default router;
