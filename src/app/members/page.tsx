"use client";

import React, { useEffect, useState } from "react";
import { Profile } from "@/types/database";
import { Users, Award, Shield, Zap, Search, Activity, CheckCircle2 } from "lucide-react";

export default function MembersPage() {
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [paceFilter, setPaceFilter] = useState("all");

  useEffect(() => {
    async function fetchMembers() {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/users");
        const data = await res.json();
        if (data.users) {
          // Filter to approved members or all
          setMembers(data.users.filter((u: Profile) => u.status === "approved"));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchMembers();
  }, []);

  const paceGroups = ["all", "430", "500", "530", "600"];

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      (m.crew_nickname || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.bio || "").toLowerCase().includes(searchTerm.toLowerCase());

    if (paceFilter === "all") return matchesSearch;
    return matchesSearch && m.pace_group === paceFilter;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Header */}
      <div className="pb-8 border-b border-track-800">
        <div className="inline-flex items-center gap-1.5 rounded-md bg-volt-400/15 px-2.5 py-0.5 text-xs font-mono font-bold text-volt-400 border border-volt-400/30 mb-2">
          <Users className="h-3.5 w-3.5" />
          ACTIVE CREW ROSTER
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
          스트라이드 페이스 크루원 명단
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          관리자 승인을 거쳐 함께 달리는 스트라이드 페이스 정식 멤버 리스트입니다.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="러너 닉네임, 이름, 소개글 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-track-800 bg-track-900 pl-9 pr-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-volt-400 focus:outline-none"
          />
        </div>

        {/* Pace Filter Tabs */}
        <div className="flex gap-1.5 rounded-lg border border-track-800 bg-track-900 p-1 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setPaceFilter("all")}
            className={`px-3 py-1 rounded text-xs font-bold transition ${
              paceFilter === "all" ? "bg-track-800 text-volt-400" : "text-zinc-400"
            }`}
          >
            전체 페이스
          </button>
          <button
            onClick={() => setPaceFilter("430")}
            className={`px-3 py-1 rounded text-xs font-mono font-bold transition ${
              paceFilter === "430" ? "bg-track-800 text-race-orange" : "text-zinc-400"
            }`}
          >
            4:30 이하
          </button>
          <button
            onClick={() => setPaceFilter("500")}
            className={`px-3 py-1 rounded text-xs font-mono font-bold transition ${
              paceFilter === "500" ? "bg-track-800 text-volt-400" : "text-zinc-400"
            }`}
          >
            5:00 그룹
          </button>
          <button
            onClick={() => setPaceFilter("530")}
            className={`px-3 py-1 rounded text-xs font-mono font-bold transition ${
              paceFilter === "530" ? "bg-track-800 text-white" : "text-zinc-400"
            }`}
          >
            5:30 그룹
          </button>
          <button
            onClick={() => setPaceFilter("600")}
            className={`px-3 py-1 rounded text-xs font-mono font-bold transition ${
              paceFilter === "600" ? "bg-track-800 text-emerald-400" : "text-zinc-400"
            }`}
          >
            6:00 / 펀런
          </button>
        </div>
      </div>

      {/* Runners Grid */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 rounded-2xl border border-track-800 bg-track-900/50 animate-pulse" />
          ))
        ) : filteredMembers.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-track-800 p-12 text-center text-zinc-500">
            <Users className="mx-auto h-8 w-8 text-zinc-600 mb-3" />
            <div className="font-bold text-white text-base">해당 조건의 크루원이 없습니다.</div>
          </div>
        ) : (
          filteredMembers.map((member) => (
            <div
              key={member.id}
              className="rounded-2xl border border-track-800 bg-track-900 p-6 flex flex-col justify-between hover:border-track-700 transition group"
            >
              <div>
                {/* Avatar and Role */}
                <div className="flex items-start justify-between">
                  <div className="relative">
                    {member.avatar_url ? (
                      <img
                        src={member.avatar_url}
                        alt={member.full_name || ""}
                        className="h-16 w-16 rounded-2xl object-cover ring-2 ring-track-700 group-hover:ring-volt-400 transition"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-track-800 text-xl font-bold text-volt-400">
                        {(member.full_name || "R")[0]}
                      </div>
                    )}
                    <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-track-950">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </span>
                  </div>

                  {member.role === "admin" ? (
                    <span className="rounded-md bg-race-orange/20 border border-race-orange/30 px-2 py-0.5 text-[10px] font-mono font-bold text-race-orange flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      CAPTAIN
                    </span>
                  ) : (
                    <span className="rounded-md bg-track-800 px-2 py-0.5 text-[10px] font-mono font-bold text-zinc-400">
                      CREW
                    </span>
                  )}
                </div>

                {/* Nickname & Name */}
                <div className="mt-4">
                  <h3 className="font-bold text-base text-white group-hover:text-volt-400 transition">
                    {member.crew_nickname || member.full_name}
                  </h3>
                  <div className="text-xs text-zinc-500 font-mono mt-0.5">
                    {member.full_name}
                  </div>
                </div>

                {/* Bio */}
                <p className="mt-3 text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  {member.bio || "오늘도 힘차게 달립니다! 스트라이드 페이스 화이팅 🔥"}
                </p>
              </div>

              {/* Pace Tag Bottom */}
              <div className="mt-6 pt-4 border-t border-track-850 flex items-center justify-between font-mono text-xs">
                <span className="text-[11px] text-zinc-500 uppercase">순항 페이스</span>
                <span className="rounded-md bg-track-800 px-2 py-0.5 font-bold text-volt-400">
                  {member.pace_group ? `${member.pace_group}/km` : "5:30/km"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
