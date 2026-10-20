"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { Run, RunType } from "@/types/database";
import { 
  Zap, 
  Flame, 
  MapPin, 
  Clock, 
  Users, 
  Calendar, 
  ArrowRight, 
  Plus, 
  CheckCircle2, 
  X, 
  ChevronRight,
  TrendingUp,
  Award,
  Navigation
} from "lucide-react";

export default function HomePage() {
  const { user, profile, isApproved, isAdmin, signInWithGoogle } = useAuth();
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | RunType>("all");
  const [userJoinedRunIds, setUserJoinedRunIds] = useState<Set<string>>(new Set());

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    type: "lightning" as RunType,
    scheduled_at: "",
    meeting_place: "",
    course_name: "",
    distance_km: "5.0",
    target_pace: "5:30/km",
    max_runners: "15",
    content: "",
  });

  const supabase = createClient();

  // Fetch runs
  const fetchRuns = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("runs")
        .select(`
          *,
          creator:profiles(*)
        `)
        .order("scheduled_at", { ascending: true });

      if (error) {
        console.error("Error fetching runs:", error);
        return;
      }

      // Fetch participants count
      const { data: participants } = await supabase
        .from("run_participants")
        .select("run_id, user_id, status")
        .eq("status", "joined");

      const joinedMap: Record<string, number> = {};
      const userJoined = new Set<string>();

      participants?.forEach((p) => {
        joinedMap[p.run_id] = (joinedMap[p.run_id] || 0) + 1;
        if (user && p.user_id === user.id) {
          userJoined.add(p.run_id);
        }
      });

      setUserJoinedRunIds(userJoined);

      const enrichedRuns = (data || []).map((run) => ({
        ...run,
        participants_count: joinedMap[run.id] || 0,
      }));

      setRuns(enrichedRuns);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
  }, [user]);

  // Handle Join / Cancel Run
  const handleToggleJoin = async (runId: string) => {
    if (!user) {
      signInWithGoogle();
      return;
    }

    if (!isApproved) {
      alert("⚠️ 관리자 승인 대기 중입니다.\n관리자가 가입을 승인한 후 정기런 및 번개런에 참석 신청하실 수 있습니다.");
      return;
    }

    const isJoined = userJoinedRunIds.has(runId);

    try {
      if (isJoined) {
        // Cancel
        const { error } = await supabase
          .from("run_participants")
          .delete()
          .eq("run_id", runId)
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        // Join
        const { error } = await supabase
          .from("run_participants")
          .insert({
            run_id: runId,
            user_id: user.id,
            status: "joined",
          });

        if (error) throw error;
      }

      await fetchRuns();
    } catch (err: any) {
      alert("참석 처리 중 오류가 발생했습니다: " + err.message);
    }
  };

  // Handle Create Run
  const handleCreateRun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isApproved) {
      alert("승인된 크루원만 러닝 세션을 개설할 수 있습니다.");
      return;
    }

    setSubmitting(true);
    try {
      const scheduledDateTime = new Date(formData.scheduled_at).toISOString();

      const { data, error } = await supabase.from("runs").insert({
        title: formData.title,
        type: formData.type,
        scheduled_at: scheduledDateTime,
        meeting_place: formData.meeting_place,
        course_name: formData.course_name || null,
        distance_km: parseFloat(formData.distance_km) || 5.0,
        target_pace: formData.target_pace,
        max_runners: parseInt(formData.max_runners) || 15,
        content: formData.content || null,
        creator_id: user.id,
      }).select().single();

      if (error) throw error;

      // Automatically join creator to run
      if (data) {
        await supabase.from("run_participants").insert({
          run_id: data.id,
          user_id: user.id,
          status: "joined",
        });
      }

      setShowCreateModal(false);
      setFormData({
        title: "",
        type: "lightning",
        scheduled_at: "",
        meeting_place: "",
        course_name: "",
        distance_km: "5.0",
        target_pace: "5:30/km",
        max_runners: "15",
        content: "",
      });
      await fetchRuns();
    } catch (err: any) {
      alert("러닝 개설 실패: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRuns = runs.filter((r) => {
    if (activeTab === "all") return true;
    return r.type === activeTab;
  });

  const nextRun = runs.length > 0 ? runs[0] : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      {/* 1. Hero Athletic Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-track-800 bg-gradient-to-b from-track-900 to-track-950 p-6 sm:p-10 shadow-2xl mb-12">
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-volt-400/5 blur-3xl pointer-events-none" />
        <div className="absolute right-10 bottom-6 hidden lg:block opacity-10 font-black text-8xl text-volt-400 select-none font-mono">
          PACE
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-volt-400/30 bg-volt-400/10 px-3 py-1 text-xs font-mono font-bold text-volt-400 mb-5">
            <span className="flex h-2 w-2 rounded-full bg-volt-400 animate-ping" />
            LIVE CREW SESSION // SEOUL
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-none uppercase">
            Run The Asphalt. <br />
            <span className="text-volt-400 underline decoration-volt-400/30 underline-offset-8">
              Stride Together.
            </span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-zinc-400 leading-relaxed max-w-2xl">
            스트라이드 페이스는 도시의 밤과 새벽을 달리는 애슬레틱 러닝 크루입니다.
            구글 로그인 후 관리자 승인을 통해 정기런과 번개런에 자유롭게 참여하세요.
          </p>

          {/* Quick Metrics Strip */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-track-800 pt-6">
            <div>
              <div className="text-xs font-mono uppercase text-zinc-500">Weekly Pace</div>
              <div className="text-xl sm:text-2xl font-black font-metric text-white mt-0.5">5&apos;15&quot;</div>
              <div className="text-[11px] text-zinc-400">평균 순항 페이스</div>
            </div>
            <div>
              <div className="text-xs font-mono uppercase text-zinc-500">Next Regular Run</div>
              <div className="text-xl sm:text-2xl font-black font-metric text-volt-400 mt-0.5">D-2</div>
              <div className="text-[11px] text-zinc-400">여의도 나이트런</div>
            </div>
            <div>
              <div className="text-xs font-mono uppercase text-zinc-500">Crew Runners</div>
              <div className="text-xl sm:text-2xl font-black font-metric text-white mt-0.5">38 명</div>
              <div className="text-[11px] text-emerald-400 font-semibold">정식 승인 멤버</div>
            </div>
            <div>
              <div className="text-xs font-mono uppercase text-zinc-500">Total Runs</div>
              <div className="text-xl sm:text-2xl font-black font-metric text-white mt-0.5">142 회</div>
              <div className="text-[11px] text-zinc-400">누적 세션 완주</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Next Upcoming Run Feature Card */}
      {nextRun && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black tracking-wide text-white uppercase flex items-center gap-2">
              <Flame className="h-5 w-5 text-volt-400" />
              가장 가까운 러닝 세션 (NEXT RUN)
            </h2>
            <span className="text-xs font-mono text-zinc-400">실시간 참석 신청 가능</span>
          </div>

          <div className="rounded-2xl border-2 border-volt-400/40 bg-track-900 p-6 sm:p-8 shadow-volt-glow/20 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-volt-400 text-track-950 px-2.5 py-0.5 text-xs font-black uppercase">
                    {nextRun.type === "regular" ? "정기런" : nextRun.type === "lightning" ? "번개런" : "대회/LSD"}
                  </span>
                  <span className="rounded-md bg-track-800 text-zinc-300 px-2.5 py-0.5 text-xs font-mono font-semibold">
                    {nextRun.target_pace}
                  </span>
                  <span className="rounded-md bg-track-800 text-volt-400 px-2.5 py-0.5 text-xs font-mono font-bold">
                    {nextRun.distance_km} KM
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white">{nextRun.title}</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-300 pt-1 font-mono">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-zinc-500" />
                    <span>{new Date(nextRun.scheduled_at).toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-race-orange" />
                    <span className="truncate">{nextRun.meeting_place}</span>
                  </div>
                </div>

                {nextRun.content && (
                  <p className="text-xs text-zinc-400 line-clamp-2 pt-1">{nextRun.content}</p>
                )}
              </div>

              {/* Action / Capacity Area */}
              <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-4 border-t md:border-t-0 md:border-l border-track-800 pt-4 md:pt-0 md:pl-8 min-w-[200px]">
                <div>
                  <div className="text-[11px] font-mono text-zinc-400 uppercase">현재 참석 인원</div>
                  <div className="text-2xl font-black font-metric text-white">
                    <span className="text-volt-400">{nextRun.participants_count || 0}</span>
                    <span className="text-zinc-500 text-sm"> / {nextRun.max_runners}명</span>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleJoin(nextRun.id)}
                  className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm tracking-wide transition active:scale-95 flex items-center justify-center gap-2 ${
                    userJoinedRunIds.has(nextRun.id)
                      ? "bg-track-800 text-zinc-300 border border-track-700 hover:border-red-500/50 hover:text-red-400"
                      : "bg-volt-400 text-track-950 font-black hover:bg-volt-300 shadow-volt-glow"
                  }`}
                >
                  {userJoinedRunIds.has(nextRun.id) ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      참석 완료 (취소하기)
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 fill-track-950" />
                      참석 신청하기
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. All Runs Header & Filter Tabs */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-track-800">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white uppercase">러닝 세션 일정표</h2>
            <p className="text-xs text-zinc-400 mt-1">
              매주 열리는 정기런과 크루원들이 자유롭게 모집하는 번개런 목록입니다.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter Tabs */}
            <div className="flex rounded-lg border border-track-800 bg-track-900 p-1">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
                  activeTab === "all" ? "bg-track-800 text-volt-400" : "text-zinc-400 hover:text-white"
                }`}
              >
                전체
              </button>
              <button
                onClick={() => setActiveTab("regular")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
                  activeTab === "regular" ? "bg-track-800 text-volt-400" : "text-zinc-400 hover:text-white"
                }`}
              >
                ⚡ 정기런
              </button>
              <button
                onClick={() => setActiveTab("lightning")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
                  activeTab === "lightning" ? "bg-track-800 text-race-orange" : "text-zinc-400 hover:text-white"
                }`}
              >
                🔥 번개런
              </button>
            </div>

            {/* Create Run Button */}
            <button
              onClick={() => {
                if (!user) {
                  signInWithGoogle();
                } else if (!isApproved) {
                  alert("⚠️ 관리자 승인 대기 중입니다.\n승인된 크루원만 번개런/정기런을 개설할 수 있습니다.");
                } else {
                  setShowCreateModal(true);
                }
              }}
              className="flex items-center gap-2 rounded-lg bg-volt-400 px-4 py-2 text-xs font-black text-track-950 hover:bg-volt-300 transition shadow-sm active:scale-95"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>러닝 개설</span>
            </button>
          </div>
        </div>

        {/* 4. Runs Grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-56 rounded-2xl border border-track-800 bg-track-900/50 animate-pulse" />
            ))
          ) : filteredRuns.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-track-800 p-12 text-center text-zinc-500">
              <Zap className="mx-auto h-8 w-8 text-zinc-600 mb-3" />
              <div className="font-bold text-white text-base">예정된 러닝 일정이 없습니다.</div>
              <div className="text-xs text-zinc-400 mt-1">첫 번째 번개런을 직접 개설해 보세요!</div>
            </div>
          ) : (
            filteredRuns.map((run) => {
              const isJoined = userJoinedRunIds.has(run.id);
              const isFull = (run.participants_count || 0) >= run.max_runners;

              return (
                <div
                  key={run.id}
                  className="flex flex-col justify-between rounded-2xl border border-track-800 bg-track-900 p-5 hover:border-track-700 transition group"
                >
                  <div className="space-y-3">
                    {/* Top Row: Type & Pace Badges */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[11px] font-black uppercase tracking-wider ${
                          run.type === "regular"
                            ? "bg-volt-400/15 text-volt-400 border border-volt-400/30"
                            : "bg-race-orange/15 text-race-orange border border-race-orange/30"
                        }`}
                      >
                        {run.type === "regular" ? "⚡ 정기런" : "🔥 번개런"}
                      </span>

                      <div className="flex items-center gap-1.5 font-mono text-xs">
                        <span className="font-bold text-white">{run.distance_km} KM</span>
                        <span className="text-zinc-600">•</span>
                        <span className="text-zinc-400">{run.target_pace}</span>
                      </div>
                    </div>

                    {/* Run Title */}
                    <h3 className="font-bold text-base text-white group-hover:text-volt-400 transition leading-snug">
                      {run.title}
                    </h3>

                    {/* Metadata */}
                    <div className="space-y-1.5 text-xs text-zinc-400 font-mono">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                        <span>
                          {new Date(run.scheduled_at).toLocaleDateString("ko-KR", {
                            month: "short",
                            day: "numeric",
                            weekday: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-race-orange shrink-0" />
                        <span className="truncate">{run.meeting_place}</span>
                      </div>
                    </div>

                    {run.content && (
                      <p className="text-xs text-zinc-400 line-clamp-2 pt-1 border-t border-track-850">
                        {run.content}
                      </p>
                    )}
                  </div>

                  {/* Bottom Action Area */}
                  <div className="mt-5 pt-4 border-t border-track-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-zinc-500" />
                      <span className="text-xs font-mono font-bold text-zinc-300">
                        <span className="text-volt-400">{run.participants_count || 0}</span> / {run.max_runners}명
                      </span>
                    </div>

                    <button
                      onClick={() => handleToggleJoin(run.id)}
                      disabled={isFull && !isJoined}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                        isJoined
                          ? "bg-track-800 text-emerald-400 border border-emerald-500/30 hover:border-red-500/40 hover:text-red-400"
                          : isFull
                          ? "bg-track-850 text-zinc-600 cursor-not-allowed"
                          : "bg-volt-400 text-track-950 font-black hover:bg-volt-300"
                      }`}
                    >
                      {isJoined ? "참석 완료" : isFull ? "마감됨" : "참석 신청"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Create Run Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-track-700 bg-track-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-track-800 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-volt-400" />
                <h3 className="text-lg font-black text-white uppercase">새 러닝 세션 개설</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRun} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-zinc-300 mb-1.5">
                  세션 구분
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "lightning" })}
                    className={`p-3 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-2 ${
                      formData.type === "lightning"
                        ? "border-race-orange bg-race-orange/15 text-race-orange"
                        : "border-track-800 bg-track-850 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Flame className="h-4 w-4" />
                    번개런 (스폰테이니어스)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "regular" })}
                    className={`p-3 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-2 ${
                      formData.type === "regular"
                        ? "border-volt-400 bg-volt-400/15 text-volt-400"
                        : "border-track-800 bg-track-850 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Zap className="h-4 w-4" />
                    정기런 (크루 공식)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-zinc-300 mb-1.5">
                  세션 제목 *
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 목요일 밤 한강 잠수교 8km 지속주"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg border border-track-800 bg-track-950 px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-volt-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-zinc-300 mb-1.5">
                    일시 *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.scheduled_at}
                    onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                    className="w-full rounded-lg border border-track-800 bg-track-950 px-3.5 py-2 text-sm text-white focus:border-volt-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold text-zinc-300 mb-1.5">
                    집결 장소 *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="예: 여의나루역 2번 출구 앞"
                    value={formData.meeting_place}
                    onChange={(e) => setFormData({ ...formData, meeting_place: e.target.value })}
                    className="w-full rounded-lg border border-track-800 bg-track-950 px-3.5 py-2 text-sm text-white placeholder-zinc-600 focus:border-volt-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-zinc-300 mb-1.5">
                    목표 거리 (km)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.distance_km}
                    onChange={(e) => setFormData({ ...formData, distance_km: e.target.value })}
                    className="w-full rounded-lg border border-track-800 bg-track-950 px-3 py-2 text-sm text-white focus:border-volt-400 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold text-zinc-300 mb-1.5">
                    목표 페이스
                  </label>
                  <input
                    type="text"
                    value={formData.target_pace}
                    onChange={(e) => setFormData({ ...formData, target_pace: e.target.value })}
                    className="w-full rounded-lg border border-track-800 bg-track-950 px-3 py-2 text-sm text-white focus:border-volt-400 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold text-zinc-300 mb-1.5">
                    최대 인원
                  </label>
                  <input
                    type="number"
                    value={formData.max_runners}
                    onChange={(e) => setFormData({ ...formData, max_runners: e.target.value })}
                    className="w-full rounded-lg border border-track-800 bg-track-950 px-3 py-2 text-sm text-white focus:border-volt-400 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-zinc-300 mb-1.5">
                  세션 안내 &amp; 코스 설명
                </label>
                <textarea
                  rows={3}
                  placeholder="코스 경로, 짐 보관 여부, 쿨다운 안내 등을 적어주세요."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full rounded-lg border border-track-800 bg-track-950 p-3 text-sm text-white placeholder-zinc-600 focus:border-volt-400 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-volt-400 py-3 text-sm font-black text-track-950 hover:bg-volt-300 transition shadow-volt-glow disabled:opacity-50"
                >
                  {submitting ? "개설 중..." : "⚡ 러닝 세션 등록하기"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
