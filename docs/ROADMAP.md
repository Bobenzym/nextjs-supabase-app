# 모임 이벤트 관리 웹앱 MVP 개발 로드맵

> 주최자 중심으로 이벤트 생성, 참여자 관리, 카풀 조율, 정산을 한 곳에서 처리하는 MVP 로드맵

---

## 1. Executive Summary

- **목표**: 카카오톡 단톡방의 혼란을 대체하는 주최자 중심 이벤트 관리 웹앱 MVP를 릴리즈한다.
- **범위**: 이벤트 CRUD, 참여자 승인/거절, 카풀 신청·수동 매칭, 정산 자동 계산까지 11개 세부 작업으로 구성한다.
- **일정**: 총 2주 + 마무리 3일(주말 포함)로, Phase 1(1주차) → Phase 2(2주차) → Phase 3(마무리) 순으로 진행한다.

---

## 2. Timeline Overview

| Phase                        | 기간                        | 기간(일) | 주요 마일스톤                                                |
| ---------------------------- | --------------------------- | -------- | ------------------------------------------------------------ |
| Phase 0: 사전 준비           | D-1 ~ D0                    | 1일      | DB 스키마/RLS 정책 배포, 타입 생성, 기본 네비게이션 확인     |
| Phase 1: Core Features       | Week 1 (D1 ~ D7)            | 7일      | 이벤트 생성 → 대시보드 → 상세 → 참여 신청 → 참여자 관리 완결 |
| Phase 2: Additional Features | Week 2 (D8 ~ D14)           | 7일      | 카풀 신청 → 수동 매칭 → 정산 완결                            |
| Phase 3: Polish & Deployment | Week 2 주말 + α (D15 ~ D17) | 3일      | 모바일 반응형 점검, Vercel 배포, 에러/로딩 처리              |

### 간트 형태 요약

```
Week 1 (Core)          Week 2 (Additional)          Weekend+α (Polish)
D1 D2 D3 D4 D5 D6 D7 | D8 D9 D10 D11 D12 D13 D14 | D15 D16 D17
[T1][T2][T3][T4][T5]   [T6 ][T7 ][T8 ]              [T9][T10][T11]
```

### 주요 마일스톤

- **M1 (D7 종료)**: Phase 1 완료 — 주최자가 이벤트를 만들고 참여자를 승인할 수 있다.
- **M2 (D14 종료)**: Phase 2 완료 — 카풀 매칭 + 정산 금액 자동 계산 UI 완성.
- **M3 (D17 종료)**: Phase 3 완료 — Vercel 프로덕션 배포 성공 및 모바일 동작 확인.

---

## 3. Phase 1: Core Features (Week 1)

> 목표: 주최자 & 참여자의 기본 엔드투엔드 플로우(생성 → 공유 → 신청 → 승인)를 완성한다.

### Task 1. 이벤트 생성 페이지 구현 (F001)

| 항목          | 내용                                                                                     |
| ------------- | ---------------------------------------------------------------------------------------- |
| 담당 영역     | Front + Back + DB                                                                        |
| 예상 소요시간 | 1일 (D1)                                                                                 |
| 의존성        | Phase 0(DB/RLS 완료), 기존 Supabase Auth                                                 |
| Server Action | `createEventAction`                                                                      |
| 관련 파일     | `app/protected/events/new/page.tsx`, `app/actions/event.ts`, `components/event-form.tsx` |

**완료 기준 체크리스트**

- [ ] `/protected/events/new` 라우트에서 제목/날짜/장소/최대인원/설명 입력 폼이 표시된다.
- [ ] 필수 필드 검증(zod 또는 form validation)이 동작한다.
- [ ] `createEventAction` 실행 후 `events` 테이블에 `host_id = auth.uid()`로 행이 생성된다.
- [ ] 생성 성공 시 `/protected/events/[id]`로 리다이렉트된다.
- [ ] RLS 정책으로 비로그인 사용자의 INSERT가 차단됨을 확인한다.

