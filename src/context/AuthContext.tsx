"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { Profile, UserRole, UserStatus } from "@/types/database";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  // Dev mode bypass for quick evaluation/testing
  devRoleOverride: UserRole | null;
  devStatusOverride: UserStatus | null;
  setDevOverride: (role: UserRole | null, status: UserStatus | null) => void;
  isAdmin: boolean;
  isApproved: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [devRoleOverride, setDevRoleOverride] = useState<UserRole | null>(null);
  const [devStatusOverride, setDevStatusOverride] = useState<UserStatus | null>(null);

  const supabase = createClient();

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error);
      }
      if (data) {
        setProfile(data as Profile);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
    if (error) {
      console.error("Google sign in error:", error.message);
      throw error;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setDevRoleOverride(null);
    setDevStatusOverride(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const setDevOverride = (role: UserRole | null, status: UserStatus | null) => {
    setDevRoleOverride(role);
    setDevStatusOverride(status);
  };

  // Compute effective role & status (taking dev overrides into account if set)
  const effectiveRole = devRoleOverride || profile?.role || (user ? "member" : "guest");
  const effectiveStatus = devStatusOverride || profile?.status || (user ? "pending" : "rejected");

  const isAdmin = effectiveRole === "admin" && effectiveStatus === "approved";
  const isApproved = effectiveStatus === "approved";

  return (
    <AuthContext.Provider
      value={{
        user,
        profile: profile
          ? { ...profile, role: effectiveRole, status: effectiveStatus }
          : user
          ? {
              id: user.id,
              email: user.email || "",
              full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "러너",
              avatar_url: user.user_metadata?.avatar_url || null,
              crew_nickname: user.user_metadata?.name || user.email?.split("@")[0] || "러너",
              pace_group: "530",
              bio: null,
              role: effectiveRole,
              status: effectiveStatus,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          : null,
        loading,
        signInWithGoogle,
        signOut,
        refreshProfile,
        devRoleOverride,
        devStatusOverride,
        setDevOverride,
        isAdmin,
        isApproved,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
