'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';

interface AvatarUploadProps {
  currentAvatarUrl: string | null;
  userId: string;
  onUploadComplete: (url: string) => void;
}

export default function AvatarUpload({
  currentAvatarUrl,
  userId,
  onUploadComplete,
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const supabase = createClient();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      // Delete old avatar if exists
      if (currentAvatarUrl) {
        try {
          const urlParts = currentAvatarUrl.split('/');
          const bucketIndex = urlParts.findIndex((part) => part === 'avatars');
          if (bucketIndex !== -1) {
            const oldPath = urlParts.slice(bucketIndex + 1).join('/');
            await supabase.storage.from('avatars').remove([oldPath]);
          }
        } catch (error) {
          console.error('Error deleting old avatar:', error);
        }
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath);

      onUploadComplete(publicUrl);
      setPreview(null);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Error uploading avatar. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const avatarUrl = preview || currentAvatarUrl;

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        {avatarUrl ? (
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700">
            <Image
              src={avatarUrl}
              alt="Avatar"
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-4 border-gray-200 dark:border-gray-700">
            <span className="text-2xl font-semibold text-gray-500 dark:text-gray-400">
              ?
            </span>
          </div>
        )}
        {preview && (
          <button
            onClick={() => setPreview(null)}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div>
        <label
          htmlFor="avatar-upload"
          className={`inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer ${
            uploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Upload className="w-4 h-4" />
          {uploading ? 'Uploading...' : 'Upload Avatar'}
        </label>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            handleFileSelect(e);
            handleUpload(e);
          }}
          disabled={uploading}
        />
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          JPG, PNG or GIF. Max size 5MB.
        </p>
      </div>
    </div>
  );
}

