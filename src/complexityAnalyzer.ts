import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import minimatch from 'minimatch';
import { FileTypeManager } from './fileTypeHandlers';

export interface ComplexityResult {
  path: string;
  name: string;
  complexity: number;
  type: 'file' | 'folder' | 'info';
  children?: ComplexityResult[];
}

interface GitignoreRule {
  pattern: string;
  isNegation: boolean;
  isDirectory: boolean;
  isAbsolute: boolean;
}

export class ComplexityAnalyzer {
  private cache = new Map<string, ComplexityResult>();
  private gitignoreRules = new Map<string, GitignoreRule[]>();
  private configChangeListener?: vscode.Disposable;
  private fileTypeManager = new FileTypeManager();

  constructor() {
    // 监听配置变化
    this.configChangeListener = vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('codeComplexity.excludeFolders') ||
        e.affectsConfiguration('reactComplexity.excludeFolders')) {
        // 清除缓存，下次分析时会使用新的配置
        this.clearCache();
        this.gitignoreRules.clear();
      }
    });
  }

  async analyzeFolder(folderPath: string, progressCallback?: (message: string, currentFile: number, totalFiles: number, currentFolder?: string) => void, ignoreGitignore: boolean = false): Promise<ComplexityResult> {
    const result = await this.analyzeFolderBreadthFirst(folderPath, progressCallback, ignoreGitignore);
    this.cache.set(folderPath, result);
    return result;
  }

  private async loadGitignoreRules(folderPath: string): Promise<GitignoreRule[]> {
    const gitignorePath = path.join(folderPath, '.gitignore');

    // 从VSCode配置中获取排除文件夹列表（支持新旧配置名称）
    let config = vscode.workspace.getConfiguration('codeComplexity');
    let excludeFolders = config.get<string[]>('excludeFolders');

    // 如果新配置不存在，回退到旧配置
    if (!excludeFolders || excludeFolders.length === 0) {
      config = vscode.workspace.getConfiguration('reactComplexity');
      excludeFolders = config.get<string[]>('excludeFolders');
    }

    // 如果都没有，使用默认值
    if (!excludeFolders) {
      excludeFolders = [
        'node_modules',
        'dist',
        'build',
        'out',
        'coverage',
        '.git',
        '.vscode',
        '.idea',
        '.nyc_output',
        'vendor',
        'bower_components',
        'target',
        'bin',
        'obj',
        'Debug',
        'Release',
        '.next',
        '.nuxt',
        '.cache',
        '.tmp',
        'tmp',
        'temp',
        'logs',
        '*.log'
      ];
    }

    // 将配置中的文件夹转换为GitignoreRule
    const defaultRules: GitignoreRule[] = excludeFolders.map(folder => {
      const isDirectory = !folder.includes('*') && !folder.includes('.');
      let pattern = folder;

      if (isDirectory && !pattern.endsWith('/')) {
        pattern = pattern + '/';
      }

      return {
        pattern: pattern,
        isNegation: false,
        isDirectory: isDirectory,
        isAbsolute: false
      };
    });

    try {
      const content = await fs.promises.readFile(gitignorePath, 'utf-8');
      const gitignoreRules = content.split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'))
        .map(line => {
          // 移除行内注释
          const cleanLine = line.split('#')[0].trim();
          if (!cleanLine) return null;

          const isNegation = cleanLine.startsWith('!');
          let pattern = isNegation ? cleanLine.substring(1) : cleanLine;

          // 处理转义字符
          pattern = pattern.replace(/\\!/g, '!');

          const isAbsolute = pattern.startsWith('/');
          if (isAbsolute) {
            pattern = pattern.substring(1);
          }

          const isDirectory = pattern.endsWith('/');
          if (isDirectory) {
            pattern = pattern.slice(0, -1);
          }

          return {
            pattern: pattern,
            isNegation: isNegation,
            isDirectory: isDirectory,
            isAbsolute: isAbsolute
          } as GitignoreRule;
        })
        .filter(rule => rule !== null) as GitignoreRule[];

      // 合并默认规则和.gitignore中的规则
      return [...defaultRules, ...gitignoreRules];
    } catch {
      // 如果没有.gitignore文件，使用默认规则
      return defaultRules;
    }
  }

  private shouldIgnore(itemPath: string, rootPath: string, gitignoreRules: GitignoreRule[]): boolean {
    const itemStats = fs.existsSync(itemPath) ? fs.statSync(itemPath) : null;
    const isDirectory = itemStats?.isDirectory() || false;

    // 获取相对路径（从项目根目录开始）
    const relativePath = path.relative(rootPath, itemPath).replace(/\\/g, '/');
    const itemName = path.basename(itemPath);

    let shouldIgnore = false;

    // 按顺序处理规则
    for (const rule of gitignoreRules) {
      let matches = false;

      // 如果规则是针对目录的，但当前项不是目录，跳过
      if (rule.isDirectory && !isDirectory) {
        continue;
      }

      // 构建匹配模式
      let matchPattern = rule.pattern;

      if (rule.isAbsolute) {
        // 绝对路径模式：从项目根目录开始匹配
        if (rule.isDirectory) {
          // 目录模式：匹配目录及其所有内容
          matches = relativePath === matchPattern || relativePath.startsWith(matchPattern + '/');
        } else {
          // 文件模式：精确匹配或glob匹配
          matches = minimatch(relativePath, matchPattern, { dot: true });
        }
      } else {
        // 相对路径模式：可以匹配任何层级
        if (rule.isDirectory) {
          // 目录模式
          const pathParts = relativePath.split('/');
          matches = pathParts.some(part => minimatch(part, matchPattern, { dot: true })) ||
            minimatch(relativePath, `**/${matchPattern}`, { dot: true }) ||
            minimatch(relativePath, `**/${matchPattern}/**`, { dot: true });
        } else {
          // 文件模式：使用glob匹配
          matches = minimatch(itemName, matchPattern, { dot: true }) ||
            minimatch(relativePath, matchPattern, { dot: true }) ||
            minimatch(relativePath, `**/${matchPattern}`, { dot: true });
        }
      }

      if (matches) {
        if (rule.isNegation) {
          // 否定规则：如果匹配，则不忽略
          shouldIgnore = false;
        } else {
          // 正常规则：如果匹配，则忽略
          shouldIgnore = true;
        }
      }
    }

    return shouldIgnore;
  }

  private async countSupportedFiles(folderPath: string, gitignoreRules: GitignoreRule[], ignoreGitignore: boolean = false): Promise<number> {
    let count = 0;
    const queue: string[] = [folderPath];
    const processed = new Set<string>();

    while (queue.length > 0) {
      const currentPath = queue.shift()!;

      if (processed.has(currentPath)) {
        continue;
      }
      processed.add(currentPath);

      try {
        const currentStats = await fs.promises.stat(currentPath);

        if (currentStats.isDirectory()) {
          if (!ignoreGitignore && this.shouldIgnore(currentPath, folderPath, gitignoreRules)) {
            continue;
          }

          const items = await fs.promises.readdir(currentPath);

          for (const item of items) {
            const itemPath = path.join(currentPath, item);

            if (!ignoreGitignore && this.shouldIgnore(itemPath, folderPath, gitignoreRules)) {
              continue;
            }

            try {
              const itemStats = await fs.promises.stat(itemPath);

              if (itemStats.isDirectory()) {
                queue.push(itemPath);
              } else if (this.isSupportedFile(item)) {
                count++;
              }
            } catch (error) {
              continue;
            }
          }
        }
      } catch (error) {
        continue;
      }
    }

    return count;
  }

  private getRelativeFolderPath(currentPath: string, rootPath: string): string {
    const relativePath = path.relative(rootPath, currentPath);
    const pathParts = relativePath.split(path.sep).filter(part => part.length > 0);

    // 最多显示三层
    if (pathParts.length <= 3) {
      return pathParts.join('/');
    } else {
      return pathParts.slice(0, 3).join('/') + '/...';
    }
  }

  private async categorizeDirectoryItems(
    items: string[],
    dirPath: string,
    folderPath: string,
    gitignoreRules: GitignoreRule[],
    ignoreGitignore: boolean
  ): Promise<{ directories: string[], files: string[] }> {
    const directories: string[] = [];
    const files: string[] = [];

    for (const item of items) {
      const itemPath = path.join(dirPath, item);

      // 检查是否应该忽略此项目
      if (!ignoreGitignore && this.shouldIgnore(itemPath, folderPath, gitignoreRules)) {
        continue;
      }

      try {
        const itemStats = await fs.promises.stat(itemPath);
        if (itemStats.isDirectory()) {
          directories.push(itemPath);
        } else if (this.isSupportedFile(item)) {
          files.push(itemPath);
        }
      } catch (error) {
        // 忽略无法访问的文件
        continue;
      }
    }

    return { directories, files };
  }

  private async analyzeFolderBreadthFirst(folderPath: string, progressCallback?: (message: string, currentFile: number, totalFiles: number, currentFolder?: string) => void, ignoreGitignore: boolean = false): Promise<ComplexityResult> {
    const stats = await fs.promises.stat(folderPath);
    const name = path.basename(folderPath);

    if (!stats.isDirectory()) {
      return this.analyzeFile(folderPath);
    }

    const gitignoreRules = ignoreGitignore ? [] : await this.loadGitignoreRules(folderPath);

    // 首先统计总文件数
    const totalFiles = await this.countSupportedFiles(folderPath, gitignoreRules, ignoreGitignore);
    let currentFile = 0;

    // 递归分析目录结构
    const analyzeDirectory = async (dirPath: string): Promise<ComplexityResult> => {
      const dirStats = await fs.promises.stat(dirPath);
      const dirName = path.basename(dirPath);

      if (!dirStats.isDirectory()) {
        return this.analyzeFile(dirPath);
      }

      // 检查是否应该忽略此目录
      if (dirPath !== folderPath && this.shouldIgnore(dirPath, folderPath, gitignoreRules)) {
        return {
          path: dirPath,
          name: dirName,
          complexity: 0,
          type: 'folder',
          children: []
        };
      }

      const children: ComplexityResult[] = [];

      try {
        const items = await fs.promises.readdir(dirPath);

        // 分别处理目录和文件
        const { directories, files } = await this.categorizeDirectoryItems(
          items,
          dirPath,
          folderPath,
          gitignoreRules,
          ignoreGitignore
        );

        // 先处理文件
        for (const filePath of files) {
          const fileResult = await this.analyzeFile(filePath);
          children.push(fileResult);

          // 实时更新缓存
          this.cache.set(filePath, fileResult);

          currentFile++;

          if (progressCallback) {
            const relativeFolder = this.getRelativeFolderPath(dirPath, folderPath);
            progressCallback(`分析文件: ${path.basename(filePath)}`, currentFile, totalFiles, relativeFolder);
          }
        }

        // 再递归处理子目录
        for (const subDirPath of directories) {
          const subDirResult = await analyzeDirectory(subDirPath);
          if (subDirResult.complexity > 0 || (subDirResult.children && subDirResult.children.length > 0)) {
            children.push(subDirResult);
            // 缓存子目录结果
            this.cache.set(subDirPath, subDirResult);
          }
        }

      } catch (error) {
        // 忽略无法访问的目录
      }

      const totalComplexity = children.reduce((sum, child) => sum + child.complexity, 0);

      return {
        path: dirPath,
        name: dirName,
        complexity: totalComplexity,
        type: 'folder',
        children
      };
    };

    return await analyzeDirectory(folderPath);
  }

  private async analyzeFile(filePath: string): Promise<ComplexityResult> {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const fileName = path.basename(filePath);
    const handler = this.fileTypeManager.getHandler(fileName);

    const complexity = handler ? handler.calculateComplexity(content) : 1;

    return {
      path: filePath,
      name: fileName,
      complexity,
      type: 'file'
    };
  }

  private isSupportedFile(fileName: string): boolean {
    return this.fileTypeManager.isSupportedFile(fileName);
  }

  getCachedResult(path: string): ComplexityResult | undefined {
    return this.cache.get(path);
  }

  clearCache(): void {
    this.cache.clear();
  }

  dispose(): void {
    this.configChangeListener?.dispose();
    this.clearCache();
    this.gitignoreRules.clear();
  }
}
