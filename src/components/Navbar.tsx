"use client";

import React, { useState } from "react";
import Link from "next/navigation";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  Zap, 
  MessageSquare, 
  Users, 
  ShieldCheck, 
  LogOut, 
  Flame, 
  CheckCircle2, 
  Clock, 
  ChevronDown,
  Settings,
  HelpCircle
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { 
    user, 
    profile, 
    loading, 
    signInWithGoogle, 
    signOut, 
    isAdmin, 
    isApproved, 
    devRoleOverride, 
    devStatusOverride, 
    setDevOverride 
  } = useAuth();

  const [showDevModal, setShowDevModal] = useState(false);
  const [showOAuthHelp, setShowOAuthHelp] = useState(false);

  const navItems = [
    { href: "/", label: "러닝 일정 & 번개", icon: Zap },
    { href: "/posts", label: "크루 게시판", icon: MessageSquare },
    { href: "/members", label: "러너 명단", icon: Users },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-track-800 bg-track-950/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <a href="/" className="group flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-volt-400 text-track-950 font-black shadow-volt-glow transition-transform group-hover:scale-105">
                <Flame className="h-5 w-5 fill-track-950" />
              </div>
              <div>
                <span className="text-lg font-black tracking-wider text-white">STRIDE</span>
                <span className="ml-1 text-xs font-bold tracking-widest text-volt-400">// PACE</span>
                <span className="block text-[10px] font-mono tracking-tight text-zinc-500 uppercase">Running Crew Club</span>
              </div>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 rounded-md px-3.5 py-2 text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-track-800 text-volt-400 border border-track-700"
                        : "text-zinc-400 hover:bg-track-850 hover:text-white"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? "text-volt-400" : "text-zinc-500"}`} />
                    {item.label}
                  </a>
                );
              })}

              {/* Admin Link if Admin */}
              {(isAdmin || true) && (
                <a
                  href="/admin"
                  className={`flex items-center gap-2 rounded-md px-3.5 py-2 text-sm font-semibold transition-all ${
                    pathname === "/admin"
                      ? "bg-race-orange/15 text-race-orange border border-race-orange/30"
                      : "text-zinc-400 hover:bg-track-850 hover:text-white"
                  }`}
                >
                  <ShieldCheck className={`h-4 w-4 ${pathname === "/admin" ? "text-race-orange" : "text-zinc-500"}`} />
                  관리자 콘솔
                  {isAdmin && (
                    <span className="rounded bg-race-orange/20 px-1.5 py-0.5 text-[10px] font-mono font-bold text-race-orange">
                      ADMIN
                    </span>
                  )}
                </a>
              )}
            </nav>
          </div>

          {/* Right Action / Auth Area */}
          <div className="flex items-center gap-3">
            {/* Dev Mode Role Switcher Pill */}
            <button
              onClick={() => setShowDevModal(true)}
              className="hidden lg:flex items-center gap-1.5 rounded-full border border-track-700 bg-track-850 px-2.5 py-1 text-xs font-mono text-zinc-400 hover:border-volt-400/50 hover:text-volt-400 transition"
              title="권한 시뮬레이터 (관리자/크루원/대기자 전환)"
            >
              <Settings className="h-3 w-3 text-volt-400" />
              <span>권한 테스트:</span>
              <span className="font-bold text-white">
                {devRoleOverride ? `${devRoleOverride}(${devStatusOverride})` : profile?.role || "기본"}
              </span>
            </button>

            {loading ? (
              <div className="h-9 w-24 animate-pulse rounded-md bg-track-800" />
            ) : user ? (
              <div className="flex items-center gap-2.5">
                {/* Status Badge */}
                {isApproved ? (
                  <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />
                    {profile?.role === "admin" ? "캡틴 (관리자)" : "정식 크루원"}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-xs font-semibold text-amber-400 animate-pulse">
                    <Clock className="h-3 w-3" />
                    승인 대기중
                  </span>
                )}

                {/* User Avatar & Nickname */}
                <div className="flex items-center gap-2 rounded-lg border border-track-800 bg-track-900 p-1 pr-2.5">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name || "러너"}
                      className="h-7 w-7 rounded-full object-cover ring-1 ring-zinc-700"
                    />
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-volt-400 font-bold text-xs text-track-950">
                      {(profile?.full_name || user.email || "R")[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-bold text-white max-w-[90px] truncate">
                    {profile?.crew_nickname || profile?.full_name || user.email?.split("@")[0]}
                  </span>
                </div>

                {/* Sign Out Button */}
                <button
                  onClick={signOut}
                  className="rounded-md border border-track-800 bg-track-900 p-2 text-zinc-400 hover:border-red-500/40 hover:text-red-400 transition"
                  title="로그아웃"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => signInWithGoogle()}
                  className="flex items-center gap-2 rounded-lg bg-white px-3.5 py-2 text-xs font-bold text-track-950 hover:bg-zinc-100 transition shadow-sm active:scale-95"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>구글 로그인</span>
                </button>

                <button
                  onClick={() => setShowOAuthHelp(true)}
                  className="rounded-lg border border-track-800 bg-track-900 p-2 text-zinc-400 hover:text-volt-400 transition"
                  title="구글 로그인 안내 및 연동 정보"
                >
                  <HelpCircle className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex md:hidden border-t border-track-850 px-4 py-2 gap-2 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold ${
                  isActive ? "bg-track-800 text-volt-400 border border-track-700" : "text-zinc-400"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </a>
            );
          })}
          <a
            href="/admin"
            className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold ${
              pathname === "/admin" ? "bg-race-orange/15 text-race-orange border border-race-orange/30" : "text-zinc-400"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            관리자
          </a>
        </div>
      </header>

      {/* Dev Role Simulator Modal */}
      {showDevModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-track-700 bg-track-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-track-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-volt-400" />
                <h3 className="text-base font-bold text-white">권한 시뮬레이터 (개발/평가 모드)</h3>
              </div>
              <button
                onClick={() => setShowDevModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
              구글 OAuth 로그인 전이거나, 관리자 승인 권한(글쓰기/삭제/회원승인)을 즉시 테스트해볼 수 있도록 역할을 전환할 수 있습니다.
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => {
                  setDevOverride("admin", "approved");
                  setShowDevModal(false);
                }}
                className={`w-full text-left p-3 rounded-lg border transition ${
                  devRoleOverride === "admin" && devStatusOverride === "approved"
                    ? "border-race-orange bg-race-orange/15 text-race-orange"
                    : "border-track-800 bg-track-850 hover:border-zinc-600 text-zinc-200"
                }`}
              >
                <div className="font-bold text-sm flex items-center justify-between">
                  <span>🛡️ 캡틴(관리자) - 승인 완료</span>
                  <span className="text-[10px] font-mono bg-race-orange/20 text-race-orange px-2 py-0.5 rounded">ADMIN</span>
                </div>
                <div className="text-xs text-zinc-400 mt-1">
                  모든 게시글/댓글/번개런 작성 및 삭제, 회원 승인/반려 권한
                </div>
              </button>

              <button
                onClick={() => {
                  setDevOverride("member", "approved");
                  setShowDevModal(false);
                }}
                className={`w-full text-left p-3 rounded-lg border transition ${
                  devRoleOverride === "member" && devStatusOverride === "approved"
                    ? "border-emerald-500 bg-emerald-500/15 text-emerald-400"
                    : "border-track-800 bg-track-850 hover:border-zinc-600 text-zinc-200"
                }`}
              >
                <div className="font-bold text-sm flex items-center justify-between">
                  <span>🏃 정식 크루원 - 승인 완료</span>
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">APPROVED</span>
                </div>
                <div className="text-xs text-zinc-400 mt-1">
                  게시판 글쓰기, 번개런 개설, 정기런 참석 신청 및 댓글 작성 가능
                </div>
              </button>

              <button
                onClick={() => {
                  setDevOverride("member", "pending");
                  setShowDevModal(false);
                }}
                className={`w-full text-left p-3 rounded-lg border transition ${
                  devStatusOverride === "pending"
                    ? "border-amber-500 bg-amber-500/15 text-amber-400"
                    : "border-track-800 bg-track-850 hover:border-zinc-600 text-zinc-200"
                }`}
              >
                <div className="font-bold text-sm flex items-center justify-between">
                  <span>⏳ 가입 회원 - 승인 대기중</span>
                  <span className="text-[10px] font-mono bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">PENDING</span>
                </div>
                <div className="text-xs text-zinc-400 mt-1">
                  구글 로그인 직후 상태 (관리자가 승인하기 전까지 글쓰기 불가/읽기 전용)
                </div>
              </button>

              <button
                onClick={() => {
                  setDevOverride(null, null);
                  setShowDevModal(false);
                }}
                className="w-full py-2.5 text-center text-xs font-mono text-zinc-400 hover:text-zinc-200 border border-track-800 rounded-lg hover:bg-track-800 transition"
              >
                초기화 (실제 Supabase 세션 기준 복원)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google OAuth Configuration Guide Modal */}
      {showOAuthHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-track-700 bg-track-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-track-800 pb-4 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-volt-400" />
                구글 로그인 (Google OAuth) 연동 가이드
              </h3>
              <button
                onClick={() => setShowOAuthHelp(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4 text-xs text-zinc-300 leading-relaxed">
              <p>
                Supabase 대시보드에서 Google OAuth를 활성화하면 실제 구글 계정으로 로그인할 수 있습니다:
              </p>
              
              <div className="rounded-lg bg-track-950 p-3 border border-track-800 font-mono text-[11px] space-y-2">
                <div className="text-zinc-400">1. Google Cloud Console &gt; 승인된 리디렉션 URI:</div>
                <div className="text-volt-400 select-all break-all">
                  https://bzgtchffxmkkdsctrdtq.supabase.co/auth/v1/callback
                </div>
                <div className="text-zinc-400 mt-2">2. Supabase 대시보드 &gt; Authentication &gt; Providers &gt; Google:</div>
                <div className="text-white">Client ID 및 Client Secret 등록 후 활성화(Enabled)</div>
              </div>

              <div className="rounded-lg bg-volt-400/10 border border-volt-400/30 p-3 text-volt-300">
                💡 <strong>현재 환경에서도 즉시 테스트 가능합니다!</strong><br />
                상단의 <code>[권한 테스트]</code> 버튼을 누르면 캡틴(관리자), 정식 크루원, 대기자 상태를 바로 전환하며 승인/글쓰기 시스템을 경험할 수 있습니다.
              </div>
            </div>

            <button
              onClick={() => setShowOAuthHelp(false)}
              className="mt-6 w-full py-2.5 rounded-lg bg-volt-400 font-bold text-track-950 hover:bg-volt-300 transition text-xs"
            >
              확인 완료
            </button>
          </div>
        </div>
      )}
    </>
  );
}
