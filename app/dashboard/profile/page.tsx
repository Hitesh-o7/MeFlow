import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Image from 'next/image';

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await (supabase
    .from('profiles') as any)
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Your profile information
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-8">
          <div className="relative">
            {profile?.avatar_url ? (
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-200 dark:border-indigo-800">
                <Image
                  src={profile.avatar_url}
                  alt="Avatar"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-4 border-indigo-200 dark:border-indigo-800">
                <span className="text-4xl font-semibold text-gray-500 dark:text-gray-400">
                  {profile?.username?.charAt(0).toUpperCase() || '?'}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Username
              </label>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {profile?.username || 'Not set'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Email
              </label>
              <p className="text-lg text-gray-900 dark:text-white">
                {user.email}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Member Since
              </label>
              <p className="text-gray-900 dark:text-white">
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

