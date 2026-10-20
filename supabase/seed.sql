-- 0. Insert mock auth.users so foreign key constraint is satisfied
insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) values
(
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'captain@stridepace.club',
  '$2a$10$abcdefghijklmnopqrstuu',
  now(),
  '{"provider":"google","providers":["google"]}',
  '{"name":"민지훈 (캡틴)","avatar_url":"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}',
  now(),
  now()
),
(
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'runner.choi@stridepace.club',
  '$2a$10$abcdefghijklmnopqrstuu',
  now(),
  '{"provider":"google","providers":["google"]}',
  '{"name":"최유진 (페이서)","avatar_url":"https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80"}',
  now(),
  now()
),
(
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'park.jun@stridepace.club',
  '$2a$10$abcdefghijklmnopqrstuu',
  now(),
  '{"provider":"google","providers":["google"]}',
  '{"name":"박준혁 (훈련부장)","avatar_url":"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"}',
  now(),
  now()
),
(
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'kim.hannah@stridepace.club',
  '$2a$10$abcdefghijklmnopqrstuu',
  now(),
  '{"provider":"google","providers":["google"]}',
  '{"name":"김하나 (신입대기)","avatar_url":"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"}',
  now(),
  now()
)
on conflict (id) do nothing;

-- 1. Profiles Table (note: trigger on auth.users will insert initial profile, so we update or insert)
insert into public.profiles (
  id,
  email,
  full_name,
  avatar_url,
  crew_nickname,
  pace_group,
  bio,
  role,
  status
) values 
(
  '00000000-0000-0000-0000-000000000001',
  'captain@stridepace.club',
  '민지훈 (캡틴)',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  '한강스프린터',
  '430',
  '스트라이드 페이스 크루 캡틴. 풀코스 서브3 목표로 달리는 중입니다.',
  'admin',
  'approved'
),
(
  '00000000-0000-0000-0000-000000000002',
  'runner.choi@stridepace.club',
  '최유진 (페이서)',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  '유진러너',
  '500',
  '5:00 페이서 담당! 부상 없이 즐겁게 오래 달리는 게 모토입니다.',
  'member',
  'approved'
),
(
  '00000000-0000-0000-0000-000000000003',
  'park.jun@stridepace.club',
  '박준혁 (훈련부장)',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  '준혁조깅',
  '530',
  '남산 업힐 매니아. 정기런 출석률 98%',
  'member',
  'approved'
),
(
  '00000000-0000-0000-0000-000000000004',
  'kim.hannah@stridepace.club',
  '김하나 (신입대기)',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  '하나런',
  '600',
  '러닝 입문 3개월차입니다! 5km 완주가 목표예요.',
  'member',
  'pending'
)
on conflict (id) do update set
  role = excluded.role,
  status = excluded.status,
  crew_nickname = excluded.crew_nickname,
  pace_group = excluded.pace_group,
  bio = excluded.bio;

-- 2. Sample Runs
insert into public.runs (
  id,
  title,
  type,
  status,
  scheduled_at,
  meeting_place,
  course_name,
  distance_km,
  target_pace,
  max_runners,
  content,
  creator_id
) values
(
  '11111111-1111-1111-1111-111111111111',
  '⚡ [정기런] 목요일 여의도 한강 나이트런',
  'regular',
  'recruiting',
  now() + interval '2 days',
  '여의나루역 2번 출구 마포대교 아래 광장',
  '여의도 한강공원 ~ 원효대교 ~ 마포대교 순환 코스',
  6.5,
  '5:30/km (430/500/530/600 4개 그룹 운영)',
  25,
  '이번 주 목요일 정기 나이트런입니다! 가을 밤바람 맞으며 가볍게 회복주로 달립니다. 짐 보관은 캡틴 차량에 가능하며, 종료 후 가벼운 리커버리 음료 타임이 있습니다.',
  '00000000-0000-0000-0000-000000000001'
),
(
  '22222222-2222-2222-2222-222222222222',
  '🔥 [번개런] 반포 달빛광장 잠수교 업다운 8K',
  'lightning',
  'recruiting',
  now() + interval '1 day',
  '반포한강공원 달빛광장 세빛섬 앞 벤치',
  '잠수교 왕복 및 동작대교 방면 순환',
  8.0,
  '5:15/km',
  12,
  '내일 퇴근 후 급 번개런! 잠수교 오르막 인터벌 2세트 포함 8km 달립니다. 인터벌 후 쿨다운 조깅 진행해요.',
  '00000000-0000-0000-0000-000000000002'
),
(
  '33333333-3333-3333-3333-333333333333',
  '🏆 [주말런] 남산 북측순환로 가을 단풍 힐클라임 10K',
  'regular',
  'recruiting',
  now() + interval '5 days',
  '동국대입구역 6번 출구 장충단공원 입구',
  '장충단공원 ~ 남산 북측순환로 ~ 국립극장',
  10.0,
  '5:45/km',
  30,
  '주말 오전 상쾌한 남산 공기 마시며 달리는 업힐 코스! 경사도가 있지만 천천히 페이스 조절하며 올라갑니다.',
  '00000000-0000-0000-0000-000000000003'
)
on conflict (id) do nothing;

