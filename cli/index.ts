#!/usr/bin/env node

import { ComplexityAnalyzer } from '../src/complexityAnalyzer';
import * as path from 'path';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('用法: node index.js <文件夹路径>');
    process.exit(1);
  }

  const folderPath = path.resolve(args[0]);
  
  try {
    const analyzer = new ComplexityAnalyzer();
    const result = await analyzer.analyzeFolder(folderPath);
    
    // 输出JSON格式的结果
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('分析失败:', error);
    process.exit(1);
  }
}

main().catch(console.error);
