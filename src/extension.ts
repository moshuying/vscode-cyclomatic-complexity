import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { ComplexityAnalyzer } from './complexityAnalyzer';
import { ComplexityTreeItem, FileTreeProvider } from './fileTreeProvider';
import { FileDecoratorProvider } from './fileDecoratorProvider';
import { t } from './common';

export function activate(context: vscode.ExtensionContext) {

  const complexityAnalyzer = new ComplexityAnalyzer();
  const fileTreeProvider = new FileTreeProvider(complexityAnalyzer);
  const fileDecoratorProvider = new FileDecoratorProvider(complexityAnalyzer);

  // 创建状态栏项目
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBarItem.text = `$(sync~spin) ${t("status.analyzing")}`;

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
          statusBarItem.text = `$(sync~spin) ${t("status.analyzingWithProgress", progressText + folderText)}`;
          statusBarItem.tooltip = t("tooltip.analyzing", currentFile.toString(), totalFiles.toString(), folderText);

          // 更新树视图进度显示 - 显示和状态栏tooltip一样的信息
          fileTreeProvider.updateProgress(t("progress.analyzing", currentFile.toString(), totalFiles.toString(), folderText));

          // 实时更新装饰器
          fileDecoratorProvider.refresh();
        });
      }

      // 分析完成，清除分析状态
      fileTreeProvider.setAnalyzingState(false);
      fileTreeProvider.refresh();
      fileDecoratorProvider.refresh();
      statusBarItem.text = `$(check) ${t("status.completed")}`;
      statusBarItem.tooltip = t("tooltip.completed");

      console.log('Initial analysis completed, WebView should refresh automatically');

      // 3秒后隐藏状态栏
      setTimeout(() => {
        statusBarItem.hide();
      }, 3000);

    } catch (error) {
      // 分析失败，设置错误状态
      fileTreeProvider.setAnalyzingState(false, String(error));
      statusBarItem.text = `$(error) ${t("status.failed")}`;
      statusBarItem.tooltip = t("tooltip.failed", String(error));
      vscode.window.showErrorMessage(t("error.analysisFailed", String(error)));
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
          vscode.window.showErrorMessage(t("error.folderNotExists"));
          return;
        }
        const folderPath = p

        // 设置分析状态
        fileTreeProvider.setAnalyzingState(true);
        statusBarItem.text = `$(sync~spin) ${t("status.analyzingFolder", path.basename(folderPath))}`;
        statusBarItem.show();

        // 递归分析文件夹（忽略.gitignore）
        await complexityAnalyzer.analyzeFolder(folderPath, (message, currentFile, totalFiles, currentFolder) => {
          const progressText = totalFiles > 0 ? `(${currentFile}/${totalFiles})` : '';
          const folderText = currentFolder ? ` [${currentFolder}]` : '';
          statusBarItem.text = `$(sync~spin) ${t("status.analyzingWithProgress", progressText + folderText)}`;
          statusBarItem.tooltip = t("tooltip.analyzing", currentFile.toString(), totalFiles.toString(), folderText);

          // 更新树视图进度显示 - 显示和状态栏tooltip一样的信息
          fileTreeProvider.updateProgress(t("progress.analyzing", currentFile.toString(), totalFiles.toString(), folderText));

          // 实时更新装饰器
          fileDecoratorProvider.refresh();
        }, true); // 忽略.gitignore

        // 分析完成，清除分析状态
        fileTreeProvider.setAnalyzingState(false);
        fileTreeProvider.refresh();
        fileDecoratorProvider.refresh();
        statusBarItem.text = `$(check) ${t("status.folderCompleted")}`;
        statusBarItem.tooltip = t("tooltip.folderCompleted", path.basename(folderPath));

        console.log('Folder analysis completed, WebView should refresh automatically');

        // 3秒后隐藏状态栏
        setTimeout(() => {
          statusBarItem.hide();
        }, 3000);

      } catch (error) {
        // 分析失败，设置错误状态
        fileTreeProvider.setAnalyzingState(false, String(error));
        statusBarItem.text = `$(error) ${t("status.failed")}`;
        statusBarItem.tooltip = t("tooltip.updateFailed", String(error));
        vscode.window.showErrorMessage(t("error.updateFailed", String(error)));
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
          vscode.window.showErrorMessage(t("error.noWorkspace"));
          return;
        }

        // 设置分析状态
        fileTreeProvider.setAnalyzingState(true);
        statusBarItem.text = `$(sync~spin) ${t("status.analyzingFullUpdate")}`;
        statusBarItem.show();

        // 清除缓存，重新分析
        complexityAnalyzer.clearCache();

        for (const folder of workspaceFolders) {
          await complexityAnalyzer.analyzeFolder(folder.uri.fsPath, (message, currentFile, totalFiles, currentFolder) => {
            const progressText = totalFiles > 0 ? `(${currentFile}/${totalFiles})` : '';
            const folderText = currentFolder ? ` [${currentFolder}]` : '';
            statusBarItem.text = `$(sync~spin) ${t("status.analyzingWithProgress", progressText + folderText)}`;
            statusBarItem.tooltip = vscode.l10n.t("cyclomatic-complexity.tooltip.analyzing", currentFile.toString(), totalFiles.toString(), folderText);

            // 更新树视图进度显示 - 显示和状态栏tooltip一样的信息
            fileTreeProvider.updateProgress(t("progress.analyzing", currentFile.toString(), totalFiles.toString(), folderText));

            // 实时更新装饰器
            fileDecoratorProvider.refresh();
          });
        }

        // 分析完成，清除分析状态
        fileTreeProvider.setAnalyzingState(false);
        fileTreeProvider.refresh();
        fileDecoratorProvider.refresh();
        statusBarItem.text = `$(check) ${t("status.fullUpdateCompleted")}`;
        statusBarItem.tooltip = t("tooltip.fullUpdateCompleted");

        console.log('Full analysis completed, WebView should refresh automatically');

        // 3秒后隐藏状态栏
        setTimeout(() => {
          statusBarItem.hide();
        }, 3000);

      } catch (error) {
        // 分析失败，设置错误状态
        fileTreeProvider.setAnalyzingState(false, String(error));
        statusBarItem.text = `$(error) ${t("status.updateFailed")}`;
        statusBarItem.tooltip = t("tooltip.updateFailed", String(error));
        vscode.window.showErrorMessage(t("error.updateFailed", String(error)));
      }
    }
  );

  // 注册刷新视图命令
  const refreshView = vscode.commands.registerCommand(
    'cyclomatic-complexity.refresh',
    () => {
      fileTreeProvider.refresh();
      fileDecoratorProvider.refresh();
      vscode.window.showInformationMessage(t("message.viewRefreshed"));
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
          vscode.window.showErrorMessage(t("error.cannotOpenFile", String(error)));
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
