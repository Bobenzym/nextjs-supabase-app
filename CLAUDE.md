# CLAUDE.md

이 파일은 Claude Code (claude.ai/code)가 이 저장소에서 코드를 작업할 때 참고해야 할 지침을 제공합니다.

## 프로젝트 개요

Next.js 15.5.3 + Supabase + shadcn/ui를 기반으로 한 현대적 인증 및 프로필 관리 애플리케이션입니다.

- **Stack**: Next.js 15.5.3, React 19, TypeScript, Tailwind CSS, Supabase Auth, shadcn/ui
- **Node 버전**: 18+
- **패키지 매니저**: npm

## 개발 명령어

```bash
# 개발 서버 시작 (localhost:3000)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 린트 검사
npm run lint
```

## 프로젝트 구조

### 주요 디렉토리

```
app/                           # App Router 페이지
├── layout.tsx                 # 루트 레이아웃
├── page.tsx                   # 홈페이지
├── auth/                      # 인증 관련 라우트
│   ├── login/page.tsx
│   ├── sign-up/page.tsx
│   ├── forgot-password/page.tsx
│   └── [기타 인증 페이지]
├── protected/                 # 보호된 페이지
│   ├── layout.tsx
│   └── page.tsx
└── actions/                   # Server Actions (form 처리, DB 연동)
    └── profile.ts

components/                    # React 컴포넌트
├── ui/                        # shadcn/ui 컴포넌트
├── [비즈니스 컴포넌트들]     # 로그인폼, 프로필 카드 등

lib/
├── supabase/
│   ├── server.ts             # 서버 클라이언트 (createClient)
│   ├── client.ts             # 클라이언트 클라이언트
│   └── proxy.ts              # 미들웨어용 클라이언트
└── utils.ts                  # 공통 유틸리티 (cn 등)

docs/                         # 프로젝트 문서
└── guides/
    ├── project-structure.md  # 폴더/파일 네이밍 규칙
    ├── component-patterns.md # 컴포넌트 패턴 가이드
    ├── nextjs-15.md         # Next.js 15 필수 규칙
    ├── styling-guide.md     # Tailwind CSS 가이드
    └── [기타 가이드]
```

## 아키텍처 원칙

### 1. Server Components 우선

- 모든 컴포넌트는 기본적으로 Server Components
- 인터랙션(클릭, 입력)이 필요한 경우에만 `'use client'` 추가
- 데이터 페칭은 항상 서버에서 진행

```typescript
// ✅ Server Component (기본)
export default async function UserPage() {
  const user = await getUser()
  return <div>{user.name}</div>
}

// ✅ 클라이언트 컴포넌트는 최소한으로
'use client'
export function LikeButton({ id }: { id: string }) {
  const [liked, setLiked] = useState(false)
  return <button onClick={() => setLiked(!liked)}>❤️</button>
}
```

### 2. async/await Request APIs

Next.js 15.5.3에서는 `params`와 `searchParams`가 Promise입니다.

```typescript
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  // ...
}
```

### 3. Server Actions 패턴

폼 제출, DB 업데이트는 Server Actions로 처리합니다.

```typescript
// app/actions/profile.ts
'use server'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string

  await supabase.from('users').update({ name }).eq('id', userId)
  revalidatePath('/profile')
}

// 컴포넌트에서 사용
<form action={updateProfile}>
  <input name="name" />
  <button type="submit">저장</button>
</form>
```

### 4. Supabase 클라이언트 생성

`lib/supabase/server.ts`의 `createClient()` 사용 (매 함수마다 새로 생성):

```typescript
import { createClient } from "@/lib/supabase/server";

export async function getUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}
```

## 컴포넌트 작성 규칙

### 네이밍 컨벤션

- 폴더/파일: `kebab-case` (e.g., `profile-card.tsx`, `auth-forms/`)
- 컴포넌트명: `PascalCase` (e.g., `ProfileCard()`)
- 함수/변수: `camelCase` (e.g., `getUserName()`)

### 경로 별칭 사용 (금지사항: 상대 경로)

```typescript
// ✅ 올바른 방법
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ❌ 금지
import { Button } from "../../../components/ui/button";
```

### 컴포넌트 크기 제한

- 한 파일 300줄 이하 권장
- 초과 시 관련 기능별로 분리

### 단일 책임 원칙

```typescript
// ✅ 각 컴포넌트가 하나의 명확한 책임
export function UserAvatar({ user }) {
  /* 아바타만 */
}
export function UserStatus({ isOnline }) {
  /* 상태만 */
}

// ❌ 피해야 할 패턴: 너무 많은 책임
export function UserCard({ user }) {
  /* 아바타 + 상태 + 프로필 + 액션... */
}
```

## Tailwind CSS & shadcn/ui

- 모든 스타일링은 Tailwind CSS 활용
- shadcn/ui 컴포넌트 사용 (Button, Card, Input 등)
- 새 shadcn/ui 컴포넌트 추가: `npx shadcn@latest add [component]`
- `cn()` 유틸리티로 클래스명 병합

```typescript
import { cn } from '@/lib/utils'

<div className={cn('px-4 py-2', variant === 'large' && 'px-8 py-4')}>
  컨텐츠
</div>
```

## 주요 기능 영역

### 인증 (Authentication)

- **경로**: `app/auth/`
- **관련 컴포넌트**: `LoginForm`, `SignUpForm`, `ForgotPasswordForm`
- **Server Action**: `app/actions/profile.ts` (아직 확장 필요)
- Supabase Auth 사용 (쿠키 기반)

### 보호된 페이지 (Protected Routes)

- **경로**: `app/protected/`
- 인증된 사용자만 접근 가능
- 미들웨어에서 검증 (구현 필요시)

### 프로필 관리

- **관련 파일**: `app/actions/profile.ts`, `components/profile-*.tsx`
- 사용자 정보 조회/수정 기능

## 문서 참고

개발 시 다음 가이드 문서 참고:

- **`docs/guides/project-structure.md`**: 폴더/파일 구조 및 네이밍 규칙
- **`docs/guides/nextjs-15.md`**: Next.js 15.5.3 필수 규칙 및 새 기능
- **`docs/guides/component-patterns.md`**: React 19 컴포넌트 패턴
- **`docs/guides/styling-guide.md`**: Tailwind CSS & shadcn/ui 사용법
- **`docs/guides/deployment.md`**: 배포 관련 지침

## 코드 품질 체크리스트

새 파일/컴포넌트 작성 후:

- [ ] TypeScript strict 모드 준수
- [ ] ESLint 규칙 통과 (`npm run lint`)
- [ ] 경로 별칭 사용 (@/ 사용)
- [ ] 컴포넌트 크기 300줄 이하
- [ ] Server/Client Components 적절히 분리
- [ ] 접근성(a11y) 고려 (의미있는 HTML, ARIA 속성)
- [ ] 모바일 반응형 확인

## 주의사항

- **환경변수**: `.env.local` 파일 필수 (`.env.example` 참고)
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- **Supabase 클라이언트**: 매 함수마다 새로 생성 (전역 변수 X)
- **Pages Router 금지**: 반드시 App Router 사용
- **getStaticProps/getServerSideProps 금지**: 각각 Server Components, Server Actions 사용

## 참고 자료

- [Next.js 공식 문서](https://nextjs.org)
- [Supabase 공식 문서](https://supabase.com/docs)
- [shadcn/ui 컴포넌트 라이브러리](https://ui.shadcn.com)
- [Tailwind CSS 공식 문서](https://tailwindcss.com)
