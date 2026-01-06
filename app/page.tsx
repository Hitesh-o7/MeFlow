import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-6">
            MeFlow
          </h1>
          <p className="text-2xl text-gray-700 dark:text-gray-300 mb-4">
            Your Complete Life Management Dashboard
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            Track expenses, manage todos, organize projects, and keep up with your entertainment.
            All in one secure, beautiful dashboard.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-lg border border-indigo-200 dark:border-indigo-800"
            >
              Sign In
            </Link>
          </div>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                💰 Expense Tracking
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Track your spending with categories and filters. Get insights into your financial habits.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                ✅ Task Management
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Organize your todos with due dates and priorities. Never miss an important task.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                🎮 Entertainment Hub
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Track games, movies, and series. Manage your backlog and watchlist in one place.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

