import fetch from 'node-fetch';
import FormData from 'form-data';

/**
 * 发送文件到Telegram
 * @param {Object} file - 上传的文件对象
 * @param {String} fileName - 文件名
 * @returns {Promise<Object>} 上传结果
 */
export const sendToTelegram = async (file, fileName) => {
  const MAX_RETRIES = 2;
  let retryCount = 0;
  
  const sendRequest = async () => {
    try {
      const formData = new FormData();
      formData.append('chat_id', process.env.TG_CHAT_ID);
      
      // 根据文件类型选择合适的上传方式
      let apiEndpoint;
      const fileType = file.mimetype;
      
      if (fileType.startsWith('image/')) {
        formData.append('document', file.data, { filename: fileName });
        apiEndpoint = 'sendDocument';
      } else if (fileType.startsWith('audio/')) {
        formData.append('audio', file.data, { filename: fileName });
        apiEndpoint = 'sendAudio';
      } else if (fileType.startsWith('video/')) {
        formData.append('video', file.data, { filename: fileName });
        apiEndpoint = 'sendVideo';
      } else {
        formData.append('document', file.data, { filename: fileName });
        apiEndpoint = 'sendDocument';
      }
      
      const apiUrl = `https://api.telegram.org/bot${process.env.TG_BOT_TOKEN}/${apiEndpoint}`;
      
      const response = await fetch(apiUrl, { 
        method: 'POST', 
        body: formData 
      });
      
      const responseData = await response.json();
      
      if (response.ok) {
        return { success: true, data: responseData };
      }
      
      return {
        success: false,
        error: responseData.description || '上传到Telegram失败'
      };
    } catch (error) {
      console.error('网络错误:', error);
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        // 网络错误时的重试逻辑
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        return await sendRequest();
      }
      return { success: false, error: '发生网络错误' };
    }
  };
  
  return await sendRequest();
};

/**
 * 获取文件ID
 * @param {Object} response - Telegram API响应
 * @returns {String|null} 文件ID
 */
export const getFileId = (response) => {
  if (!response.ok || !response.result) return null;

  const result = response.result;
  // 保留photo处理逻辑以兼容旧数据，但新上传的图片会走document逻辑
  if (result.photo) {
    return result.photo.reduce((prev, current) =>
      (prev.file_size > current.file_size) ? prev : current
    ).file_id;
  }
  if (result.document) return result.document.file_id;
  if (result.video) return result.video.file_id;
  if (result.audio) return result.audio.file_id;

  return null;
};

/**
 * 获取Telegram文件路径
 * @param {String} fileId - 文件ID
 * @returns {Promise<String|null>} 文件路径
 */
export const getFilePath = async (fileId) => {
  try {
    const url = `https://api.telegram.org/bot${process.env.TG_BOT_TOKEN}/getFile?file_id=${fileId}`;
    const res = await fetch(url, {
      method: 'GET',
    });

    if (!res.ok) {
      console.error(`HTTP错误! 状态: ${res.status}`);
      return null;
    }

    const responseData = await res.json();
    const { ok, result } = responseData;

    if (ok && result) {
      return result.file_path;
    } else {
      console.error('响应数据错误:', responseData);
      return null;
    }
  } catch (error) {
    console.error('获取文件路径错误:', error.message);
    return null;
  }
};
