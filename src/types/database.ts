export type UserRole = "admin" | "member" | "guest";
export type UserStatus = "pending" | "approved" | "rejected";
export type RunType = "regular" | "lightning" | "marathon";
export type RunStatus = "recruiting" | "closed" | "completed";
export type PostCategory = "notice" | "review" | "free" | "gear_route";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  crew_nickname: string | null;
  pace_group: string | null;
  bio: string | null;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface Run {
  id: string;
  title: string;
  type: RunType;
  status: RunStatus;
  scheduled_at: string;
  meeting_place: string;
  course_name: string | null;
  distance_km: number;
  target_pace: string;
  max_runners: number;
  content: string | null;
  creator_id: string | null;
  created_at: string;
  creator?: Profile | null;
  participants_count?: number;
  is_user_joined?: boolean;
}

export interface RunParticipant {
  id: string;
  run_id: string;
  user_id: string;
  status: "joined" | "cancelled";
  created_at: string;
  profile?: Profile | null;
}

export interface Post {
  id: string;
  title: string;
  category: PostCategory;
  content: string;
  author_id: string;
  image_url: string | null;
  record_distance: number | null;
  record_duration: string | null;
  record_pace: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  author?: Profile | null;
  is_liked?: boolean;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author?: Profile | null;
}
