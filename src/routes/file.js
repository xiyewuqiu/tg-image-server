import express from 'express';
import fetch from 'node-fetch';
import { getFilePath } from '../utils/telegram.js';
import File from '../models/File.js';

const router = express.Router();

// 处理文件访问
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
    // 尝试处理通过Telegram Bot API上传的文件
    if (id.length > 30 || id.includes('.')) { // 长ID通常代表通过Bot上传的文件，或包含扩展名的文件
      const fileId = id.split('.')[0]; // 分离文件ID和扩展名
      const filePath = await getFilePath(fileId);

      if (filePath) {
        const telegramFileUrl = `https://api.telegram.org/file/bot${process.env.TG_BOT_TOKEN}/${filePath}`;
        return await proxyFile(req, res, telegramFileUrl);
      }
    } else {
      // 处理Telegraph链接
      const telegraphUrl = `https://telegra.ph/file/${id}`;
      return await proxyFile(req, res, telegraphUrl);
    }

    // 处理文件元数据
    const fileRecord = await File.findOne({ fileId: id });

    if (fileRecord) {
      // 检查文件访问权限
      if (fileRecord.listType === "Block" || fileRecord.label === "adult") {
        const referer = req.headers.referer;
        if (referer) {
          return res.redirect('/images/blocked.png');
        } else {
          return res.redirect('/block-img.html');
        }
      }
      
      // 更新访问记录
      fileRecord.updatedAt = Date.now();
      await fileRecord.save();
    }

    // 如果所有尝试都失败，返回404
    return res.status(404).send('文件不存在');
  } catch (error) {
    console.error('文件访问错误:', error);
    return res.status(500).send('服务器错误');
  }
});

/**
 * 代理文件请求
 * 直接传递原始文件内容，不进行压缩，确保原图质量
 */
async function proxyFile(req, res, fileUrl) {
  try {
    const response = await fetch(fileUrl, {
      method: req.method,
      headers: req.headers
    });

    if (!response.ok) {
      return res.status(response.status).send('文件获取失败');
    }

    // 设置响应头
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // 流式传输响应
    response.body.pipe(res);
  } catch (error) {
    console.error('代理文件错误:', error);
    res.status(500).send('服务器错误');
  }
}

export default router;
