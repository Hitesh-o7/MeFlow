'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Trash2, Gamepad2, Film, Tv } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Database } from '@/types/supabase';

type Entertainment = Database['public']['Tables']['entertainment']['Row'];

const entertainmentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: z.enum(['game', 'movie', 'series']),
  status: z.enum(['backlog', 'playing', 'watching', 'completed', 'watched']),
});

type EntertainmentForm = z.infer<typeof entertainmentSchema>;

const types = [
  { value: 'game', label: 'Game', icon: Gamepad2 },
  { value: 'movie', label: 'Movie', icon: Film },
  { value: 'series', label: 'Series', icon: Tv },
];

const statusOptions = {
  game: [
    { value: 'backlog', label: 'Backlog' },
    { value: 'playing', label: 'Playing' },
    { value: 'completed', label: 'Completed' },
  ],
  movie: [
    { value: 'backlog', label: 'Watchlist' },
    { value: 'watching', label: 'Watching' },
    { value: 'watched', label: 'Watched' },
  ],
  series: [
    { value: 'backlog', label: 'Watchlist' },
    { value: 'watching', label: 'Watching' },
    { value: 'watched', label: 'Watched' },
  ],
};

export default function EntertainmentPage() {
  const [entertainment, setEntertainment] = useState<Entertainment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState<'game' | 'movie' | 'series'>('game');
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EntertainmentForm>({
    resolver: zodResolver(entertainmentSchema),
    defaultValues: {
      type: 'game',
      status: 'backlog',
    },
  });

  const watchedType = watch('type');

  useEffect(() => {
    loadEntertainment();
  }, []);

  useEffect(() => {
    setValue('status', 'backlog');
  }, [watchedType, setValue]);

  const loadEntertainment = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from('entertainment')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setEntertainment(data || []);
    setLoading(false);
  };

  const onSubmit = async (data: EntertainmentForm) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase.from('entertainment').insert({
      user_id: user.id,
      title: data.title,
      type: data.type,
      status: data.status,
    });

    if (!error) {
      reset();
      setShowForm(false);
      loadEntertainment();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    const { error } = await supabase.from('entertainment').delete().eq('id', id);
    if (!error) {
      loadEntertainment();
    }
  };

  const handleStatusChange = async (item: Entertainment, newStatus: Entertainment['status']) => {
    const { error } = await supabase
      .from('entertainment')
      .update({ status: newStatus })
      .eq('id', item.id);

    if (!error) {
      loadEntertainment();
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const games = entertainment.filter((e) => e.type === 'game');
  const movies = entertainment.filter((e) => e.type === 'movie');
  const series = entertainment.filter((e) => e.type === 'series');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Entertainment
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your games, movies, and series
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          {showForm ? 'Cancel' : 'Add Item'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Add New Item
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type
              </label>
              <select
                {...register('type')}
                onChange={(e) => {
                  setSelectedType(e.target.value as 'game' | 'movie' | 'series');
                  setValue('status', 'backlog');
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {types.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                {...register('title')}
                type="text"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {statusOptions[watchedType || 'game'].map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Add Item
            </button>
          </form>
        </div>
      )}

      <div className="space-y-8">
        {/* Games */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Gamepad2 className="w-6 h-6" />
            Games
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['backlog', 'playing', 'completed'].map((status) => (
              <div
                key={status}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 capitalize">
                  {status === 'backlog' ? 'Backlog' : status === 'playing' ? 'Playing' : 'Completed'}
                </h3>
                <div className="space-y-2">
                  {games.filter((g) => g.status === status).length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      No games
                    </p>
                  ) : (
                    games
                      .filter((g) => g.status === status)
                      .map((game) => (
                        <div
                          key={game.id}
                          className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 flex items-center justify-between"
                        >
                          <span className="text-sm text-gray-900 dark:text-white">{game.title}</span>
                          <div className="flex items-center gap-2">
                            {status !== 'completed' && (
                              <button
                                onClick={() =>
                                  handleStatusChange(
                                    game,
                                    status === 'backlog' ? 'playing' : 'completed'
                                  )
                                }
                                className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded"
                              >
                                {status === 'backlog' ? 'Start' : 'Complete'}
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(game.id)}
                              className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Movies & Series */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Film className="w-6 h-6" />
            Movies & Series
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['backlog', 'watching', 'watched'].map((status) => (
              <div
                key={status}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 capitalize">
                  {status === 'backlog' ? 'Watchlist' : status === 'watching' ? 'Watching' : 'Watched'}
                </h3>
                <div className="space-y-2">
                  {[...movies, ...series].filter((m) => m.status === status).length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      No items
                    </p>
                  ) : (
                    [...movies, ...series]
                      .filter((m) => m.status === status)
                      .map((item) => (
                        <div
                          key={item.id}
                          className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 flex items-center justify-between"
                        >
                          <div>
                            <span className="text-sm text-gray-900 dark:text-white block">
                              {item.title}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                              {item.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {status !== 'watched' && (
                              <button
                                onClick={() =>
                                  handleStatusChange(
                                    item,
                                    status === 'backlog' ? 'watching' : 'watched'
                                  )
                                }
                                className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded"
                              >
                                {status === 'backlog' ? 'Start' : 'Mark Watched'}
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

