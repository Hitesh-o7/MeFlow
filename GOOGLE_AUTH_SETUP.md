# Google OAuth Setup Guide

## What's Been Implemented

✅ Google "Continue with Google" button on Login page  
✅ Google "Continue with Google" button on Signup page  
✅ Automatic profile picture import from Google  
✅ Username extracted from Google account  
✅ Profile picture upload feature in Settings (already existed)  

## How to Enable Google OAuth in Supabase

### Step 1: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing one)
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Select **Web application**
6. Add these **Authorized redirect URIs**:
   ```
   https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback
   ```
   Replace `YOUR_SUPABASE_PROJECT_REF` with your actual project reference from Supabase

7. Copy the **Client ID** and **Client Secret**

### Step 2: Configure Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Google** and click to expand
4. Enable the toggle
5. Paste your **Client ID** and **Client Secret**
6. Click **Save**

### Step 3: Update Database

Run the updated trigger function in your Supabase SQL Editor:

```sql
-- This is already in database/schema.sql
-- Run this to update the existing function:

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id, 
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## How It Works

### Login/Signup Flow

1. User clicks **"Continue with Google"** button
2. Redirects to Google OAuth consent screen
3. After approval, redirects back to `/dashboard`
4. Trigger automatically creates profile with:
   - ✅ Username (from Google full name or email)
   - ✅ Avatar URL (Google profile picture)

### Profile Picture Priority

The app will show profile pictures in this order:
1. **Custom uploaded picture** (if user uploaded one in Settings)
2. **Google profile picture** (if signed up with Google)
3. **First letter of username** (fallback circle with gradient)

### Upload Custom Picture

Users can upload a custom profile picture anytime:
1. Go to **Dashboard** → **Settings**
2. Find **Profile Picture** section
3. Click **Upload Avatar**
4. Select image (JPG, PNG, GIF, max 5MB)
5. Picture is stored in Supabase Storage bucket `avatars`

## Features Added

### Login Page (`/login`)
- ✅ Google OAuth button with logo
- ✅ Email/password login (existing)
- ✅ Clean divider between methods
- ✅ Loading states

### Signup Page (`/signup`)
- ✅ Google OAuth button with logo
- ✅ Email/password signup (existing)
- ✅ Clean divider between methods
- ✅ Loading states

### Dashboard (`/dashboard`)
- ✅ Profile card showing user avatar
- ✅ Username display
- ✅ "Welcome back!" greeting
- ✅ Gradient styling

### Settings Page (`/dashboard/settings`)
- ✅ Avatar upload component (already existed)
- ✅ Username editor
- ✅ Profile management

## Testing

1. Make sure Google OAuth is configured in Supabase
2. Visit `http://localhost:3002/login`
3. Click **"Continue with Google"**
4. Sign in with your Google account
5. Should redirect to dashboard with your:
   - ✅ Google profile picture
   - ✅ Name as username
   - ✅ All data synced

## Troubleshooting

**Issue: "Invalid redirect URI"**
- Check that redirect URI in Google Console matches exactly with Supabase

**Issue: Profile picture not showing**
- Check Supabase **Storage** → **avatars** bucket exists
- Verify RLS policies are set (they're in schema.sql)

**Issue: Google button does nothing**
- Check browser console for errors
- Verify Google OAuth is enabled in Supabase
- Check Client ID and Secret are correct

## Security Notes

✅ OAuth tokens handled securely by Supabase  
✅ Profile pictures stored in Supabase Storage  
✅ Row Level Security (RLS) enabled on all tables  
✅ Users can only access their own data  
✅ Avatar uploads restricted to user's own folder  

---

**Need help?** Check the Supabase docs: https://supabase.com/docs/guides/auth/social-login/auth-google