-- 3. Run Participants
insert into public.run_participants (run_id, user_id, status) values
('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'joined'),
('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000002', 'joined'),
('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000003', 'joined'),
('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000002', 'joined')
on conflict (run_id, user_id) do nothing;

-- 4. Sample Board Posts
insert into public.posts (
  id,
  title,
  category,
  content,
  author_id,
  image_url,
  record_distance,
  record_duration,
  record_pace,
  likes_count,
  comments_count
) values
(
  '44444444-4444-4444-4444-444444444441',
  '📢 [공지] 2026 하반기 정기훈련 안내 및 크루 매너 수칙',
  'notice',
  '안녕하세요, 스트라이드 페이스 크루원 여러분! 하반기 정기 러닝 시즌을 맞아 주요 일정과 안전 수칙을 공지합니다.\n\n1. 정기런 일정: 매주 화/목 19:30 여의도 및 반포 한강공원\n2. 주말 LSD: 매주 토요일 오전 08:00 남산/올림픽공원\n3. 안전 수칙: 야간 러닝 시 반사 밴드 또는 런닝 라이트 착용 필수\n4. 승인제 안내: 신규 회원은 관리자 승인 후 게시판 글쓰기 및 정기런 참석 권한이 부여됩니다.',
  '00000000-0000-0000-0000-000000000001',
  null,
  null,
  null,
  null,
  18,
  3
),
(
  '44444444-4444-4444-4444-444444444442',
  '👟 춘천마라톤 대비 21km 하프 지속주 완주 인증! (5''10" 페이스)',
  'review',
  '오늘 새벽 잠실에서 출발해서 잠원한강공원 반환점 찍고 돌아왔습니다.\n초반 5km는 5:25로 몸 풀고, 10km 이후부터 5:05 페이스로 유지했네요.\n새로 바꾼 카본화 접지력이 젖은 노면에서도 확실히 안정적이었습니다.\n함께 달려준 유진님 페이싱 감사해요! 이번 춘마 서브 3:40 도전해봅니다 🔥',
  '00000000-0000-0000-0000-000000000003',
  'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800&auto=format&fit=crop&q=80',
  21.1,
  '01:49:15',
  '5:10/km',
  24,
  5
),
(
  '44444444-4444-4444-4444-444444444443',
  '⚡ 나이키 알파플라이 3 vs 아디다스 프로 4 실착 100km 비교 리뷰',
  'gear_route',
  '두 레이싱화 모두 50km 이상 로드 및 트랙에서 굴려본 뒤 남기는 지극히 주관적인 크루원 리뷰입니다.\n\n- 알파플라이 3: 앞발 에어팟 튕겨주는 반발력이 압도적. 후반부 다리 털릴 때 밀어주는 힘이 확실함.\n- 프로 4: 라이트스트라이크 프로 폼의 쫀득함과 발목 안정감이 우수. 코너링에서 발목 꺾임이 덜함.\n\n발볼 넓으신 분들은 프로 4 추천, 아치 높고 탄성 선호하시면 알파 3 추천합니다!',
  '00000000-0000-0000-0000-000000000002',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
  null,
  null,
  null,
  15,
  2
)
on conflict (id) do nothing;

-- 5. Sample Comments
insert into public.comments (post_id, author_id, content) values
('44444444-4444-4444-4444-444444444442', '00000000-0000-0000-0000-000000000001', '준혁님 오늘 페이스 너무 훌륭했습니다! 춘마 서브 3:40 무조건 가능합니다 👊'),
('44444444-4444-4444-4444-444444444442', '00000000-0000-0000-0000-000000000002', '후반 15km 맞바람 구간에서도 안 밀리고 페이스 잘 버텨주셔서 뒤에서 편하게 뛰었어요 ㅎㅎ'),
('44444444-4444-4444-4444-444444444443', '00000000-0000-0000-0000-000000000003', '정성 가득한 장비 리뷰 감사합니다! 아디제로 신어보러 가야겠네요.')
on conflict (id) do nothing;
