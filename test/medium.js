// 用户验证函数 - 中等复杂度 (复杂度: 8)
function validateUser(user) {
  if (!user) {
    return { valid: false, error: 'User is required' };
  }

  if (!user.email) {
    return { valid: false, error: 'Email is required' };
  }

  if (!user.email.includes('@')) {
    return { valid: false, error: 'Invalid email format' };
  }

  if (!user.password) {
    return { valid: false, error: 'Password is required' };
  }

  if (user.password.length < 8) {
    return { valid: false, error: 'Password too short' };
  }

  if (user.age && user.age < 18) {
    return { valid: false, error: 'Must be 18 or older' };
  }

  return { valid: true };
}

// 数据处理函数 - 中等复杂度 (复杂度: 7)
function processData(data, options = {}) {
  const result = [];

  for (let i = 0; i < data.length; i++) {
    const item = data[i];

    if (options.filter && !options.filter(item)) {
      continue;
    }

    if (options.transform) {
      const transformed = options.transform(item);
      result.push(transformed);
    } else {
      result.push(item);
    }

    if (options.maxItems && result.length >= options.maxItems) {
      break;
    }
  }

  return result;
}
