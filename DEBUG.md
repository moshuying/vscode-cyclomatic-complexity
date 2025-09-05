# 调试指南

## 常见问题解决

### 1. 插件无法启动

**症状**: 按F5启动调试时没有反应或报错

**解决方案**:
1. 确保已安装依赖: `npm install`
2. 编译项目: `npm run compile`
3. 检查out目录是否存在并包含编译后的文件
4. 重启VSCode

### 2. 编译错误

**症状**: TypeScript编译失败

**解决方案**:
1. 检查TypeScript版本: `npx tsc --version`
2. 清理并重新编译: `rm -rf out && npm run compile`
3. 检查src目录下的所有.ts文件语法

### 3. 插件激活失败

**症状**: 插件激活但没有功能

**解决方案**:
1. 打开开发者工具 (Help > Toggle Developer Tools)
2. 查看控制台是否有错误信息
3. 检查package.json中的activationEvents配置

### 4. 视图不显示

**症状**: "代码圈复杂度"视图不显示

**解决方案**:
1. 确保工作区已打开
2. 手动执行命令: Ctrl+Shift+P > "全量更新圈复杂度"
3. 检查视图是否在资源管理器中显示

## 调试步骤

1. **准备环境**:
   ```bash
   npm install
   npm run compile
   ```

2. **启动调试**:
   - 按F5或点击"运行扩展"
   - 等待新的VSCode窗口打开

3. **测试功能**:
   - 在新窗口中打开一个前端项目
   - 右键点击文件夹，选择"更新文件夹圈复杂度"
   - 查看"代码圈复杂度"视图

4. **查看日志**:
   - 在调试窗口中打开开发者工具
   - 查看控制台输出

## 故障排除

如果仍然无法调试，请检查:

1. VSCode版本是否支持 (需要1.74.0+)
2. Node.js版本是否兼容
3. 项目路径是否包含特殊字符
4. 是否有权限问题

## 手动测试

如果调试不工作，可以手动测试:

1. 编译项目: `npm run compile`
2. 打包插件: `vsce package`
3. 安装插件: `code --install-extension vscode-cyclomatic-complexity-0.1.0.vsix`
