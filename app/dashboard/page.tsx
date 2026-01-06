'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { DollarSign, CheckSquare, Gamepad2, Film, TrendingUp, Calendar, Tv, User } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Image from 'next/image';
import type { Database } from '@/types/supabase';

type Expense = Database['public']['Tables']['expenses']['Row'];
type Todo = Database['public']['Tables']['todos']['Row'];
type Entertainment = Database['public']['Tables']['entertainment']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

const COLORS = {
  Food: '#8B5CF6',
  Transport: '#EC4899',
  Shopping: '#F59E0B',
  Bills: '#10B981',
  Entertainment: '#3B82F6',
  Other: '#6B7280',
};

export default function DashboardPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [games, setGames] = useState<Entertainment[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // Get user profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    setProfile(profileData);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get expenses for this month
    const { data: expensesData } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startOfMonth.toISOString().split('T')[0])
      .order('date', { ascending: true });

    // Get pending todos
    const { data: todosData } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
      .eq('completed', false)
      .order('due_date', { ascending: true })
      .limit(5);

    // Get current games/entertainment
    const { data: gamesData } = await supabase
      .from('entertainment')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['playing', 'watching'])
      .order('created_at', { ascending: false });

    setExpenses(expensesData || []);
    setTodos(todosData || []);
    setGames(gamesData || []);
    setLoading(false);
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  // Calculate stats
  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const pendingTodos = todos.length;
  const activeGames = games.length;

  // Prepare expense data by category for pie chart
  const expensesByCategory = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value: Number(value.toFixed(2)),
  }));

  // Prepare daily expense trend for last 7 days
  const last7Days = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
  const dailyExpenses = expenses
    .filter(exp => new Date(exp.date) >= last7Days)
    .reduce((acc, exp) => {
      const date = new Date(exp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      acc[date] = (acc[date] || 0) + Number(exp.amount);
      return acc;
    }, {} as Record<string, number>);

  const trendData = Object.entries(dailyExpenses).map(([date, amount]) => ({
    date,
    amount: Number(amount.toFixed(2)),
  }));

  return (
    <div className="space-y-6">
      {/* Header with Profile */}
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            Overview
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Your personal dashboard at a glance
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-2xl p-4 border border-indigo-100 dark:border-indigo-900/30 flex items-center gap-3 min-w-[280px]">
          {profile?.avatar_url ? (
            <div className="relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-indigo-400/50">
              <Image
                src={profile.avatar_url}
                alt="Profile"
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center ring-2 ring-indigo-400/50">
              <span className="text-xl font-bold text-white">
                {profile?.username?.charAt(0).toUpperCase() || <User className="w-6 h-6 text-white" />}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {profile?.username || 'User'}
            </p>
            <p className="text-xs text-indigo-600 dark:text-indigo-400">
              Welcome back! 👋
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Expenses */}
        <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 rounded-2xl p-6 border border-violet-100 dark:border-violet-900/30">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-violet-500/10 rounded-xl">
              <DollarSign className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            </div>
            <span className="text-xs font-medium text-violet-600 dark:text-violet-400 bg-violet-500/10 px-2 py-1 rounded-full">
              This Month
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Expenses</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            ${totalExpenses.toFixed(2)}
          </p>
        </div>

        {/* Pending Todos */}
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-900/30">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl">
              <CheckSquare className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
              Active
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending Tasks</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {pendingTodos}
          </p>
        </div>

        {/* Active Entertainment */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-900/30">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <Gamepad2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">
              In Progress
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Playing/Watching</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {activeGames}
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Expense Trend Chart */}
        {trendData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Expense Trend
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#8B5CF6" 
                  strokeWidth={3}
                  dot={{ fill: '#8B5CF6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Expense by Category Chart */}
        {categoryData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-6">
              <DollarSign className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                By Category
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                />
                <Bar dataKey="value" fill="#8B5CF6" radius={[8, 8, 0, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.Other} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Bottom Section - Todos and Games */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upcoming Todos */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Upcoming Tasks
              </h2>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Next 5</span>
          </div>
          <div className="space-y-3">
            {todos.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8 text-sm">
                No pending tasks. You're all caught up! 🎉
              </p>
            ) : (
              todos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {todo.title}
                    </p>
                    {todo.due_date && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Due: {new Date(todo.due_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Currently Playing/Watching */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                In Progress
              </h2>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Entertainment</span>
          </div>
          <div className="space-y-3">
            {games.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8 text-sm">
                Start playing or watching something!
              </p>
            ) : (
              games.map((game) => (
                <div
                  key={game.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 border border-violet-100 dark:border-violet-900/30"
                >
                  <div className="p-2 bg-violet-500/10 rounded-lg">
                    {game.type === 'game' ? (
                      <Gamepad2 className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    ) : game.type === 'movie' ? (
                      <Film className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    ) : (
                      <Tv className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {game.title}
                    </p>
                    <p className="text-xs text-violet-600 dark:text-violet-400 capitalize">
                      {game.type} • {game.status}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

