import * as path from 'path';
import { FileTypeHandler } from './types';
import { JavaScriptHandler } from '../javascript/JavaScriptHandler';
import { VueHandler } from '../vue/VueHandler';
import { HTMLHandler } from '../html/HTMLHandler';
import { StyleHandler } from '../css/StyleHandler';

/** 文件类型管理器 */
export class FileTypeManager {
  private handlers: FileTypeHandler[] = [
    new JavaScriptHandler(),
    new VueHandler(),
    new HTMLHandler(),
    new StyleHandler(),
  ];

  /** 获取文件对应的处理器 */
  getHandler(fileName: string): FileTypeHandler | null {
    const ext = path.extname(fileName).toLowerCase();

    for (const handler of this.handlers) {
      if (handler.extensions.includes(ext)) {
        return handler;
      }
    }

    return null;
  }

  /** 检查是否为支持的文件类型 */
  isSupportedFile(fileName: string): boolean {
    return this.getHandler(fileName) !== null;
  }

  /** 获取所有支持的文件扩展名 */
  getSupportedExtensions(): string[] {
    const extensions = new Set<string>();
    for (const handler of this.handlers) {
      handler.extensions.forEach(ext => extensions.add(ext));
    }
    return Array.from(extensions);
  }

  /** 添加自定义处理器 */
  addHandler(handler: FileTypeHandler): void {
    this.handlers.push(handler);
  }
}