---

### Task 2. 대시보드(이벤트 목록) 구현 (F002)

| 항목          | 내용                                                          |
| ------------- | ------------------------------------------------------------- |
| 담당 영역     | Front + Back                                                  |
| 예상 소요시간 | 1일 (D2)                                                      |
| 의존성        | Task 1 (이벤트 존재 필요)                                     |
| 데이터 소스   | `events` (host_id = me) + `event_members` (user_id = me) JOIN |
| 관련 파일     | `app/protected/page.tsx`, `components/event-card.tsx`         |

**완료 기준 체크리스트**

- [ ] "내가 주최한 이벤트" 섹션에 `host_id = auth.uid()`인 이벤트가 카드로 표시된다.
- [ ] "내가 신청한 이벤트" 섹션에 `event_members`에서 내 user_id로 조회한 결과가 표시된다.
- [ ] 각 카드에 제목, 날짜, 장소, 현재 인원/최대 인원, 상태 뱃지가 보인다.
- [ ] 카드 클릭 시 이벤트 상세 페이지로 이동한다.
- [ ] 빈 상태(Empty State) UI가 구현되어 있다.

---

### Task 3. 이벤트 상세 페이지 구현 (F002)

| 항목          | 내용                                                                                               |
| ------------- | -------------------------------------------------------------------------------------------------- |
| 담당 영역     | Front + Back                                                                                       |
| 예상 소요시간 | 1.5일 (D3 ~ D4 오전)                                                                               |
| 의존성        | Task 1                                                                                             |
| 접근 권한     | 비로그인 사용자도 열람 가능 (RLS: events 전체 공개 SELECT)                                         |
| 관련 파일     | `app/protected/events/[id]/page.tsx`, `components/event-detail.tsx`, `components/share-button.tsx` |

**완료 기준 체크리스트**

- [ ] 제목/날짜/장소/설명/주최자 이름/현재 확정 인원 표시가 동작한다.
- [ ] 주최자 접근 시 "참여자 관리"/"카풀"/"정산" 탭이 노출된다.
- [ ] 참여자 접근 시 "참여 신청" 버튼과 "카풀"/"정산" 탭이 노출된다.
- [ ] 공유 URL 복사 버튼이 클립보드 API로 URL을 복사한다.
- [ ] `params`가 `Promise<{ id: string }>` 타입으로 올바르게 처리된다 (Next.js 15).

---

### Task 4. 참여 신청 버튼 및 상태 표시 (F003)

| 항목          | 내용                                                   |
| ------------- | ------------------------------------------------------ |
| 담당 영역     | Front + Back                                           |
| 예상 소요시간 | 1일 (D4 오후 ~ D5)                                     |
| 의존성        | Task 3                                                 |
| Server Action | `applyEventAction`                                     |
| 관련 파일     | `components/apply-button.tsx`, `app/actions/member.ts` |

**완료 기준 체크리스트**

- [ ] 비로그인 사용자가 버튼 클릭 시 `/auth/login`으로 리다이렉트되고, 로그인 후 원래 페이지로 돌아온다.
- [ ] 신청 성공 시 `event_members`에 `status = 'pending'`으로 행이 삽입된다.
- [ ] 이미 신청한 사용자는 버튼 대신 현재 상태(pending/confirmed/rejected) 뱃지가 표시된다.
- [ ] 최대 인원(confirmed 기준) 초과 시 버튼이 비활성화되고 안내 메시지가 표시된다.
- [ ] 중복 신청 시 DB 레벨 유니크 제약(event_id, user_id)으로 차단된다.

---

### Task 5. 참여자 관리 페이지 (승인/거절) (F003)

