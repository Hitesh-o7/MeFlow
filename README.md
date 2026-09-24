# MeFlow - Life Management Dashboard

A robust life management dashboard built with Next.js 14+, TypeScript, and Supabase.

## Features

- 🔐 Secure authentication with Supabase
- 📊 Analytics dashboard with real-time data
- 💰 Expense tracking with categories and filters
- ✅ Todo list management with due dates
- 📋 Project management with Kanban board (Idea → In Progress → Done)
- 🎮 Entertainment tracking (Games: Backlog/Playing/Completed, Movies/Series: Watchlist/Watching/Watched)
- 👤 User profile with avatar upload
- ⚙️ Settings management

## Tech Stack

- **Runtime**: Bun
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (Strict mode)
- **Styling**: Tailwind CSS + Lucide React (Icons)
- **Backend**: Supabase (Auth, Postgres DB, Storage)
- **Validation**: Zod + React Hook Form

## Quick Start

See [SETUP.md](./SETUP.md) for detailed setup instructions.

### Quick Setup

1. **Install dependencies:**
```bash
bun install
```

2. **Set up environment variables:**
Copy `.env.example` to `.env.local` (`cp .env.example .env.local`) and fill in your values:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. **Run database migrations:**
   - Open Supabase SQL Editor
   - Copy and paste contents of `database/schema.sql`
   - Execute the script

4. **Start development server:**
```bash
bun run dev
```

## Project Structure

```
MeFlow/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard pages
│   ├── login/             # Authentication pages
│   ├── signup/
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── AvatarUpload.tsx   # Reusable avatar upload component
│   └── dashboard/         # Dashboard-specific components
├── database/              # Database schema
│   └── schema.sql        # Complete SQL schema with RLS
├── lib/                   # Utility functions
│   └── supabase/         # Supabase client setup
├── middleware.ts         # Authentication middleware
└── types/                # TypeScript type definitions
```

## Security Features

- ✅ Row Level Security (RLS) on all database tables
- ✅ Middleware-based authentication checks
- ✅ Secure file uploads to Supabase Storage
- ✅ User data isolation (users can only access their own data)

## Database Schema

The application uses the following tables:
- `profiles` - User profile information
- `expenses` - Expense tracking
- `todos` - Todo list items
- `projects` - Project management
- `entertainment` - Games, movies, and series tracking

All tables have RLS policies ensuring users can only access their own data.

## Development

```bash
# Development server
bun run dev

# Build for production
bun run build

# Start production server
bun run start

# Lint code
bun run lint
```

## License

MIT
