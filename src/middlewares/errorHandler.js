/**
 * 全局错误处理中间件
 * 统一处理应用中的错误
 */

// 记录错误到控制台
const logError = (err) => {
  console.error('发生错误:', {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });
};

// 404错误处理
export const notFoundHandler = (req, res, next) => {
  const error = new Error(`找不到路径: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// 全局错误处理
export const errorHandler = (err, req, res, next) => {
  // 记录错误
  logError(err);
  
  // 获取状态码（默认为500）
  const statusCode = err.statusCode || 500;
  
  // 准备响应
  const errorResponse = {
    error: true,
    message: statusCode === 500 ? '服务器内部错误' : err.message,
    path: req.path
  };
  
  // 开发环境下添加堆栈信息
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }
  
  // 发送响应
  res.status(statusCode).json(errorResponse);
};

// 未捕获的Promise错误处理
export const setupUncaughtErrorHandlers = () => {
  process.on('unhandledRejection', (reason, promise) => {
    console.error('未处理的Promise拒绝:', reason);
    // 在开发环境中，可以选择终止进程
    // if (process.env.NODE_ENV === 'development') {
    //   process.exit(1);
    // }
  });
  
  process.on('uncaughtException', (error) => {
    console.error('未捕获的异常:', error);
    // 在生产环境中，应该进行优雅的关闭
    // if (process.env.NODE_ENV === 'production') {
    //   process.exit(1);
    // }
  });
}; 