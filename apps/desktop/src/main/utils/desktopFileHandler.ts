import { LOCAL_STORAGE_URL_PREFIX } from '@/const/dir';
import FileService, { FileNotFoundError } from '@/services/fileSrv';
import { createLogger } from '@/utils/logger';

import { CustomRequestHandler } from './next-electron-rsc';

const logger = createLogger('utils:desktopFileHandler');

/**
 * 创建桌面文件请求处理器
 * @param fileService FileService 实例
 * @returns 桌面文件请求处理器
 */
export function createDesktopFileHandler(fileService: FileService): CustomRequestHandler {
  return async (request: Request) => {
    try {
      const url = new URL(request.url);

      // 检查是否是桌面文件请求
      if (!url.pathname.startsWith(LOCAL_STORAGE_URL_PREFIX)) {
        return null; // 不处理，让其他处理器处理
      }

      logger.debug(`Processing desktop file request: ${request.url}`);

      // 提取文件路径：从 /desktop-file/path/to/file.png 中提取 path/to/file.png
      const filePath = decodeURIComponent(url.pathname.slice(LOCAL_STORAGE_URL_PREFIX.length + 1));

      if (!filePath) {
        logger.warn(`Empty file path in desktop file request: ${request.url}`);
        return new Response('Bad Request: Empty file path', { status: 400 });
      }

      // 构造 desktop:// 格式的路径
      const desktopPath = `desktop://${filePath}`;

      logger.debug(`Requesting file from FileService: ${desktopPath}`);

      // 调用 FileService 获取文件
      const fileResult = await fileService.getFile(desktopPath);

      // 创建响应
      const response = new Response(fileResult.content, {
        headers: {
          'Content-Type': fileResult.mimeType,
          'Cache-Control': 'public, max-age=31536000', // 缓存一年
        },
        status: 200,
      });

      logger.debug(`Desktop file served successfully: ${desktopPath}`);
      return response;
    } catch (error) {
      logger.error(`Error serving desktop file: ${error}`);

      // 判断是否是文件未找到错误
      if (error instanceof FileNotFoundError) {
        return new Response('File Not Found', { status: 404 });
      }

      return new Response('Internal Server Error', { status: 500 });
    }
  };
}
