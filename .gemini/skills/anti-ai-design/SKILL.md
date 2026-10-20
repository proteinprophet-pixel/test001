---
name: anti-ai-design
description: Human-crafted UI/UX intelligence system to eradicate generic AI slop, bland SaaS card layouts, and synthetic AI aesthetics.
---

# Anti-AI Design Intelligence System (Anti-Slop UI/UX)

This skill guides the design and implementation of user interfaces that feel genuinely human-crafted, tactile, and contextually alive—strictly prohibiting standard AI design tropes.

---

## 🚫 1. Prohibited AI Tropes (The "AI Slop" Blacklist)

1. **NO Neon Purple/Indigo Gradients & Background Orbs**
   - Strictly forbidden: `from-indigo-500 via-purple-500 to-pink-500`, floating fuzzy radial blur circles behind headers.
   - Instead: Grounded, high-contrast surface hierarchy, textured surfaces, authentic solid color blocks, physical borders.

2. **NO Repetitive Identical Rounded Cards**
   - Strictly forbidden: Grid of 3 identical `rounded-2xl border border-gray-100 p-6 shadow-sm` cards with an icon inside a soft pastel rounded square.
   - Instead: Varied rhythm! Use split sections, compact ledger tables, badge strips, hero metrics with massive typography, sticky detail sidebars, and timeline feeds.

3. **NO Generic Corporate Filler Copy**
   - Strictly forbidden: "Elevate your journey", "Streamline your experience", "Seamlessly connect".
   - Instead: Domain-authentic language. For a running crew: "오늘의 나이트런", "목표 페이스 5'15\"", "남산 북측순환로 8.2km", "우천 시 취소 공지", "참석 체크인".

4. **NO Bland Monotone Typography**
   - Strictly forbidden: Everything in uniform 14px-16px medium Inter.
   - Instead: Expressive typographic tension. Contrast tight bold numbers with sharp uppercase micro-trackings (`tracking-widest text-[11px] font-semibold uppercase`).

---

## ⚡ 2. Design System: Athletic Crew (러닝 크루 테마)

### 🎨 Color Palette & Materials
- **Asphalt & Track (Base):** Deep athletic charcoal (`#121316`), Night Run black (`#0b0c0e`), Crisp Chalk White (`#ffffff`), Muted Slate (`#64748b`).
- **Energy Accents (Volt & Pace):**
  - **Volt Neon (`#ccff00` / `#b8f000`):** Pace indicator, active run badges, high-priority CTA.
  - **Race Orange (`#ff5722`):** Marathon, lightning run (번개런), urgency badges.
  - **Pace Emerald (`#10b981`):** Approved members, completed runs, attendance badges.
- **Surface Elevation:** Subtle dark tactile cards with clean border lines (`border-zinc-800`), frosted glass navigation with crisp border, paper-matte white for light contrast.

### 🏃 Domain Specific Components
1. **Pace & Distance Badges:** Distinct chip tags (e.g. `5'00"~5'30"/km`, `7.5 KM`, `D-2`, `모집중 14/20명`).
2. **Attendance / Participant Stacks:** Overlapping runner profile avatars with real nicknames and pace categories.
3. **Run Type Badges:** 
   - `[정기런]` (Weekly Crew Run)
   - `[번개런]` (Spontaneous Flash Run)
   - `[대회/LSD]` (Long Slow Distance)
   - `[러닝 후기]` (Run Review with photo & stats)
4. **Admin Approval Console:** Fast, keyboard-friendly member status toggles (승인/대기/반려, 관리자/크루원 지정).

---

## 🛠 3. Implementation Rules
- Responsive first: Mobile-optimized since runners check runs on their smartphones right before and after runs.
- Instant feedback: Optimistic UI for likes, participant joins, and status changes.
- Accessibility: High contrast ratios on all text and badges.
