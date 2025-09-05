import { FileTypeHandler } from '../common/types';

/** HTML 复杂度计算器 */
export class HTMLHandler implements FileTypeHandler {
  name = 'HTML';
  extensions = ['.html', '.htm'];

  calculateComplexity(content: string): number {
    let complexity = 1; // 基础复杂度为1

    // HTML 复杂度模式
    const htmlPatterns = [
      // 表单相关元素（交互复杂度）
      /<form\b[^>]*>/g,
      /<input\b[^>]*>/g,
      /<select\b[^>]*>/g,
      /<textarea\b[^>]*>/g,
      /<button\b[^>]*>/g,

      // 交互元素
      /<a\b[^>]*href/g,
      /<iframe\b[^>]*>/g,
      /<video\b[^>]*>/g,
      /<audio\b[^>]*>/g,
      /<canvas\b[^>]*>/g,

      // 条件和循环结构（模板引擎）
      /\{\{#if\b/g,
      /\{\{#each\b/g,
      /\{\{#unless\b/g,
      /<%\s*if\b/g,
      /<%\s*for\b/g,
      /<%\s*while\b/g,

      // 复杂属性
      /onclick\s*=/g,
      /onload\s*=/g,
      /onchange\s*=/g,
      /onsubmit\s*=/g,
      /data-\w+\s*=/g,

      // 脚本和样式内嵌
      /<script\b[^>]*>/g,
      /<style\b[^>]*>/g,
    ];

    for (const pattern of htmlPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    }

    // 计算嵌套深度
    const nestingComplexity = this.calculateNestingComplexity(content);
    complexity += nestingComplexity;

    // 处理内嵌的JavaScript和CSS
    const inlineComplexity = this.calculateInlineComplexity(content);
    complexity += inlineComplexity;

    return complexity;
  }

  private calculateNestingComplexity(content: string): number {
    let maxDepth = 0;
    let currentDepth = 0;

    // 匹配所有HTML标签
    const tagPattern = /<\/?[a-zA-Z][^>]*>/g;
    let match;

    while ((match = tagPattern.exec(content)) !== null) {
      const tag = match[0];

      // 忽略自闭合标签和注释
      if (tag.includes('/>') || tag.startsWith('<!--') || tag.startsWith('<!')) {
        continue;
      }

      if (tag.startsWith('</')) {
        // 闭合标签
        currentDepth = Math.max(0, currentDepth - 1);
      } else {
        // 开始标签
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      }
    }

    // 嵌套深度超过5层时增加复杂度
    return maxDepth > 5 ? maxDepth - 5 : 0;
  }

  private calculateInlineComplexity(content: string): number {
    let inlineComplexity = 0;

    // 处理内嵌JavaScript - 使用简化的复杂度计算
    const scriptMatches = content.match(/<script[^>]*>([\s\S]*?)<\/script>/g);
    if (scriptMatches) {
      for (const script of scriptMatches) {
        const scriptContent = script.replace(/<script[^>]*>|<\/script>/g, '');
        if (scriptContent.trim()) {
          // 简化的JS复杂度计算
          let jsComplexity = 1;
          const jsPatterns = [/\bif\s*\(/g, /\bfor\s*\(/g, /\bwhile\s*\(/g, /\bfunction\b/g, /=>/g];
          for (const pattern of jsPatterns) {
            const matches = scriptContent.match(pattern);
            if (matches) jsComplexity += matches.length;
          }
          inlineComplexity += jsComplexity;
        }
      }
    }

    // 处理内嵌CSS - 使用简化的复杂度计算
    const styleMatches = content.match(/<style[^>]*>([\s\S]*?)<\/style>/g);
    if (styleMatches) {
      for (const style of styleMatches) {
        const styleContent = style.replace(/<style[^>]*>|<\/style>/g, '');
        if (styleContent.trim()) {
          // 简化的CSS复杂度计算
          let cssComplexity = 1;
          const cssPatterns = [/@media/g, /::?\w+/g, /\[[\w\-="':]+\]/g, /@\w+/g];
          for (const pattern of cssPatterns) {
            const matches = styleContent.match(pattern);
            if (matches) cssComplexity += matches.length;
          }
          inlineComplexity += cssComplexity;
        }
      }
    }

    return inlineComplexity;
  }
}
