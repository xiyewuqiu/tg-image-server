/**
 * 输入验证中间件
 * 用于验证请求参数，防止恶意输入
 */

// 验证上传的图片
export const validateImageUpload = (req, res, next) => {
  try {
    // 检查是否有文件上传
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: '没有选择文件上传' });
    }

    const image = req.files.image;
    
    // 检查文件类型
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,image/webp').split(',');
    if (!allowedTypes.includes(image.mimetype)) {
      return res.status(400).json({ 
        error: '不支持的文件类型', 
        message: `只允许上传以下类型: ${allowedTypes.join(', ')}` 
      });
    }
    
    // 检查文件大小
    const maxSize = process.env.MAX_FILE_SIZE || 10 * 1024 * 1024; // 默认10MB
    if (image.size > maxSize) {
      return res.status(400).json({ 
        error: '文件太大', 
        message: `文件大小不能超过 ${Math.floor(maxSize / 1024 / 1024)}MB` 
      });
    }
    
    next();
  } catch (error) {
    console.error('文件验证错误:', error);
    res.status(500).json({ error: '文件验证过程中发生错误' });
  }
};

// 验证用户注册输入
export const validateUserRegistration = (req, res, next) => {
  const { username, email, password } = req.body;
  
  // 验证用户名
  if (!username || username.length < 3 || username.length > 20) {
    return res.status(400).json({ error: '用户名长度必须在3-20个字符之间' });
  }
  
  // 验证邮箱
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: '请提供有效的邮箱地址' });
  }
  
  // 验证密码
  if (!password || password.length < 6) {
    return res.status(400).json({ error: '密码长度必须至少为6个字符' });
  }
  
  next();
};

// 验证登录输入
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  
  // 验证邮箱
  if (!email) {
    return res.status(400).json({ error: '请提供邮箱地址' });
  }
  
  // 验证密码
  if (!password) {
    return res.status(400).json({ error: '请提供密码' });
  }
  
  next();
}; 