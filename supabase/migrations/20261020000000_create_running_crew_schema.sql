-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- 1. Profiles Table (Linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  crew_nickname text,
  pace_group text default '530',
  bio text,
  role text not null default 'member' check (role in ('admin', 'member', 'guest')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Index for quick lookup
create index if not exists idx_profiles_status on public.profiles(status);
create index if not exists idx_profiles_role on public.profiles(role);

-- Helper functions for RLS
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and status = 'approved'
  );
$$;

create or replace function public.is_approved()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and status = 'approved'
  );
$$;

-- 2. Trigger on auth.users for new signups
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_first_user boolean;
begin
  -- Check if this is the first user in the system
  select count(*) = 0 into is_first_user from public.profiles;

  insert into public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    crew_nickname,
    role,
    status
  ) values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', ''),
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    case when is_first_user then 'admin' else 'member' end,
    case when is_first_user then 'approved' else 'pending' end
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. Runs (정기런 / 번개런 일정 및 모집)
create table if not exists public.runs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null default 'lightning' check (type in ('regular', 'lightning', 'marathon')),
  status text not null default 'recruiting' check (status in ('recruiting', 'closed', 'completed')),
  scheduled_at timestamptz not null,
  meeting_place text not null,
  course_name text,
  distance_km numeric(5,1) not null default 5.0,
  target_pace text not null default '5:30/km',
  max_runners int not null default 15,
  content text,
  creator_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_runs_scheduled_at on public.runs(scheduled_at desc);

-- 4. Run Participants (참석자)
create table if not exists public.run_participants (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references public.runs(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  status text not null default 'joined' check (status in ('joined', 'cancelled')),
  created_at timestamptz default timezone('utc'::text, now()) not null,
  unique(run_id, user_id)
);

-- 5. Posts (게시판 글)
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'review' check (category in ('notice', 'review', 'free', 'gear_route')),
  content text not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  image_url text,
  record_distance numeric(5,2),
  record_duration text,
  record_pace text,
  likes_count int not null default 0,
  comments_count int not null default 0,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_posts_category on public.posts(category);
create index if not exists idx_posts_created_at on public.posts(created_at desc);

-- 6. Comments (댓글)
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_comments_post_id on public.comments(post_id);

-- 7. Post Likes (좋아요 / 응원하기)
create table if not exists public.post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  unique(post_id, user_id)
);

-- 8. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.runs enable row level security;
alter table public.run_participants enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.post_likes enable row level security;

-- Profiles Policies
create policy "Profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Admins can update any profile" on public.profiles
  for update using (public.is_admin());

-- Runs Policies
create policy "Runs are viewable by everyone" on public.runs
  for select using (true);

create policy "Approved members can insert runs" on public.runs
  for insert with check (public.is_approved() and auth.uid() = creator_id);

create policy "Creator or admin can update runs" on public.runs
  for update using (auth.uid() = creator_id or public.is_admin());

create policy "Creator or admin can delete runs" on public.runs
  for delete using (auth.uid() = creator_id or public.is_admin());

-- Run Participants Policies
create policy "Run participants viewable by everyone" on public.run_participants
  for select using (true);

create policy "Approved users can join runs" on public.run_participants
  for insert with check (public.is_approved() and auth.uid() = user_id);

create policy "Users can update their participation" on public.run_participants
  for update using (auth.uid() = user_id or public.is_admin());

create policy "Users can cancel participation" on public.run_participants
  for delete using (auth.uid() = user_id or public.is_admin());

-- Posts Policies
create policy "Posts are viewable by everyone" on public.posts
  for select using (true);

create policy "Approved members can create posts" on public.posts
  for insert with check (public.is_approved() and auth.uid() = author_id);

create policy "Author or admin can update posts" on public.posts
  for update using (auth.uid() = author_id or public.is_admin());

create policy "Author or admin can delete posts" on public.posts
  for delete using (auth.uid() = author_id or public.is_admin());

-- Comments Policies
create policy "Comments are viewable by everyone" on public.comments
  for select using (true);

create policy "Approved users can create comments" on public.comments
  for insert with check (public.is_approved() and auth.uid() = author_id);

create policy "Author or admin can delete comments" on public.comments
  for delete using (auth.uid() = author_id or public.is_admin());

-- Likes Policies
create policy "Likes are viewable by everyone" on public.post_likes
  for select using (true);

create policy "Approved users can like posts" on public.post_likes
  for insert with check (public.is_approved() and auth.uid() = user_id);

create policy "Users can unlike posts" on public.post_likes
  for delete using (auth.uid() = user_id);
