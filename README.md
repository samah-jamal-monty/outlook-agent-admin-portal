# Outlook Config

A React application for managing Outlook integration configurations with Supabase backend.

## Features

- **Authentication**: Secure login using Supabase Auth
- **Configuration Management**: CRUD operations for project configurations
- **Events Viewer**: View events with Jira ticket information

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Create a `.env` file in the project root:

```bash
cp .env.example .env
```

2. Add your Supabase credentials:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup

Create the following tables in your Supabase database:

```sql
-- Config table
CREATE TABLE public.config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  support_email TEXT NOT NULL,
  assignee_id TEXT NOT NULL,
  assignee_name TEXT NOT NULL,
  project_id TEXT NOT NULL,
  project_key TEXT NOT NULL
);

-- Event table
CREATE TABLE public.event (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id TEXT NOT NULL,
  jira_ticket TEXT NOT NULL,
  jira_ticket_url TEXT,
  jira_status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust as needed for your security requirements)
CREATE POLICY "Allow authenticated users to read config" ON public.config
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert config" ON public.config
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update config" ON public.config
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to delete config" ON public.config
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read events" ON public.event
  FOR SELECT TO authenticated USING (true);
```

### 4. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/
│   ├── Layout.tsx         # Main layout with navigation
│   └── ProtectedRoute.tsx # Auth guard component
├── context/
│   └── AuthContext.tsx    # Authentication state management
├── lib/
│   └── supabase.ts        # Supabase client configuration
├── pages/
│   ├── Login.tsx          # Login page
│   ├── Configuration.tsx  # Config CRUD page
│   └── Events.tsx         # Events viewer page
├── App.tsx                # Main app with routing
├── main.tsx               # Entry point
└── index.css              # Tailwind CSS imports
```

## Technologies

- React 18 with TypeScript
- Vite
- Tailwind CSS
- Supabase (Auth & Database)
- React Router DOM
