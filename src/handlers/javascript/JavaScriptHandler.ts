import { FileTypeHandler } from '../common/types';

/** JavaScript/TypeScript 复杂度计算器 */
export class JavaScriptHandler implements FileTypeHandler {
  name = 'JavaScript/TypeScript';
  extensions = ['.js', '.ts', '.jsx', '.tsx'];

  calculateComplexity(content: string): number {
    let complexity = 1; // 基础复杂度为1

    // 计算条件语句
    const conditionals = [
      /\bif\s*\(/g,
      /\belse\s+if\s*\(/g,
      /\bfor\s*\(/g,
      /\bwhile\s*\(/g,
      /\bdo\s*\{/g,
      /\bcase\b/g,
      /\bcatch\s*\(/g,
      /\b\?\s*\w+\s*:/g, // 三元运算符
      /\b&&\b/g,
      /\b\|\|\b/g
    ];

    for (const pattern of conditionals) {
      const matches = content.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    }

    // 计算函数定义
    const functionPatterns = [
      /\bfunction\s+\w+\s*\(/g,
      /\bconst\s+\w+\s*=\s*\(/g,
      /\blet\s+\w+\s*=\s*\(/g,
      /\bvar\s+\w+\s*=\s*\(/g,
      /\b=>\s*\{/g,
      /\b=>\s*\(/g
    ];

    for (const pattern of functionPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    }

    return complexity;
  }
}
