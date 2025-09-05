export interface FileTypeHandler {
  /** 文件类型名称 */
  name: string;
  /** 支持的文件扩展名 */
  extensions: string[];
  /** 计算文件复杂度 */
  calculateComplexity(content: string): number;
}