| 항목          | 내용                                                                        |
| ------------- | --------------------------------------------------------------------------- |
| 담당 영역     | Front + Back                                                                |
| 예상 소요시간 | 1.5일 (D6 ~ D7)                                                             |
| 의존성        | Task 4                                                                      |
| Server Action | `updateMemberStatusAction`                                                  |
| 접근 권한     | 주최자 전용 (RLS로 강제)                                                    |
| 관련 파일     | `app/protected/events/[id]/members/page.tsx`, `components/member-table.tsx` |

**완료 기준 체크리스트**

- [ ] 신청자 목록이 테이블(이름/이메일/신청 시각/상태)로 표시된다.
- [ ] 각 행에 "승인"/"거절" 버튼이 있고 클릭 시 상태가 즉시 업데이트된다.
- [ ] `revalidatePath`로 상세 페이지의 확정 인원이 동기화된다.
- [ ] 주최자가 아닌 사용자가 URL로 직접 접근 시 차단(리다이렉트 또는 404)된다.
- [ ] 상태별 필터(전체/pending/confirmed/rejected)가 동작한다.

---

## 4. Phase 2: Additional Features (Week 2)

> 목표: 카풀 조율 및 정산이라는 실제 운영상 가장 귀찮은 두 영역을 웹앱으로 이관한다.

### Task 6. 카풀 신청 폼 구현 (F004)

| 항목          | 내용                                                                        |
| ------------- | --------------------------------------------------------------------------- |
| 담당 영역     | Front + Back                                                                |
| 예상 소요시간 | 2일 (D8 ~ D9)                                                               |
| 의존성        | Task 3 (이벤트 상세), Task 5 (참여자 확정)                                  |
| Server Action | `applyCarpoolAction`                                                        |
| 관련 파일     | `app/protected/events/[id]/carpool/page.tsx`, `components/carpool-form.tsx` |

**완료 기준 체크리스트**

- [ ] 역할 선택 라디오(`driver` / `passenger`)가 동작한다.
- [ ] driver 선택 시 `seats` 입력 필드가 노출되고, passenger 선택 시 숨겨진다.
- [ ] `memo` 텍스트 필드로 출발지/경유지를 입력할 수 있다.
- [ ] 신청 성공 시 `carpools` 테이블에 행이 삽입된다.
- [ ] 본인의 신청 목록이 페이지 상단에 표시되고 수정/삭제가 가능하다.

---

### Task 7. 카풀 매칭 (수동) 구현 (F004)

| 항목          | 내용                                                                                                |
| ------------- | --------------------------------------------------------------------------------------------------- |
| 담당 영역     | Front + Back                                                                                        |
| 예상 소요시간 | 2일 (D10 ~ D11)                                                                                     |
| 의존성        | Task 6                                                                                              |
| Server Action | `matchCarpoolAction`                                                                                |
| 접근 권한     | 주최자 전용                                                                                         |
| 관련 파일     | `app/protected/events/[id]/carpool/page.tsx` (주최자 뷰 분기), `components/carpool-match-table.tsx` |

**완료 기준 체크리스트**

- [ ] 주최자 전용 영역에 driver 목록과 passenger 목록이 각각 테이블로 표시된다.
- [ ] 각 passenger에 대해 driver 선택 드롭다운(또는 드래그앤드롭)이 동작한다.
- [ ] 매칭 시 `carpools.matched_driver_id`가 업데이트된다.
- [ ] driver의 `seats`를 초과하는 매칭은 클라이언트/서버에서 모두 검증되어 차단된다.
- [ ] 매칭 해제(unmatch) 동작이 지원된다.
- [ ] 참여자 뷰에서 매칭 결과가 "운전자 → 탑승자 목록" 형태로 조회된다.

---

### Task 8. 정산 입력 및 조회 구현 (F005)

| 항목          | 내용                                                                              |
| ------------- | --------------------------------------------------------------------------------- |
| 담당 영역     | Front + Back                                                                      |
| 예상 소요시간 | 1.5일 (D12 ~ D13)                                                                 |
| 의존성        | Task 5 (confirmed 참여자 수 필요)                                                 |
| Server Action | `createSettlementAction`, `updateSettlementAction`                                |
| 관련 파일     | `app/protected/events/[id]/settlement/page.tsx`, `components/settlement-form.tsx` |

