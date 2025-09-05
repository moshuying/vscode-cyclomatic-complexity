import { FileTypeHandler } from '../common/types';

/** CSS/SCSS/Less 复杂度计算器 */
export class StyleHandler implements FileTypeHandler {
  name = 'Style';
  extensions = ['.css', '.scss', '.sass', '.less', '.styl'];

  calculateComplexity(content: string): number {
    let complexity = 1;

    // CSS 复杂度模式
    const stylePatterns = [
      // 选择器复杂度
      /\s*\+\s*/g, // 相邻兄弟选择器
      /\s*~\s*/g,  // 通用兄弟选择器
      /\s*>\s*/g,  // 子选择器
      /::?\w+/g,   // 伪类和伪元素
      /\[[\w\-="':]+\]/g, // 属性选择器
      // 媒体查询
      /@media\s*\(/g,
      /@supports\s*\(/g,
      // 嵌套（SCSS/Less特有）
      /&[\w\-:.\[\]]+/g,
      // 混入和函数（SCSS/Less）
      /@mixin\s+\w+/g,
      /@function\s+\w+/g,
      /@include\s+\w+/g,
      // 条件语句（SCSS/Less）
      /@if\b/g,
      /@else\s+if\b/g,
      /@for\b/g,
      /@while\b/g,
      /@each\b/g,
    ];

    for (const pattern of stylePatterns) {
      const matches = content.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    }

    // 计算嵌套深度（额外复杂度）
    const lines = content.split('\n');
    let maxNestingLevel = 0;
    let currentLevel = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.includes('{')) {
        currentLevel++;
        maxNestingLevel = Math.max(maxNestingLevel, currentLevel);
      }
      if (trimmed.includes('}')) {
        currentLevel = Math.max(0, currentLevel - 1);
      }
    }

    // 嵌套层级超过3层时增加复杂度
    if (maxNestingLevel > 3) {
      complexity += maxNestingLevel - 3;
    }

    return complexity;
  }
}
