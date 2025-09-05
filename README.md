# VSCode Cyclomatic Complexity Plugin

A VSCode plugin that visualizes the cyclomatic complexity of frontend code files directly in the resource explorer. Supports JavaScript, TypeScript, Vue, HTML, CSS and many other file types.

![vscode-react-complexity](https://raw.githubusercontent.com/moshuying/vscode-cyclomatic-complexity/main/screenshot/PixPin_2025-09-03_21-32-55.png)


## ✨ Key Features

- **📁 Explorer Integration**: Display cyclomatic complexity next to files and folders with color coding (green≤5, yellow≤10, red>10)
- **⚡ Auto Analysis**: Automatically analyze the entire project on startup
- **📊 Dedicated View**: Independent cyclomatic complexity analysis panel with sorting and quick file opening
- **🚫 Smart Filtering**: Automatically reads `.gitignore`, configurable folder exclusions

## 🎮 Usage

### VSCode Plugin

1. **Auto Start**: Automatically analyze cyclomatic complexity after opening a frontend project
2. **View Results**: Check complexity numbers next to files in the explorer
3. **Panel**: Click the chart icon in the left activity bar for detailed analysis
4. **Manual Update**: Right-click on folders to select "Recursively Update Folder Complexity"

### Configuration

Search for "Code Cyclomatic Complexity" in VSCode settings to customize excluded folder lists.

## 📐 Supported File Types

- **JavaScript/TypeScript**: `.js`, `.ts`, `.jsx`, `.tsx`
- **Vue**: `.vue`  
- **HTML**: `.html`, `.htm`
- **CSS/Preprocessors**: `.css`, `.scss`, `.sass`, `.less`, `.styl`

### Complexity Calculation Rules

Base complexity is 1, the following structures increase complexity:

- **Conditional Statements**: `if`, `for`, `while`, `case`, `catch`
- **Logical Operators**: `&&`, `||`, `? :`
- **Vue Directives**: `v-if`, `v-for`, `v-show`
- **CSS Selectors**: pseudo-classes, media queries, nesting, etc.

## 🛠️ Development

```bash
npm install                       # Install dependencies
npm run compile                   # Compile project
npm run watch                     # Watch for changes and compile
```

## 📜 License

MIT

