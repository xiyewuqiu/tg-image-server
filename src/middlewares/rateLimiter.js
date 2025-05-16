/**
 * 速率限制中间件
 * 用于限制API请求频率，防止滥用
 */

// 简单的内存存储，生产环境建议使用Redis等持久存储
const ipRequestMap = new Map();

export const rateLimiter = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
  // 使用环境变量，如果存在
  const window = process.env.RATE_LIMIT_WINDOW_MS 
    ? parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) 
    : windowMs;
    
  const max = process.env.RATE_LIMIT_MAX 
    ? parseInt(process.env.RATE_LIMIT_MAX, 10) 
    : maxRequests;

  return (req, res, next) => {
    // 获取用户IP
    const ip = req.ip || req.connection.remoteAddress;
    
    // 获取当前时间
    const now = Date.now();
    
    // 创建IP记录（如果不存在）
    if (!ipRequestMap.has(ip)) {
      ipRequestMap.set(ip, { count: 1, resetTime: now + window });
      return next();
    }
    
    // 获取IP记录
    const record = ipRequestMap.get(ip);
    
    // 如果重置时间已过，重置计数
    if (record.resetTime <= now) {
      record.count = 1;
      record.resetTime = now + window;
      return next();
    }
    
    // 检查是否超过限制
    if (record.count >= max) {
      return res.status(429).json({ 
        error: '请求过于频繁', 
        message: '请稍后再试',
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      });
    }
    
    // 增加计数并继续
    record.count++;
    next();
  };
};

// 针对上传接口的特殊限制
export const uploadRateLimiter = (windowMs = 60 * 60 * 1000, maxRequests = 20) => {
  return rateLimiter(windowMs, maxRequests);
};

// 定期清理过期的IP记录
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipRequestMap.entries()) {
    if (record.resetTime <= now) {
      ipRequestMap.delete(ip);
    }
  }
}, 10 * 60 * 1000); // 每10分钟清理一次 