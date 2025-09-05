import * as vscode from 'vscode';
import { ComplexityAnalyzer, ComplexityResult } from './complexityAnalyzer';

export class FileTreeProvider implements vscode.TreeDataProvider<ComplexityTreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<ComplexityTreeItem | undefined | null | void> = new vscode.EventEmitter<ComplexityTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<ComplexityTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

  private _isAnalyzing: boolean = false;
  private _analysisError: string | null = null;
  private _progressInfo: string = '';

  constructor(private complexityAnalyzer: ComplexityAnalyzer) { }

  setAnalyzingState(isAnalyzing: boolean, error?: string) {
    this._isAnalyzing = isAnalyzing;
    this._analysisError = error || null;
    if (!isAnalyzing) {
      this._progressInfo = '';
    }
    this.refresh();
  }

  updateProgress(progressInfo: string) {
    this._progressInfo = progressInfo;
    this.refresh();
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: ComplexityTreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: ComplexityTreeItem): Promise<ComplexityTreeItem[]> {
    if (!element) {
      // 根节点
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders) {
        // 没有工作区时显示提示
        return [new ComplexityTreeItem({
          path: '',
          name: '请先打开一个工作区',
          complexity: 0,
          type: 'info',
          children: []
        })];
      }


      const items: ComplexityTreeItem[] = [];
      for (const folder of workspaceFolders) {
        const result = this.complexityAnalyzer.getCachedResult(folder.uri.fsPath);

        if (result) {
          // 有分析结果时显示实际数据
          items.push(new ComplexityTreeItem(result, true)); // 项目根节点自动展开
        } else {
          // 没有缓存时，创建项目根节点并显示状态信息
          const children: ComplexityResult[] = [];

          if (this._isAnalyzing) {
            const progressText = this._progressInfo || '⏳ 正在分析中...';
            children.push({
              path: '',
              name: progressText,
              complexity: 0,
              type: 'info'
            });
          } else if (this._analysisError) {
            children.push({
              path: '',
              name: `❌ 分析失败: ${this._analysisError}`,
              complexity: 0,
              type: 'info'
            });
          } else {
            children.push({
              path: '',
              name: '📝 暂无React文件分析数据',
              complexity: 0,
              type: 'info'
            });
            children.push({
              path: '',
              name: '💡 点击上方的同步按钮开始分析',
              complexity: 0,
              type: 'info'
            });
          }

          items.push(new ComplexityTreeItem({
            path: folder.uri.fsPath,
            name: folder.name,
            complexity: 0,
            type: 'folder',
            children: children
          }, true)); // 项目根节点自动展开
        }
      }
      return items;
    }


    // 子节点处理
    if (!element.result.children || element.result.children.length === 0) {
      return [];
    }

    // 如果子节点包含info类型，直接返回不排序
    if (element.result.children.some(child => child.type === 'info')) {
      return element.result.children.map(child => new ComplexityTreeItem(child));
    }

    // 按复杂度从高到低排序，文件夹优先
    const sortedChildren = element.result.children.sort((a, b) => {
      // 先按类型排序：文件夹优先
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      // 再按复杂度降序排序
      return b.complexity - a.complexity;
    });

    return sortedChildren.map(child => new ComplexityTreeItem(child));
  }
}

export class ComplexityTreeItem extends vscode.TreeItem {
  constructor(public readonly result: ComplexityResult, isRootProject: boolean = false) {
    super(
      result.name,
      result.type === 'folder' ?
        (isRootProject ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.Collapsed) :
        vscode.TreeItemCollapsibleState.None
    );

    if (result.type === 'info') {
      // 信息提示项
      this.description = '';
      this.tooltip = result.name;
      this.iconPath = new vscode.ThemeIcon('info', new vscode.ThemeColor('foreground'));
      this.contextValue = 'info';
    } else {
      // 文件或文件夹项
      this.description = result.complexity > 0 ? `${result.complexity}` : '';
      this.tooltip = `${result.name}\n路径: ${result.path}\n圈复杂度: ${result.complexity}`;

      // 根据复杂度设置不同的图标和颜色
      if (result.type === 'folder') {
        this.iconPath = new vscode.ThemeIcon('folder', new vscode.ThemeColor('folder.foreground'));
      } else if (result.complexity <= 5) {
        this.iconPath = new vscode.ThemeIcon('circle', new vscode.ThemeColor('charts.green'));
      } else if (result.complexity <= 10) {
        this.iconPath = new vscode.ThemeIcon('circle', new vscode.ThemeColor('charts.yellow'));
      } else {
        this.iconPath = new vscode.ThemeIcon('circle', new vscode.ThemeColor('charts.red'));
      }

      // 如果是文件，添加点击打开命令
      if (result.type === 'file') {
        this.command = {
          command: 'vscode.open',
          title: '打开文件',
          arguments: [vscode.Uri.file(result.path)]
        };
      }

      this.contextValue = result.type;
    }
  }
}
