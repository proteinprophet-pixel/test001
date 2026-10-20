"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Profile, Post, UserRole, UserStatus } from "@/types/database";
import { 
  ShieldCheck, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Trash2, 
  AlertTriangle,
  Search,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Mail
} from "lucide-react";

export default function AdminPage() {
  const { user, profile, isAdmin, signInWithGoogle } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | UserStatus>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"members" | "posts">("members");

  // Load all users
  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
      }

      // Also fetch posts for moderation
      const postsRes = await fetch("/api/posts");
      const postsData = await postsRes.json();
      if (postsData.posts) {
        setPosts(postsData.posts);
      }
    } catch (e) {
      console.error("Admin fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Update user status & role
  const handleUpdateUser = async (userId: string, status?: UserStatus, role?: UserRole) => {
    setUpdatingId(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status, role }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "업데이트 실패");
      }

      // Update state optimistically
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === userId) {
            return {
              ...u,
              ...(status ? { status } : {}),
              ...(role ? { role } : {}),
            };
          }
          return u;
        })
      );
    } catch (err: any) {
      alert("회원 상태 변경 오류: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // Delete post as admin
  const handleDeletePost = async (postId: string) => {
    if (!confirm("이 게시글을 정말로 삭제하시겠습니까? (관리자 권한)")) return;

    try {
      const res = await fetch(`/api/posts?id=${postId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "삭제 실패");
      }
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      alert("게시글이 삭제되었습니다.");
    } catch (err: any) {
      alert("삭제 실패: " + err.message);
    }
  };

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.crew_nickname || "").toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === "all") return matchesSearch;
    return matchesSearch && u.status === statusFilter;
  });

  const pendingCount = users.filter((u) => u.status === "pending").length;
  const approvedCount = users.filter((u) => u.status === "approved").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Admin Notice Banner if not logged in or not admin */}
      {!isAdmin && (
        <div className="mb-8 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5 text-amber-300">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
            <div className="space-y-1 text-xs sm:text-sm">
              <div className="font-bold text-white text-base">관리자 권한 확인 안내</div>
              <p className="text-zinc-300">
                현재 계정은 관리자(캡틴) 권한이 없거나 승인 전 상태입니다.
                상단 헤더의 <strong>[권한 테스트: 기본]</strong> 버튼을 클릭하여 <code>캡틴(관리자)</code>으로 전환하시면
                이 페이지의 모든 승인/반려/회원 관리 기능을 즉시 테스트해 보실 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-track-800">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-md bg-race-orange/15 px-2.5 py-0.5 text-xs font-mono font-bold text-race-orange border border-race-orange/30 mb-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            CAPTAIN CONTROL CONSOLE
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
            크루원 가입 승인 및 관리자 센터
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            구글로 로그인한 회원을 심사하여 승인하고, 글쓰기 및 세션 참가 권한을 관리합니다.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-track-700 bg-track-850 px-4 py-2 text-xs font-bold text-zinc-300 hover:text-white transition"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-volt-400" : ""}`} />
          새로고침
        </button>
      </div>

      {/* Quick Metrics Cards */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-track-800 bg-track-900 p-5">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
            <span>승인 대기자</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-3xl font-black font-metric text-amber-400">{pendingCount} 명</div>
          <div className="text-[11px] text-zinc-500 mt-1">승인 즉시 글쓰기/참석 가능</div>
        </div>

        <div className="rounded-2xl border border-track-800 bg-track-900 p-5">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
            <span>정식 크루원 (승인 완료)</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-3xl font-black font-metric text-white">{approvedCount} 명</div>
          <div className="text-[11px] text-zinc-500 mt-1">게시판 및 번개런 권한 보유</div>
        </div>

        <div className="rounded-2xl border border-track-800 bg-track-900 p-5">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
            <span>총 등록 회원수</span>
            <Users className="h-4 w-4 text-volt-400" />
          </div>
          <div className="mt-2 text-3xl font-black font-metric text-white">{users.length} 명</div>
          <div className="text-[11px] text-zinc-500 mt-1">Google OAuth 연동 계정</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-10 flex border-b border-track-800 gap-6">
        <button
          onClick={() => setActiveTab("members")}
          className={`pb-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === "members"
              ? "border-volt-400 text-volt-400"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <Users className="h-4 w-4" />
          회원 승인 및 권한 관리 ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("posts")}
          className={`pb-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === "posts"
              ? "border-volt-400 text-volt-400"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          게시글 관리 및 모더레이션 ({posts.length})
        </button>
      </div>

      {activeTab === "members" ? (
        <div className="mt-6 space-y-4">
          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="이름, 이메일, 닉네임 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-track-800 bg-track-900 pl-9 pr-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-volt-400 focus:outline-none"
              />
            </div>

            <div className="flex rounded-lg border border-track-800 bg-track-900 p-1 w-full sm:w-auto">
              <button
                onClick={() => setStatusFilter("all")}
                className={`flex-1 sm:flex-initial px-3 py-1 rounded text-xs font-bold transition ${
                  statusFilter === "all" ? "bg-track-800 text-white" : "text-zinc-400"
                }`}
              >
                전체 ({users.length})
              </button>
              <button
                onClick={() => setStatusFilter("pending")}
                className={`flex-1 sm:flex-initial px-3 py-1 rounded text-xs font-bold transition ${
                  statusFilter === "pending" ? "bg-track-800 text-amber-400" : "text-zinc-400"
                }`}
              >
                대기중 ({pendingCount})
              </button>
              <button
                onClick={() => setStatusFilter("approved")}
                className={`flex-1 sm:flex-initial px-3 py-1 rounded text-xs font-bold transition ${
                  statusFilter === "approved" ? "bg-track-800 text-emerald-400" : "text-zinc-400"
                }`}
              >
                승인됨 ({approvedCount})
              </button>
            </div>
          </div>

          {/* Members Table */}
          <div className="overflow-x-auto rounded-2xl border border-track-800 bg-track-900">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-track-800 bg-track-950 font-mono text-[11px] uppercase text-zinc-400">
                <tr>
                  <th className="px-5 py-3.5">러너 정보</th>
                  <th className="px-5 py-3.5">가입 일자</th>
                  <th className="px-5 py-3.5">현재 상태</th>
                  <th className="px-5 py-3.5">역할 권한</th>
                  <th className="px-5 py-3.5 text-right">승인/권한 설정</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-track-800">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-zinc-500">
                      회원 정보를 불러오는 중...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-zinc-500">
                      조건에 맞는 회원이 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isSelf = user?.id === u.id;
                    const isUpdating = updatingId === u.id;

                    return (
                      <tr key={u.id} className="hover:bg-track-850/50 transition">
                        {/* Runner Info */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {u.avatar_url ? (
                              <img
                                src={u.avatar_url}
                                alt={u.full_name || ""}
                                className="h-9 w-9 rounded-full object-cover ring-1 ring-zinc-700"
                              />
                            ) : (
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-track-800 text-xs font-bold text-volt-400">
                                {(u.full_name || u.email || "R")[0].toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-white flex items-center gap-2">
                                <span>{u.crew_nickname || u.full_name || "익명 러너"}</span>
                                {isSelf && (
                                  <span className="rounded bg-volt-400/20 px-1.5 py-0.2 text-[10px] font-mono text-volt-400">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-zinc-500 flex items-center gap-1 font-mono">
                                <Mail className="h-3 w-3" />
                                {u.email || "구글 비공개 계정"}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Created Date */}
                        <td className="px-5 py-4 font-mono text-zinc-400">
                          {new Date(u.created_at).toLocaleDateString("ko-KR", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>

                        {/* Status Badge */}
                        <td className="px-5 py-4">
                          {u.status === "approved" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                              <CheckCircle2 className="h-3 w-3" />
                              승인됨
                            </span>
                          ) : u.status === "pending" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-xs font-semibold text-amber-400 animate-pulse">
                              <Clock className="h-3 w-3" />
                              승인 대기
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 border border-red-500/30 px-2.5 py-0.5 text-xs font-semibold text-red-400">
                              <XCircle className="h-3 w-3" />
                              반려됨
                            </span>
                          )}
                        </td>

                        {/* Role Select */}
                        <td className="px-5 py-4">
                          <select
                            disabled={isUpdating}
                            value={u.role}
                            onChange={(e) => handleUpdateUser(u.id, undefined, e.target.value as UserRole)}
                            className="rounded-md border border-track-800 bg-track-950 px-2.5 py-1 text-xs text-white focus:border-volt-400 focus:outline-none"
                          >
                            <option value="member">크루원 (Member)</option>
                            <option value="admin">캡틴/관리자 (Admin)</option>
                            <option value="guest">게스트 (Guest)</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {u.status !== "approved" && (
                              <button
                                disabled={isUpdating}
                                onClick={() => handleUpdateUser(u.id, "approved")}
                                className="flex items-center gap-1 rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-bold text-track-950 hover:bg-emerald-400 transition disabled:opacity-50"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>승인하기</span>
                              </button>
                            )}

                            {u.status !== "rejected" && (
                              <button
                                disabled={isUpdating}
                                onClick={() => handleUpdateUser(u.id, "rejected")}
                                className="flex items-center gap-1 rounded-md border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/20 transition disabled:opacity-50"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                <span>반려</span>
                              </button>
                            )}

                            {u.status === "approved" && (
                              <button
                                disabled={isUpdating}
                                onClick={() => handleUpdateUser(u.id, "pending")}
                                className="rounded-md border border-track-700 bg-track-800 px-2.5 py-1.5 text-xs font-mono text-zinc-400 hover:text-white transition"
                                title="승인 취소 (대기 상태로 되돌리기)"
                              >
                                대기로 전환
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Posts Moderation Table */
        <div className="mt-6 space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-track-800 bg-track-900">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-track-800 bg-track-950 font-mono text-[11px] uppercase text-zinc-400">
                <tr>
                  <th className="px-5 py-3.5">게시글 제목</th>
                  <th className="px-5 py-3.5">카테고리</th>
                  <th className="px-5 py-3.5">작성자</th>
                  <th className="px-5 py-3.5">반응</th>
                  <th className="px-5 py-3.5">작성 일시</th>
                  <th className="px-5 py-3.5 text-right">삭제/관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-track-800">
                {posts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-zinc-500">
                      등록된 게시글이 없습니다.
                    </td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <tr key={post.id} className="hover:bg-track-850/50 transition">
                      <td className="px-5 py-4 font-bold text-white max-w-xs truncate">
                        <a href={`/posts/${post.id}`} className="hover:text-volt-400">
                          {post.title}
                        </a>
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded bg-track-800 px-2 py-0.5 text-[10px] font-mono text-zinc-300">
                          {post.category}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-zinc-300">
                        {post.author?.crew_nickname || post.author?.full_name || "러너"}
                      </td>
                      <td className="px-5 py-4 font-mono text-zinc-400">
                        🔥 {post.likes_count} • 💬 {post.comments_count}
                      </td>
                      <td className="px-5 py-4 font-mono text-zinc-500">
                        {new Date(post.created_at).toLocaleDateString("ko-KR")}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="rounded p-1.5 text-zinc-500 hover:text-red-400 transition"
                          title="게시글 강제 삭제"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
