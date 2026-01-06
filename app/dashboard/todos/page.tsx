'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Database } from '@/types/supabase';

type Todo = Database['public']['Tables']['todos']['Row'];

const todoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  due_date: z.string().optional(),
});

type TodoForm = z.infer<typeof todoSchema>;

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TodoForm>({
    resolver: zodResolver(todoSchema),
  });

  const loadTodos = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await (supabase
      .from('todos') as any)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false});

    setTodos(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const onSubmit = async (data: TodoForm) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await (supabase.from('todos') as any).insert({
      user_id: user.id,
      title: data.title,
      description: data.description || null,
      due_date: data.due_date || null,
      completed: false,
    });

    if (!error) {
      reset();
      setShowForm(false);
      loadTodos();
    }
  };

  const handleToggle = async (todo: Todo) => {
    const { error } = await (supabase
      .from('todos') as any)
      .update({ completed: !todo.completed })
      .eq('id', todo.id);

    if (!error) {
      loadTodos();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this todo?')) return;

    const { error } = await (supabase.from('todos') as any).delete().eq('id', id);
    if (!error) {
      loadTodos();
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const completedCount = todos.filter((t) => t.completed).length;
  const totalCount = todos.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Todo List
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {completedCount} of {totalCount} tasks completed
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          {showForm ? 'Cancel' : 'Add Todo'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Add New Todo
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                {...register('title')}
                type="text"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="What needs to be done?"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Add more details..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Due Date
              </label>
              <input
                {...register('due_date')}
                type="date"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Add Todo
            </button>
          </form>
        </div>
      )}

      <div className="space-y-2">
        {todos.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">
              No todos yet. Add your first task!
            </p>
          </div>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700 flex items-start gap-4 ${
                todo.completed ? 'opacity-60' : ''
              }`}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleToggle(todo)}
                className="mt-1 w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <div className="flex-1">
                <h3
                  className={`font-semibold text-gray-900 dark:text-white ${
                    todo.completed ? 'line-through' : ''
                  }`}
                >
                  {todo.title}
                </h3>
                {todo.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {todo.description}
                  </p>
                )}
                {todo.due_date && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    Due: {new Date(todo.due_date).toLocaleDateString()}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleDelete(todo.id)}
                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

