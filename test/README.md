# 测试文件说明

这个目录包含了用于演示VSCode圈复杂度插件功能的各种示例文件。这些文件展示了插件对不同文件类型和复杂度级别的支持。

## 📁 文件类型覆盖

### JavaScript/TypeScript 文件
- **simple.js** - 简单JavaScript函数 (低复杂度 ≤5)
- **medium.js** - 中等复杂度JavaScript函数 (6-10)
- **complex.js** - 高复杂度状态机实现 (>10)
- **types.ts** - TypeScript类和接口示例 (中高复杂度)

### React 组件
- **Button.jsx** - React功能组件示例 (低-中等复杂度)
- **DataTable.tsx** - 复杂的TypeScript React组件 (高复杂度)

### Vue 组件
- **TodoList.vue** - 完整的Vue组件 (高复杂度)
  - 包含模板指令、计算属性、方法、生命周期钩子

### HTML 文件
- **interactive.html** - 交互式表单页面 (高复杂度)
  - 包含大量JavaScript交互逻辑、表单验证、模态框

### CSS/预处理器文件
- **styles.css** - CSS样式表 (中等复杂度)
  - 复杂选择器、媒体查询、伪类、动画
- **components.scss** - SCSS组件库 (高复杂度)
  - 混入、函数、循环、条件、变量
- **theme.less** - Less主题文件 (高复杂度)
  - Less特有语法、复杂组件样式
- **layout.styl** - Stylus布局文件 (高复杂度)
  - Stylus独特语法、响应式设计

## 🎯 复杂度级别示例

### 🟢 低复杂度 (≤5) - 绿色显示
- `simple.js` 中的基础函数
- `Button.jsx` 中的简单组件

### 🟡 中等复杂度 (6-10) - 黄色显示
- `medium.js` 中的验证函数
- `types.ts` 中的类方法
- `styles.css` 中的复杂选择器

### 🔴 高复杂度 (>10) - 红色显示
- `complex.js` 中的状态机
- `DataTable.tsx` 中的数据表格组件
- `TodoList.vue` 中的完整Vue组件
- `interactive.html` 中的表单验证逻辑
- 所有预处理器文件 (SCSS/Less/Stylus)

## 🧪 测试插件功能

使用这些文件可以测试插件的以下功能：

1. **文件类型支持** - 验证插件是否正确识别所有支持的文件类型
2. **复杂度计算** - 检查不同复杂度级别的计算准确性
3. **颜色编码** - 确认文件在资源管理器中显示正确的颜色
4. **性能测试** - 使用大型文件测试分析性能
5. **过滤功能** - 测试.gitignore和排除设置
6. **实时更新** - 修改文件后验证复杂度更新

## 📊 预期复杂度范围

| 文件 | 类型 | 预期复杂度 | 颜色 |
|------|------|-----------|------|
| simple.js | JavaScript | 2-5 | 🟢 |
| medium.js | JavaScript | 7-9 | 🟡 |
| complex.js | JavaScript | 15+ | 🔴 |
| types.ts | TypeScript | 8-12 | 🟡/🔴 |
| Button.jsx | React | 3-8 | 🟢/🟡 |
| DataTable.tsx | React | 16+ | 🔴 |
| TodoList.vue | Vue | 12+ | 🔴 |
| interactive.html | HTML | 18+ | 🔴 |
| styles.css | CSS | 8-12 | 🟡/🔴 |
| components.scss | SCSS | 20+ | 🔴 |
| theme.less | Less | 18+ | 🔴 |
| layout.styl | Stylus | 22+ | 🔴 |

## 🎮 使用方法

1. 在VSCode中打开此项目
2. 确保圈复杂度插件已激活
3. 查看资源管理器中各文件旁的复杂度数字和颜色
4. 使用插件的专用面板查看详细分析
5. 修改文件内容观察复杂度实时变化

这些示例文件为用户提供了全面的插件功能演示，帮助理解不同代码结构对圈复杂度的影响。
