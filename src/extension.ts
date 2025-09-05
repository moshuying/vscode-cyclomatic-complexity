import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { ComplexityAnalyzer } from './complexityAnalyzer';
import { ComplexityTreeItem, FileTreeProvider } from './fileTreeProvider';
import { FileDecoratorProvider } from './fileDecoratorProvider';


export function activate(context: vscode.ExtensionContext) {
  console.log('圈复杂度分析插件已激活');

  const complexityAnalyzer = new ComplexityAnalyzer();
  const fileTreeProvider = new FileTreeProvider(complexityAnalyzer);
  const fileDecoratorProvider = new FileDecoratorProvider(complexityAnalyzer);

  // 创建状态栏项目
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBarItem.text = "$(sync~spin) 分析圈复杂度中...";

  // 注册文件装饰器提供者
  const fileDecorationProvider = vscode.window.registerFileDecorationProvider(fileDecoratorProvider);

  // 注册文件树视图
  const treeView = vscode.window.createTreeView('complexityTree', {
    treeDataProvider: fileTreeProvider,
    showCollapseAll: true,
    canSelectMany: false
  });



  // 启动时自动进行全量更新
  const initializeAnalysis = async () => {
    try {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders) {
        return;
      }

      // 设置分析状态
      fileTreeProvider.setAnalyzingState(true);
      statusBarItem.show();

      for (const folder of workspaceFolders) {
        await complexityAnalyzer.analyzeFolder(folder.uri.fsPath, (message, currentFile, totalFiles, currentFolder) => {
          const progressText = totalFiles > 0 ? `(${currentFile}/${totalFiles})` : '';
          const folderText = currentFolder ? ` [${currentFolder}]` : '';
          statusBarItem.text = `$(sync~spin) 分析圈复杂度中 ${progressText}${folderText}`;
          statusBarItem.tooltip = `已分析 ${currentFile}/${totalFiles} 个文件${folderText}`;

          // 更新树视图进度显示 - 显示和状态栏tooltip一样的信息
          fileTreeProvider.updateProgress(`⏳ 已分析 ${currentFile}/${totalFiles} 个文件${folderText}`);

          // 实时更新装饰器
          fileDecoratorProvider.refresh();
        });
      }

      // 分析完成，清除分析状态
      fileTreeProvider.setAnalyzingState(false);
      fileTreeProvider.refresh();
      fileDecoratorProvider.refresh();
      statusBarItem.text = "$(check) 圈复杂度分析完成";
      statusBarItem.tooltip = "代码圈复杂度分析已完成";

      console.log('Initial analysis completed, WebView should refresh automatically');

      // 3秒后隐藏状态栏
      setTimeout(() => {
        statusBarItem.hide();
      }, 3000);

    } catch (error) {
      // 分析失败，设置错误状态
      fileTreeProvider.setAnalyzingState(false, String(error));
      statusBarItem.text = "$(error) 分析失败";
      statusBarItem.tooltip = `圈复杂度分析失败: ${error}`;
      vscode.window.showErrorMessage(`圈复杂度分析失败: ${error}`);
    }
  };

  // 延迟执行初始化分析，确保VSCode完全加载
  setTimeout(initializeAnalysis, 1000);

  // 注册更新文件夹圈复杂度的命令（递归更新）
  const updateFolderComplexity = vscode.commands.registerCommand(
    'cyclomatic-complexity.updateFolderComplexity',
    async (uri: ComplexityTreeItem | vscode.Uri) => {
      try {
        const p = uri instanceof ComplexityTreeItem ? uri.result?.path : uri.fsPath;
        if (!fs.existsSync(p)) {
          vscode.window.showErrorMessage('文件夹不存在');
          return;
        }
        const folderPath = p

        // 设置分析状态
        fileTreeProvider.setAnalyzingState(true);
        statusBarItem.text = `$(sync~spin) 分析文件夹: ${path.basename(folderPath)}`;
        statusBarItem.show();

        // 递归分析文件夹（忽略.gitignore）
        await complexityAnalyzer.analyzeFolder(folderPath, (message, currentFile, totalFiles, currentFolder) => {
          const progressText = totalFiles > 0 ? `(${currentFile}/${totalFiles})` : '';
          const folderText = currentFolder ? ` [${currentFolder}]` : '';
          statusBarItem.text = `$(sync~spin) 分析圈复杂度中 ${progressText}${folderText}`;
          statusBarItem.tooltip = `已分析 ${currentFile}/${totalFiles} 个文件${folderText}`;

          // 更新树视图进度显示 - 显示和状态栏tooltip一样的信息
          fileTreeProvider.updateProgress(`⏳ 已分析 ${currentFile}/${totalFiles} 个文件${folderText}`);

          // 实时更新装饰器
          fileDecoratorProvider.refresh();
        }, true); // 忽略.gitignore

        // 分析完成，清除分析状态
        fileTreeProvider.setAnalyzingState(false);
        fileTreeProvider.refresh();
        fileDecoratorProvider.refresh();
        statusBarItem.text = "$(check) 文件夹分析完成";
        statusBarItem.tooltip = `已递归更新文件夹 ${path.basename(folderPath)} 的圈复杂度`;

        console.log('Folder analysis completed, WebView should refresh automatically');

        // 3秒后隐藏状态栏
        setTimeout(() => {
          statusBarItem.hide();
        }, 3000);

      } catch (error) {
        // 分析失败，设置错误状态
        fileTreeProvider.setAnalyzingState(false, String(error));
        statusBarItem.text = "$(error) 分析失败";
        statusBarItem.tooltip = `更新圈复杂度失败: ${error}`;
        vscode.window.showErrorMessage(`更新圈复杂度失败: ${error}`);
      }
    }
  );

  // 注册全量更新圈复杂度的命令
  const updateComponentComplexity = vscode.commands.registerCommand(
    'cyclomatic-complexity.updateComplexity',
    async () => {
      try {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
          vscode.window.showErrorMessage('请先打开一个工作区');
          return;
        }

        // 设置分析状态
        fileTreeProvider.setAnalyzingState(true);
        statusBarItem.text = "$(sync~spin) 全量更新圈复杂度中...";
        statusBarItem.show();

        // 清除缓存，重新分析
        complexityAnalyzer.clearCache();

        for (const folder of workspaceFolders) {
          await complexityAnalyzer.analyzeFolder(folder.uri.fsPath, (message, currentFile, totalFiles, currentFolder) => {
            const progressText = totalFiles > 0 ? `(${currentFile}/${totalFiles})` : '';
            const folderText = currentFolder ? ` [${currentFolder}]` : '';
            statusBarItem.text = `$(sync~spin) 分析圈复杂度中 ${progressText}${folderText}`;
            statusBarItem.tooltip = `已分析 ${currentFile}/${totalFiles} 个文件${folderText}`;

            // 更新树视图进度显示 - 显示和状态栏tooltip一样的信息
            fileTreeProvider.updateProgress(`⏳ 已分析 ${currentFile}/${totalFiles} 个文件${folderText}`);

            // 实时更新装饰器
            fileDecoratorProvider.refresh();
          });
        }

        // 分析完成，清除分析状态
        fileTreeProvider.setAnalyzingState(false);
        fileTreeProvider.refresh();
        fileDecoratorProvider.refresh();
        statusBarItem.text = "$(check) 全量更新完成";
        statusBarItem.tooltip = "已全量更新所有支持文件的圈复杂度";

        console.log('Full analysis completed, WebView should refresh automatically');

        // 3秒后隐藏状态栏
        setTimeout(() => {
          statusBarItem.hide();
        }, 3000);

      } catch (error) {
        // 分析失败，设置错误状态
        fileTreeProvider.setAnalyzingState(false, String(error));
        statusBarItem.text = "$(error) 更新失败";
        statusBarItem.tooltip = `更新圈复杂度失败: ${error}`;
        vscode.window.showErrorMessage(`更新圈复杂度失败: ${error}`);
      }
    }
  );

  // 注册刷新视图命令
  const refreshView = vscode.commands.registerCommand(
    'cyclomatic-complexity.refresh',
    () => {
      fileTreeProvider.refresh();
      fileDecoratorProvider.refresh();
      vscode.window.showInformationMessage('圈复杂度视图已刷新');
    }
  );

  // 注册打开文件命令
  const openFile = vscode.commands.registerCommand(
    'cyclomatic-complexity.openFile',
    async (item: any) => {
      if (item && item.result && item.result.path) {
        try {
          const fileUri = vscode.Uri.file(item.result.path);
          const document = await vscode.workspace.openTextDocument(fileUri);
          await vscode.window.showTextDocument(document);
        } catch (error) {
          vscode.window.showErrorMessage(`无法打开文件: ${error}`);
        }
      }
    }
  );

  context.subscriptions.push(updateFolderComplexity);
  context.subscriptions.push(updateComponentComplexity);
  context.subscriptions.push(refreshView);
  context.subscriptions.push(openFile);
  context.subscriptions.push(treeView);
  context.subscriptions.push(fileDecorationProvider);
  context.subscriptions.push(statusBarItem);
  // 确保 ComplexityAnalyzer 的资源得到清理
  context.subscriptions.push({ dispose: () => complexityAnalyzer.dispose() });
}

export function deactivate() {
  // 扩展停用时的清理工作已通过 context.subscriptions 自动处理
}
