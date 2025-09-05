// 简单函数 - 低复杂度 (复杂度: 2)
function addNumbers(a, b) {
  if (a < 0) {
    return 0;
  }
  return a + b;
}

// 计算器函数 - 低复杂度 (复杂度: 4)
function calculator(operation, a, b) {
  switch (operation) {
    case 'add':
      return a + b;
    case 'subtract':
      return a - b;
    case 'multiply':
      return a * b;
    default:
      return 0;
  }
}

const greet = (name) => name ? `Hello, ${name}!` : 'Hello, World!';
