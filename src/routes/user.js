import express from 'express';
import { getUserImages, searchUserImages, updateUserProfile, getUserStats } from '../controllers/userController.js';
import { authenticate } from '../middlewares/auth.js';
import { rateLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// 所有用户路由都需要认证
router.use(authenticate);

// 获取用户图片列表
router.get('/images', getUserImages);

// 搜索用户图片
router.get('/images/search', searchUserImages);

// 获取用户统计信息
router.get('/stats', getUserStats);

// 更新用户资料
router.put('/profile', 
  rateLimiter(60 * 60 * 1000, 10), // 每小时最多10次更新请求
  updateUserProfile
);

export default router;
