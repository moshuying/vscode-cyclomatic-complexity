import * as vscode from 'vscode';
import { ComplexityAnalyzer } from './complexityAnalyzer';

export class FileDecoratorProvider implements vscode.FileDecorationProvider {
  private _onDidChangeFileDecorations: vscode.EventEmitter<vscode.Uri | vscode.Uri[] | undefined> = new vscode.EventEmitter<vscode.Uri | vscode.Uri[] | undefined>();
  readonly onDidChangeFileDecorations: vscode.Event<vscode.Uri | vscode.Uri[] | undefined> = this._onDidChangeFileDecorations.event;

  constructor(private complexityAnalyzer: ComplexityAnalyzer) { }

  provideFileDecoration(uri: vscode.Uri): vscode.FileDecoration | undefined {
    const result = this.complexityAnalyzer.getCachedResult(uri.fsPath);

    // 对文件和文件夹都显示装饰器
    if (!result || result.complexity === 0) {
      return undefined;
    }

    let color: vscode.ThemeColor;
    let tooltip: string;
    const typeText = result.type === 'folder' ? '文件夹' : '文件';

    if (result.complexity <= 5) {
      color = new vscode.ThemeColor('charts.green');
      tooltip = `${typeText}圈复杂度: ${result.complexity} (低)`;
    } else if (result.complexity <= 10) {
      color = new vscode.ThemeColor('charts.yellow');
      tooltip = `${typeText}圈复杂度: ${result.complexity} (中)`;
    } else {
      color = new vscode.ThemeColor('charts.red');
      tooltip = `${typeText}圈复杂度: ${result.complexity} (高)`;
    }

    return {
      badge: result.complexity.toString(),
      // color: color,
      // tooltip: tooltip
    };
  }

  refresh(): void {
    this._onDidChangeFileDecorations.fire(undefined);
  }
}
