import * as path from 'path';

export interface FileTypeHandler {
  /** 文件类型名称 */
  name: string;
  /** 支持的文件扩展名 */
  extensions: string[];
  /** 计算文件复杂度 */
  calculateComplexity(content: string): number;
}

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

/** Vue 文件复杂度计算器 */
export class VueHandler implements FileTypeHandler {
  name = 'Vue';
  extensions = ['.vue'];

  calculateComplexity(content: string): number {
    let complexity = 1;

    // Vue 特定的复杂度模式
    const vuePatterns = [
      // 模板指令
      /v-if\b/g,
      /v-else-if\b/g,
      /v-for\b/g,
      /v-show\b/g,
      // 计算属性和方法
      /\bcomputed\s*:\s*\{/g,
      /\bmethods\s*:\s*\{/g,
      /\bwatch\s*:\s*\{/g,
      // 生命周期钩子
      /\bcreated\s*\(/g,
      /\bmounted\s*\(/g,
      /\bupdated\s*\(/g,
      /\bdestroyed\s*\(/g,
    ];

    for (const pattern of vuePatterns) {
      const matches = content.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    }

    // 复用 JavaScript 计算器处理 script 部分
    const jsHandler = new JavaScriptHandler();
    const scriptMatches = content.match(/<script[^>]*>([\s\S]*?)<\/script>/g);
    if (scriptMatches) {
      for (const script of scriptMatches) {
        const scriptContent = script.replace(/<script[^>]*>|<\/script>/g, '');
        complexity += jsHandler.calculateComplexity(scriptContent) - 1; // 减去基础复杂度避免重复计算
      }
    }

    return complexity;
  }
}

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
