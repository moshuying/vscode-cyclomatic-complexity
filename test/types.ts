// TypeScript 类型和接口示例 - 中等复杂度
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  preferences?: UserPreferences;
}

interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  notifications: boolean;
}

// 通用工具类 - 中等复杂度 (复杂度: 9)
class DataProcessor<T> {
  private data: T[] = [];

  add(item: T): void {
    this.data.push(item);
  }

  filter(predicate: (item: T) => boolean): T[] {
    const result: T[] = [];

    for (const item of this.data) {
      if (predicate(item)) {
        result.push(item);
      }
    }

    return result;
  }

  transform<U>(transformer: (item: T) => U): U[] {
    const result: U[] = [];

    for (const item of this.data) {
      try {
        const transformed = transformer(item);
        result.push(transformed);
      } catch (error) {
        console.error('Transform error:', error);
      }
    }

    return result;
  }

  validate(validator: (item: T) => boolean): boolean {
    for (const item of this.data) {
      if (!validator(item)) {
        return false;
      }
    }

    return this.data.length > 0;
  }
}

// 用户服务 - 高复杂度 (复杂度: 12)
export class UserService {
  private users: User[] = [];

  async createUser(userData: Omit<User, 'id'>): Promise<User | null> {
    try {
      if (!userData.name || !userData.email) {
        throw new Error('Name and email are required');
      }

      if (!this.isValidEmail(userData.email)) {
        throw new Error('Invalid email format');
      }

      const existingUser = this.users.find(u => u.email === userData.email);
      if (existingUser) {
        throw new Error('User already exists');
      }

      const newUser: User = {
        ...userData,
        id: this.generateId()
      };

      this.users.push(newUser);
      return newUser;

    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  private isValidEmail(email: string): boolean {
    return email.includes('@') && email.includes('.');
  }

  private generateId(): number {
    return this.users.length > 0
      ? Math.max(...this.users.map(u => u.id)) + 1
      : 1;
  }
}
