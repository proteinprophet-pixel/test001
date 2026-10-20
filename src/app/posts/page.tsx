"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Post, PostCategory } from "@/types/database";
import { 
  MessageSquare, 
  Flame, 
  Plus, 
  X, 
  Heart, 
  Share2, 
  Calendar, 
  MapPin, 
  Clock, 
  TrendingUp, 
  Award, 
  Activity,
  AlertCircle,
  CheckCircle2,
  Lock
} from "lucide-react";

export default function PostsPage() {
  const { user, profile, isApproved, signInWithGoogle } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<"all" | PostCategory>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    category: "review" as PostCategory,
    content: "",
    image_url: "",
    record_distance: "",
    record_duration: "",
    record_pace: "",
  });

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const url = selectedCategory === "all" ? "/api/posts" : `/api/posts?category=${selectedCategory}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.posts) {
        setPosts(data.posts);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory]);

  const handleToggleLike = (postId: string) => {
    if (!user) {
      signInWithGoogle();
      return;
    }

    setLikedPostIds((prev) => {
      const next = new Set(prev);
      const wasLiked = next.has(postId);
      if (wasLiked) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });

    // Optimistically update count
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const wasLiked = likedPostIds.has(postId);
          return {
            ...p,
            likes_count: wasLiked ? p.likes_count - 1 : p.likes_count + 1,
          };
        }
        return p;
      })
    );
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      signInWithGoogle();
      return;
    }

    if (!isApproved) {
      alert("⚠️ 관리자 승인 대기 중입니다.\n관리자가 가입을 승인한 후 게시글을 작성하실 수 있습니다.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          author_id: user.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "글 작성 실패");
      }

      setShowCreateModal(false);
      setFormData({
        title: "",
        category: "review",
        content: "",
        image_url: "",
        record_distance: "",
        record_duration: "",
        record_pace: "",
      });
      await fetchPosts();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const categoryLabels: Record<PostCategory, { label: string; icon: string }> = {
    notice: { label: "공지사항", icon: "📢" },
    review: { label: "러닝 후기/인증", icon: "👟" },
    free: { label: "자유 수다", icon: "💬" },
    gear_route: { label: "장비 & 코스 추천", icon: "⚡" },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-track-800">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-md bg-volt-400/15 px-2.5 py-0.5 text-xs font-mono font-bold text-volt-400 border border-volt-400/30 mb-2">
            <Activity className="h-3.5 w-3.5" />
            CREW RUNNING LOG // BOARD
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
            스트라이드 크루 피드 &amp; 게시판
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            훈련 일지, 완주 기록, 러닝 코스 및 장비 리뷰를 공유하는 크루원 전용 커뮤니티입니다.
          </p>
        </div>

        {/* Action Button */}
        <div>
          {isApproved ? (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 rounded-xl bg-volt-400 px-5 py-2.5 text-xs font-black text-track-950 hover:bg-volt-300 transition shadow-volt-glow active:scale-95"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>글 작성하기</span>
            </button>
          ) : user ? (
            <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-400">
              <Lock className="h-4 w-4" />
              <span>관리자 승인 대기중 (글쓰기 제한)</span>
            </div>
          ) : (
            <button
              onClick={() => signInWithGoogle()}
              className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-track-950 hover:bg-zinc-200 transition shadow-sm active:scale-95"
            >
              <span>구글 로그인 후 글쓰기</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="mt-8 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`shrink-0 rounded-lg px-4 py-2 text-xs font-bold transition ${
            selectedCategory === "all"
              ? "bg-track-800 text-volt-400 border border-track-700"
              : "text-zinc-400 hover:bg-track-900 hover:text-white"
          }`}
        >
          전체 피드
        </button>
        {(Object.keys(categoryLabels) as PostCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`shrink-0 rounded-lg px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
              selectedCategory === cat
                ? "bg-track-800 text-volt-400 border border-track-700"
                : "text-zinc-400 hover:bg-track-900 hover:text-white"
            }`}
          >
            <span>{categoryLabels[cat].icon}</span>
            <span>{categoryLabels[cat].label}</span>
          </button>
        ))}
      </div>

      {/* Posts Grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 rounded-2xl border border-track-800 bg-track-900/50 animate-pulse" />
          ))
        ) : posts.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-track-800 p-12 text-center text-zinc-500">
            <MessageSquare className="mx-auto h-8 w-8 text-zinc-600 mb-3" />
            <div className="font-bold text-white text-base">게시글이 아직 없습니다.</div>
            <div className="text-xs text-zinc-400 mt-1">오늘 달린 러닝 인증글을 가장 먼저 남겨보세요!</div>
          </div>
        ) : (
          posts.map((post) => {
            const isLiked = likedPostIds.has(post.id);
            const isNotice = post.category === "notice";

            return (
              <article
                key={post.id}
                className={`flex flex-col justify-between rounded-2xl border transition overflow-hidden group ${
                  isNotice
                    ? "border-volt-400/30 bg-track-900/90 shadow-volt-glow/10"
                    : "border-track-800 bg-track-900 hover:border-track-700"
                }`}
              >
                {/* Image if available */}
                {post.image_url && (
                  <div className="relative h-44 w-full overflow-hidden bg-track-950">
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-track-900 via-transparent to-transparent" />
                  </div>
                )}

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    {/* Top Row: Category Badge & Author */}
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-track-800 px-2 py-0.5 text-[11px] font-mono text-zinc-300">
                        {categoryLabels[post.category]?.icon} {categoryLabels[post.category]?.label}
                      </span>
                      <span className="text-[11px] font-mono text-zinc-500">
                        {new Date(post.created_at).toLocaleDateString("ko-KR", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Post Title */}
                    <h3 className="text-base sm:text-lg font-bold text-white leading-snug group-hover:text-volt-400 transition">
                      {post.title}
                    </h3>

                    {/* Athletic Record Chip (if review/run record included) */}
                    {(post.record_distance || post.record_duration || post.record_pace) && (
                      <div className="flex items-center gap-3 rounded-lg border border-track-800 bg-track-950/80 p-2.5 font-mono text-xs">
                        {post.record_distance && (
                          <div>
                            <span className="text-[10px] text-zinc-500 block uppercase">거리</span>
                            <span className="font-bold text-volt-400">{post.record_distance} KM</span>
                          </div>
                        )}
                        {post.record_duration && (
                          <div className="border-l border-track-800 pl-3">
                            <span className="text-[10px] text-zinc-500 block uppercase">시간</span>
                            <span className="font-bold text-white">{post.record_duration}</span>
                          </div>
                        )}
                        {post.record_pace && (
                          <div className="border-l border-track-800 pl-3">
                            <span className="text-[10px] text-zinc-500 block uppercase">페이스</span>
                            <span className="font-bold text-race-orange">{post.record_pace}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Post Content snippet */}
                    <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed whitespace-pre-line">
                      {post.content}
                    </p>
                  </div>

                  {/* Bottom Footer Area */}
                  <div className="mt-6 pt-4 border-t border-track-850 flex items-center justify-between">
                    {/* Author */}
                    <div className="flex items-center gap-2">
                      {post.author?.avatar_url ? (
                        <img
                          src={post.author.avatar_url}
                          alt={post.author.full_name || ""}
                          className="h-6 w-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-track-800 text-[10px] font-bold text-volt-400 flex items-center justify-center">
                          {(post.author?.full_name || "R")[0]}
                        </div>
                      )}
                      <span className="text-xs font-semibold text-zinc-300">
                        {post.author?.crew_nickname || post.author?.full_name || "크루원"}
                      </span>
                    </div>

                    {/* Reactions / Stats */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleLike(post.id)}
                        className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-mono font-bold transition ${
                          isLiked
                            ? "bg-race-red/20 text-race-red border border-race-red/40"
                            : "bg-track-800 text-zinc-400 hover:text-white"
                        }`}
                      >
                        <Flame className={`h-3.5 w-3.5 ${isLiked ? "fill-race-red" : ""}`} />
                        <span>{post.likes_count}</span>
                      </button>

                      <div className="flex items-center gap-1 text-xs font-mono text-zinc-500">
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>{post.comments_count}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl border border-track-700 bg-track-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-track-800 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-volt-400" />
                <h3 className="text-lg font-black text-white uppercase">새 크루 게시글 작성</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-zinc-300 mb-1.5">
                  카테고리 선택 *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(Object.keys(categoryLabels) as PostCategory[]).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat })}
                      className={`p-2.5 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        formData.category === cat
                          ? "border-volt-400 bg-volt-400/15 text-volt-400"
                          : "border-track-800 bg-track-850 text-zinc-400 hover:text-white"
                      }`}
                    >
                      <span>{categoryLabels[cat].icon}</span>
                      <span>{categoryLabels[cat].label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-zinc-300 mb-1.5">
                  게시글 제목 *
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 오늘 새벽 10km 회복 조깅 완주 후기"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg border border-track-800 bg-track-950 px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-volt-400 focus:outline-none"
                />
              </div>

              {/* Optional Athletic Record Input Group */}
              <div className="rounded-xl border border-track-800 bg-track-950 p-4 space-y-3">
                <div className="text-xs font-mono font-bold text-volt-400 flex items-center gap-1.5">
                  <Activity className="h-4 w-4" />
                  러닝 기록 첨부 (선택사항)
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 mb-1">거리 (km)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="10.5"
                      value={formData.record_distance}
                      onChange={(e) => setFormData({ ...formData, record_distance: e.target.value })}
                      className="w-full rounded-lg border border-track-800 bg-track-900 px-3 py-1.5 text-xs text-white focus:border-volt-400 focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 mb-1">시간 (hh:mm:ss)</label>
                    <input
                      type="text"
                      placeholder="00:54:20"
                      value={formData.record_duration}
                      onChange={(e) => setFormData({ ...formData, record_duration: e.target.value })}
                      className="w-full rounded-lg border border-track-800 bg-track-900 px-3 py-1.5 text-xs text-white focus:border-volt-400 focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 mb-1">페이스 (분/km)</label>
                    <input
                      type="text"
                      placeholder="5:10/km"
                      value={formData.record_pace}
                      onChange={(e) => setFormData({ ...formData, record_pace: e.target.value })}
                      className="w-full rounded-lg border border-track-800 bg-track-900 px-3 py-1.5 text-xs text-white focus:border-volt-400 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-zinc-300 mb-1.5">
                  사진 이미지 URL (선택사항)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full rounded-lg border border-track-800 bg-track-950 px-3.5 py-2 text-xs text-white placeholder-zinc-600 focus:border-volt-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-zinc-300 mb-1.5">
                  본문 내용 *
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="오늘의 러닝 소감, 코스 특징, 카본화 피드백 등을 자유롭게 작성해주세요."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full rounded-lg border border-track-800 bg-track-950 p-3.5 text-sm text-white placeholder-zinc-600 focus:border-volt-400 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-volt-400 py-3 text-sm font-black text-track-950 hover:bg-volt-300 transition shadow-volt-glow disabled:opacity-50"
                >
                  {submitting ? "게시 중..." : "게시글 등록하기"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