**완료 기준 체크리스트**

- [ ] 주최자 뷰에서 총 비용, 은행명, 계좌번호, 예금주 입력 폼이 동작한다.
- [ ] 저장 시 `settlements` 테이블에 JSON 형태의 `account_info`가 저장된다.
- [ ] 1인당 금액이 `total_cost / confirmed 참여자 수`로 자동 계산되어 표시된다.
- [ ] 참여자 뷰에서 1인당 금액과 계좌 정보가 조회된다.
- [ ] 정산 정보 미입력 상태는 참여자에게 "정산 정보가 아직 등록되지 않았습니다" 메시지로 표시된다.
- [ ] Buffer day(D14): Phase 2 전체 회귀 테스트 및 Phase 1과의 통합 점검.

---

## 5. Phase 3: Polish & Deployment (주말 + α, 3일)

> 목표: 모바일 기기에서의 동작을 보증하고 프로덕션 배포를 완료한다.

### Task 9. 모바일 반응형 점검

| 항목          | 내용                                             |
| ------------- | ------------------------------------------------ |
| 담당 영역     | Front                                            |
| 예상 소요시간 | 0.5일 (D15 오전)                                 |
| 의존성        | Phase 1, Phase 2 완료                            |
| 검증 대상     | iPhone Safari, Android Chrome (360px ~ 430px 폭) |

**완료 기준 체크리스트**

- [ ] 모든 페이지가 360px 폭에서 가로 스크롤 없이 렌더링된다.
- [ ] 참여자 관리/카풀 매칭 테이블이 모바일에서 카드 형태로 전환되거나 가로 스크롤로 동작한다.
- [ ] 터치 타겟 크기(최소 44px)가 유지된다.
- [ ] Tailwind 브레이크포인트(`sm`, `md`) 활용이 일관되게 적용되어 있다.

---

### Task 10. Vercel 배포 및 환경변수 설정

| 항목          | 내용                    |
| ------------- | ----------------------- |
| 담당 영역     | DevOps                  |
| 예상 소요시간 | 1일 (D15 오후 ~ D16)    |
| 의존성        | Task 9                  |
| 플랫폼        | Vercel + Supabase Cloud |

**완료 기준 체크리스트**

- [ ] Vercel 프로젝트 연결 및 master 브랜치 자동 배포가 설정된다.
- [ ] `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`가 Vercel 환경변수로 등록된다.
- [ ] Supabase Auth의 Redirect URL에 Vercel 도메인이 등록된다.
- [ ] Google OAuth 콘솔의 Authorized redirect URIs에 배포 도메인이 추가된다.
- [ ] `npm run build`가 Vercel에서 오류 없이 통과한다.
- [ ] 배포 후 Google 로그인 → 이벤트 생성 → 참여 신청 스모크 테스트 통과.

---

### Task 11. 기본 에러 처리 및 로딩 상태

| 항목          | 내용                                                             |
| ------------- | ---------------------------------------------------------------- |
| 담당 영역     | Front + Back                                                     |
| 예상 소요시간 | 1일 (D17)                                                        |
| 의존성        | Task 10                                                          |
| 관련 파일     | `app/**/loading.tsx`, `app/**/error.tsx`, `app/global-error.tsx` |

**완료 기준 체크리스트**

- [ ] 주요 라우트(`protected`, `events/[id]`, `members`, `carpool`, `settlement`)에 `loading.tsx`가 추가된다.
- [ ] 주요 라우트에 `error.tsx`가 추가되어 복구 버튼과 안내 메시지를 제공한다.
- [ ] Server Action 내부에 try/catch 및 사용자 친화적 에러 반환 로직이 있다.
- [ ] 실패한 요청에 대한 Toast 또는 인라인 에러 UI가 일관되게 표시된다.
- [ ] 404 페이지(`not-found.tsx`)가 전역에 구현된다.

