# VSCode 圈复杂度插件

> **多语言版本 / Multilingual Versions**: [English](README.en.md) | [日本語](README.ja.md) | [Русский](README.ru.md) | [한국어](README.ko.md)

一个VSCode插件，用于在资源管理器中直观显示前端代码文件的圈复杂度。支持JavaScript、TypeScript、Vue、HTML、CSS等多种文件类型。

![vscode-react-complexity](https://raw.githubusercontent.com/moshuying/vscode-cyclomatic-complexity/main/screenshot/PixPin_2025-09-03_21-32-55.png)

## ✨ 主要功能

- **📁 资源管理器集成**: 在文件和文件夹旁显示圈复杂度，颜色编码（绿色≤5，黄色≤10，红色>10）
- **⚡ 自动分析**: 启动时自动分析整个项目
- **📊 专用视图**: 独立的圈复杂度分析面板，支持排序和快速打开文件
- **🚫 智能过滤**: 自动读取`.gitignore`，可配置排除文件夹


## 🎮 使用方法

### VSCode插件

1. **自动启动**: 打开前端项目后自动分析圈复杂度
2. **查看结果**: 在资源管理器中查看文件旁的复杂度数字
3. **面板**: 点击左侧活动栏的图表图标查看详细分析
4. **手动更新**: 右键文件夹选择"递归更新文件夹圈复杂度"

### 配置

在VSCode设置中搜索"Code Cyclomatic Complexity"自定义排除文件夹列表。

## 📐 支持的文件类型

- **JavaScript/TypeScript**: `.js`, `.ts`, `.jsx`, `.tsx`
- **Vue**: `.vue`  
- **HTML**: `.html`, `.htm`
- **CSS/预处理器**: `.css`, `.scss`, `.sass`, `.less`, `.styl`

### 复杂度计算规则

基础复杂度为1，以下结构会增加复杂度：

- **条件语句**: `if`, `for`, `while`, `case`, `catch`
- **逻辑运算符**: `&&`, `||`, `? :`
- **Vue指令**: `v-if`, `v-for`, `v-show`
- **CSS选择器**: 伪类、媒体查询、嵌套等


## 🛠️ 开发

```bash
npm install                       # 安装依赖
npm run compile                   # 编译项目
npm run watch                     # 监听变化并编译
```

## 📜 许可证

MIT