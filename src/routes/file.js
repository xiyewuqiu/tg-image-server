import express from 'express';
import { getFileInfo, getFile, deleteFile, updateFile } from '../controllers/fileController.js';
import { authenticate, optionalAuth } from '../middlewares/auth.js';
import { rateLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// 获取文件（可选认证）
router.get('/:id', 
  rateLimiter(5 * 60 * 1000, 100), // 5分钟内最多100次请求
  optionalAuth,
  getFile
);

// 获取文件信息（可选认证）
router.get('/:id/info', 
  optionalAuth,
  getFileInfo
);

// 更新文件信息（需要认证）
router.put('/:id', 
  authenticate,
  updateFile
);

// 删除文件（需要认证）
router.delete('/:id', 
  authenticate,
  deleteFile
);

export default router;
