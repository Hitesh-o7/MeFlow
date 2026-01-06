# MeFlow Setup Guide

## Prerequisites

- Bun runtime installed
- Supabase account and project

## Step 1: Install Dependencies

```bash
cd MeFlow
bun install
```

## Step 2: Set Up Supabase

1. Create a new Supabase project at https://supabase.com
2. Go to Project Settings > API
3. Copy your Project URL and anon/public key

## Step 3: Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 4: Set Up Database

1. Open your Supabase project
2. Go to SQL Editor
3. Copy and paste the entire contents of `database/schema.sql`
4. Run the SQL script

This will create:
- All necessary tables (profiles, expenses, todos, projects, entertainment)
- Row Level Security (RLS) policies
- Storage bucket for avatars
- Triggers for automatic profile creation

## Step 5: Run the Application

```bash
bun run dev
```

The application will be available at http://localhost:3000

## Step 6: Create Your First Account

1. Navigate to http://localhost:3000
2. Click "Sign Up"
3. Create an account with email and password
4. You'll be automatically redirected to the dashboard

## Features

- **Dashboard**: Overview with analytics (expenses, todos, entertainment)
- **Expenses**: Track and categorize your spending
- **Todos**: Manage tasks with due dates
- **Projects**: Kanban board for project management
- **Entertainment**: Track games, movies, and series
- **Profile**: View your profile information
- **Settings**: Update username and upload avatar

## Security

All tables have Row Level Security (RLS) enabled. Users can only access their own data. The middleware ensures proper authentication and redirects.

## Troubleshooting

### Database Connection Issues
- Verify your Supabase URL and keys in `.env.local`
- Ensure the SQL schema has been run successfully

### Avatar Upload Issues
- Check that the `avatars` storage bucket exists
- Verify storage policies are set correctly in the SQL schema

### Authentication Issues
- Clear browser cookies and try again
- Verify Supabase Auth is enabled in your project settings

