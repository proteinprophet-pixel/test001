import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "STRIDE PACE CLUB | 러닝 크루 커뮤니티",
  description: "도심을 질주하는 러닝 크루 스트라이드 페이스 - 정기런 일정, 번개런 모집, 러닝 인증 및 기록 공유",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <body className="bg-track-950 text-zinc-100 min-h-screen flex flex-col antialiased selection:bg-volt-400 selection:text-track-950">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 bg-track-pattern">{children}</main>
          
          <footer className="border-t border-track-800 bg-track-950 py-10 px-4 sm:px-6">
            <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-zinc-500">
              <div className="flex items-center gap-3">
                <span className="font-black text-white tracking-wider text-sm">STRIDE // PACE</span>
                <span className="font-mono text-volt-400">RUNNING CREW</span>
                <span>•</span>
                <span>매주 화/목 19:30 여의도 &amp; 반포</span>
              </div>
              
              <div className="flex items-center gap-6 font-mono text-[11px]">
                <span className="text-zinc-400">Next.js 15 + Supabase + Vercel</span>
                <span className="rounded bg-volt-400/10 px-2 py-0.5 text-volt-400 font-bold border border-volt-400/20">
                  Anti-AI Crafted UI
                </span>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
