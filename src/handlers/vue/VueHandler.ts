import { FileTypeHandler } from '../common/types';
import { JavaScriptHandler } from '../javascript/JavaScriptHandler';

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