---

## 6. Dependency Map

### 작업 간 의존성 표

| Task             | 의존 Task | 병렬 가능 여부      |
| ---------------- | --------- | ------------------- |
| T1 이벤트 생성   | (없음)    | 단독                |
| T2 대시보드      | T1        | T1 완료 후 즉시     |
| T3 이벤트 상세   | T1        | T2와 병렬 가능      |
| T4 참여 신청     | T3        | 단독 직렬           |
| T5 참여자 관리   | T4        | 단독 직렬           |
| T6 카풀 신청     | T3, T5    | T8과 일부 병렬 가능 |
| T7 카풀 매칭     | T6        | 단독 직렬           |
| T8 정산          | T5        | T6/T7과 병렬 가능   |
| T9 모바일 반응형 | T1 ~ T8   | Phase 3 내 단독     |
| T10 배포         | T9        | T9 이후             |
| T11 에러/로딩    | T10       | 배포 후 최종 마감   |

### Gantt 형태 시각화

```
D1  D2  D3  D4  D5  D6  D7  D8  D9  D10 D11 D12 D13 D14 D15 D16 D17
T1 ==
    T2 ==
        T3 =======
                T4 ===
                    T5 =======
                                T6 =======
                                        T7 =======
                                                T8 =======
                                                            [Buffer]
                                                                T9 =
                                                                    T10 ==
                                                                            T11 =
```

---

## 7. Risk & Mitigation

| #   | 위험                                               | 영향도 | 발생 확률 | 대응 방안                                                                               |
| --- | -------------------------------------------------- | ------ | --------- | --------------------------------------------------------------------------------------- |
| R1  | 카풀 매칭 로직 복잡도 증가로 T7 일정 초과          | 높음   | 중        | MVP에서는 "수동 매칭 only" 고수, 드래그앤드롭 대신 드롭다운으로 단순화                  |
| R2  | RLS 정책 오류로 참여자가 타인 데이터를 조회/수정   | 높음   | 중        | 각 Task 완료 시 타 계정으로 curl/Playwright 접근 테스트 필수                            |
| R3  | Supabase 타입 생성 지연으로 타입 에러 누적         | 중     | 중        | `supabase gen types typescript` 스크립트를 package.json에 등록, 스키마 변경 즉시 재생성 |
| R4  | Google OAuth 콜백 URL 누락으로 배포 후 로그인 실패 | 높음   | 높음      | T10 체크리스트에 Supabase + Google Console 양쪽 등록 명시                               |
| R5  | 최대 인원 체크 레이스 컨디션 (동시 신청 시 초과)   | 중     | 낮음      | Server Action 내부에서 `SELECT ... FOR UPDATE` 또는 트랜잭션/RPC로 원자성 보장          |
| R6  | Next.js 15 `params` Promise 처리 누락              | 중     | 중        | 코드 리뷰 체크리스트에 포함, Server Component async 확인                                |
| R7  | 모바일 테이블 레이아웃 깨짐                        | 중     | 높음      | T9에서 Tailwind `overflow-x-auto` 또는 카드 전환 일괄 적용                              |
| R8  | 정산 1인당 금액 나눗셈 시 소수점/0명 케이스        | 낮음   | 중        | confirmed 수 0일 때 "정산 가능 인원 없음" 메시지, `Math.ceil` 정책 정의                 |

---

## 8. Success Metrics

### Phase 1 완료 검증 기준 (D7)

- [ ] 주최자가 로그인 → 이벤트 생성 → URL 복사가 동작한다.
- [ ] 참여자가 URL 접근 → 로그인 → 참여 신청이 동작한다.
- [ ] 주최자가 pending 신청을 승인/거절하고, 확정 인원이 실시간으로 반영된다.
- [ ] RLS: 비주최자가 `/members` 페이지 접근 시 차단된다.
- [ ] `npm run lint` 및 `npm run build` 로컬 통과.

