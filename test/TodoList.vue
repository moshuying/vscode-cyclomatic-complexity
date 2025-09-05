<template>
  <div class="todo-list">
    <h2>待办事项列表</h2>
    
    <!-- 添加新任务表单 -->
    <form @submit.prevent="addTodo" class="add-form">
      <input
        v-model="newTodo"
        type="text"
        placeholder="输入新任务..."
        :disabled="isLoading"
        required
      />
      <select v-model="newPriority">
        <option value="low">低优先级</option>
        <option value="medium">中优先级</option>
        <option value="high">高优先级</option>
      </select>
      <button type="submit" :disabled="isLoading || !newTodo.trim()">
        {{ isLoading ? '添加中...' : '添加任务' }}
      </button>
    </form>

    <!-- 过滤器 -->
    <div class="filters">
      <button
        v-for="filter in filters"
        :key="filter.value"
        @click="currentFilter = filter.value"
        :class="{ active: currentFilter === filter.value }"
      >
        {{ filter.label }}
      </button>
    </div>

    <!-- 任务列表 -->
    <div v-if="filteredTodos.length === 0" class="empty-state">
      {{ currentFilter === 'all' ? '暂无任务' : '没有符合条件的任务' }}
    </div>
    
    <transition-group name="todo" tag="ul" class="todo-items" v-else>
      <li
        v-for="todo in filteredTodos"
        :key="todo.id"
        :class="[
          'todo-item',
          { completed: todo.completed },
          `priority-${todo.priority}`
        ]"
      >
        <input
          type="checkbox"
          v-model="todo.completed"
          @change="updateTodo(todo)"
        />
        
        <span
          v-if="!todo.editing"
          @dblclick="startEdit(todo)"
          class="todo-text"
        >
          {{ todo.text }}
        </span>
        
        <input
          v-else
          v-model="todo.text"
          @blur="finishEdit(todo)"
          @keyup.enter="finishEdit(todo)"
          @keyup.esc="cancelEdit(todo)"
          ref="editInput"
          class="edit-input"
        />
        
        <div class="todo-actions">
          <button @click="startEdit(todo)" v-if="!todo.editing">
            编辑
          </button>
          <button @click="deleteTodo(todo.id)" class="delete-btn">
            删除
          </button>
        </div>
      </li>
    </transition-group>

    <!-- 统计信息 -->
    <div class="stats" v-if="todos.length > 0">
      <p>
        总计: {{ todos.length }} 个任务 |
        已完成: {{ completedCount }} 个 |
        待完成: {{ remainingCount }} 个
      </p>
      <button
        v-if="completedCount > 0"
        @click="clearCompleted"
        class="clear-btn"
      >
        清除已完成
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TodoList',
  
  data() {
    return {
      todos: [],
      newTodo: '',
      newPriority: 'medium',
      currentFilter: 'all',
      isLoading: false,
      editingTodo: null,
      originalText: '',
      filters: [
        { value: 'all', label: '全部' },
        { value: 'active', label: '未完成' },
        { value: 'completed', label: '已完成' },
        { value: 'high', label: '高优先级' }
      ]
    };
  },

  computed: {
    // 过滤后的任务列表 - 中等复杂度 (复杂度: 7)
    filteredTodos() {
      switch (this.currentFilter) {
        case 'active':
          return this.todos.filter(todo => !todo.completed);
        case 'completed':
          return this.todos.filter(todo => todo.completed);
        case 'high':
          return this.todos.filter(todo => todo.priority === 'high');
        default:
          return this.todos;
      }
    },

    completedCount() {
      return this.todos.filter(todo => todo.completed).length;
    },

    remainingCount() {
      return this.todos.length - this.completedCount;
    }
  },

  methods: {
    // 添加新任务 - 中等复杂度 (复杂度: 5)
    async addTodo() {
      if (!this.newTodo.trim()) return;
      
      this.isLoading = true;
      
      try {
        const todo = {
          id: Date.now(),
          text: this.newTodo.trim(),
          completed: false,
          priority: this.newPriority,
          createdAt: new Date(),
          editing: false
        };

        // 模拟API调用
        await this.delay(500);
        
        this.todos.push(todo);
        this.newTodo = '';
        this.newPriority = 'medium';
        
        this.$emit('todo-added', todo);
        
      } catch (error) {
        console.error('Error adding todo:', error);
        this.$emit('error', '添加任务失败');
      } finally {
        this.isLoading = false;
      }
    },

    // 更新任务 - 低复杂度 (复杂度: 3)
    async updateTodo(todo) {
      try {
        await this.delay(200);
        this.$emit('todo-updated', todo);
      } catch (error) {
        console.error('Error updating todo:', error);
        todo.completed = !todo.completed; // 回滚
      }
    },

    // 删除任务 - 低复杂度 (复杂度: 4)
    async deleteTodo(id) {
      if (!confirm('确定要删除这个任务吗？')) {
        return;
      }
      
      try {
        await this.delay(200);
        const index = this.todos.findIndex(todo => todo.id === id);
        if (index > -1) {
          const deletedTodo = this.todos.splice(index, 1)[0];
          this.$emit('todo-deleted', deletedTodo);
        }
      } catch (error) {
        console.error('Error deleting todo:', error);
      }
    },

    // 开始编辑 - 低复杂度 (复杂度: 2)
    startEdit(todo) {
      this.editingTodo = todo;
      this.originalText = todo.text;
      todo.editing = true;
      
      this.$nextTick(() => {
        const input = this.$refs.editInput?.[0];
        if (input) {
          input.focus();
          input.select();
        }
      });
    },

    // 完成编辑 - 中等复杂度 (复杂度: 5)
    async finishEdit(todo) {
      if (!todo.text.trim()) {
        this.cancelEdit(todo);
        return;
      }
      
      try {
        await this.delay(200);
        todo.editing = false;
        this.editingTodo = null;
        this.$emit('todo-updated', todo);
      } catch (error) {
        console.error('Error updating todo:', error);
        todo.text = this.originalText;
        this.cancelEdit(todo);
      }
    },

    // 取消编辑 - 低复杂度 (复杂度: 2)
    cancelEdit(todo) {
      todo.text = this.originalText;
      todo.editing = false;
      this.editingTodo = null;
    },

    // 清除已完成任务 - 低复杂度 (复杂度: 3)
    async clearCompleted() {
      if (!confirm('确定要清除所有已完成的任务吗？')) {
        return;
      }
      
      try {
        await this.delay(300);
        const completedTodos = this.todos.filter(todo => todo.completed);
        this.todos = this.todos.filter(todo => !todo.completed);
        this.$emit('todos-cleared', completedTodos);
      } catch (error) {
        console.error('Error clearing todos:', error);
      }
    },

    // 工具方法
    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  },

  mounted() {
    // 组件挂载时加载数据
    this.loadTodos();
  },

  // 生命周期钩子 - 低复杂度 (复杂度: 2)
  async loadTodos() {
    try {
      // 模拟从API加载数据
      await this.delay(1000);
      
      // 示例数据
      this.todos = [
        {
          id: 1,
          text: '学习Vue.js',
          completed: true,
          priority: 'high',
          createdAt: new Date('2024-01-01'),
          editing: false
        },
        {
          id: 2,
          text: '完成项目文档',
          completed: false,
          priority: 'medium',
          createdAt: new Date('2024-01-02'),
          editing: false
        }
      ];
    } catch (error) {
      console.error('Error loading todos:', error);
    }
  }
};
</script>

<style scoped>
.todo-list {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.add-form {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.filters button.active {
  background-color: #007bff;
  color: white;
}

.todo-items {
  list-style: none;
  padding: 0;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: 1px solid #ddd;
  margin-bottom: 5px;
  border-radius: 4px;
}

.todo-item.completed {
  opacity: 0.6;
}

.priority-high {
  border-left: 4px solid #ff4757;
}

.priority-medium {
  border-left: 4px solid #ffa502;
}

.priority-low {
  border-left: 4px solid #2ed573;
}

.todo-enter-active, .todo-leave-active {
  transition: all 0.3s;
}

.todo-enter-from, .todo-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
