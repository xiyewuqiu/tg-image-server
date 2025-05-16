import express from 'express';
import { uploadImage, getRecentPublicImages } from '../controllers/uploadController.js';
import { validateImageUpload } from '../middlewares/validator.js';
import { optionalAuth } from '../middlewares/auth.js';
import { uploadRateLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// 处理文件上传 - 匿名或已登录用户
router.post('/', 
  uploadRateLimiter(), // 速率限制
  optionalAuth,        // 可选认证
  validateImageUpload, // 验证上传
  uploadImage          // 处理上传
);

// 获取最近上传的公开图片
router.get('/recent', getRecentPublicImages);

export default router;