### Phase 2 완료 검증 기준 (D14)

- [ ] 카풀 신청(driver/passenger) 폼이 동작하며 `carpools` 테이블에 저장된다.
- [ ] 주최자가 수동 매칭을 완료하고, 참여자 뷰에서 매칭 결과가 확인된다.
- [ ] 총 비용 입력 시 1인당 금액이 자동 계산되어 참여자에게 표시된다.
- [ ] driver `seats` 초과 매칭이 차단된다.
- [ ] Phase 1 기능이 Phase 2 배포 후에도 회귀 없이 동작한다.

### Phase 3 완료 검증 기준 (D17)

- [ ] Vercel 프로덕션 URL에서 Google 로그인부터 정산 조회까지 E2E 플로우 성공.
- [ ] iPhone Safari / Android Chrome에서 모든 페이지 정상 렌더링.
- [ ] 주요 라우트에 `loading.tsx` / `error.tsx` 존재.
- [ ] Lighthouse 모바일 Accessibility 점수 90+ (목표치).
- [ ] README에 배포 URL 및 환경변수 안내 추가.

---

## 9. Rollback Plan

### 9-1. 데이터베이스 롤백

| 항목              | 전략                                                                                    |
| ----------------- | --------------------------------------------------------------------------------------- |
| 마이그레이션 관리 | Supabase CLI(`supabase migration new`) 또는 `supabase/migrations/` 디렉토리로 버전 관리 |
| 롤백 방법         | 각 마이그레이션에 대응하는 `down` SQL을 별도 문서/파일로 보관                           |
| RLS 정책          | 정책 변경 전 `pg_dump --schema-only` 백업                                               |
| 긴급 복구         | Supabase 대시보드의 Point-in-Time Recovery(유료 플랜) 또는 주기적 수동 백업(pg_dump)    |
| 데이터 시드       | 개발/스테이징에 사용할 시드 SQL을 `supabase/seed.sql`로 유지                            |

### 9-2. 코드 롤백

| 항목          | 전략                                                                                                  |
| ------------- | ----------------------------------------------------------------------------------------------------- |
| 브랜치 전략   | `master`(프로덕션) ← `develop`(통합) ← `feat/*`(기능별). Phase별로 develop에 머지 후 master로 승격    |
| 커밋 단위     | Task 단위로 커밋하고, 각 Task 완료 시 태그(`v0.1.0-task1` 등) 부여                                    |
| Vercel 롤백   | Vercel Dashboard의 "Instant Rollback"으로 이전 프로덕션 배포로 1클릭 복귀                             |
| 긴급 핫픽스   | `hotfix/*` 브랜치에서 직접 master로 PR, 배포 후 develop에 백머지                                      |
| 환경변수 롤백 | Vercel 환경변수 변경 이력(감사 로그) 활용, 변경 직전 값을 1Password 또는 팀 비밀번호 관리 도구에 기록 |

### 9-3. 장애 대응 절차

1. **감지**: 사용자 제보 또는 Vercel/Supabase 대시보드 에러 모니터링.
2. **판단 (15분 이내)**: 코드 이슈인지 DB 이슈인지 분류.
3. **즉시 복구**: 코드 이슈 → Vercel Instant Rollback. DB 이슈 → 마이그레이션 down 또는 백업 복원.
4. **원인 분석 및 수정**: `hotfix/*` 브랜치에서 수정 → 테스트 → 재배포.
5. **사후 리뷰**: 이번 로드맵의 Risk 섹션에 항목 추가하여 재발 방지.

---

## 부록: 관련 참고 파일

- PRD 원문: `docs/PRD.md`
- 프로젝트 지침: `CLAUDE.md`
- 기존 인증 구현: `app/auth/`, `lib/supabase/`
- Server Actions 베이스: `app/actions/profile.ts`
- 스타일 가이드: `docs/guides/styling-guide.md`, `docs/guides/component-patterns.md`
