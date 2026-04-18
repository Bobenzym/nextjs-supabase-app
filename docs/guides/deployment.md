# 📦 Vercel 배포 가이드

## 사전 준비

### 1. Vercel 계정 생성

- [vercel.com](https://vercel.com) 방문
- GitHub 계정으로 로그인
- 프로젝트 import

### 2. 환경 변수 설정

Vercel 프로젝트의 **Settings > Environment Variables**에서 다음을 추가합니다:

```
NOTION_API_KEY=<your-notion-api-key>
NOTION_BLOG_DATABASE_ID=<your-notion-database-id>
NEXT_PUBLIC_SITE_URL=<your-production-url>
```

**Notion API Key 받기:**

1. [Notion Integrations](https://www.notion.so/my-integrations) 접속
2. 새 통합 생성
3. 데이터베이스와 연결
4. API Key 복사

**Notion Database ID 찾기:**

1. Notion 데이터베이스 공유 링크에서 복사
2. URL 형식: `https://notion.so/{database_id}?v={view_id}`

## 배포 체크리스트

- [ ] 모든 테스트 통과 (`npm run check-all`)
- [ ] 빌드 성공 (`npm run build`)
- [ ] Notion API Key 준비
- [ ] Notion Database ID 준비
- [ ] Production URL 결정
- [ ] 환경 변수 Vercel에 설정
- [ ] GitHub 푸시

## 배포 단계

### 1. GitHub에 푸시

```bash
git push origin main
```

### 2. Vercel 자동 배포

- GitHub과 연결된 Vercel은 자동으로 배포 시작
- Deployments 탭에서 진행상황 확인

### 3. 배포 검증

- Production URL에서 접속 확인
- 모든 페이지 로드 확인
- 포스트 표시 확인

## E2E 검증 체크리스트

배포 후 다음 기능들을 테스트합니다:

### 블로그 목록

- [ ] `/blog` 페이지 로드
- [ ] 포스트 카드 표시
- [ ] 페이지네이션 동작
- [ ] 검색 폼 표시

### 블로그 상세

- [ ] `/blog/[slug]` 포스트 표시
- [ ] 커버 이미지 로드
- [ ] 본문 콘텐츠 렌더링
- [ ] 목차(TOC) 동작
- [ ] 관련 포스트 링크

### 필터

- [ ] `/blog/category/[category]` 작동
- [ ] `/blog/tag/[tag]` 작동
- [ ] 사이드바 필터 링크 작동

### 검색

- [ ] 검색 폼 작동
- [ ] 검색 결과 표시
- [ ] 페이지네이션 작동

### SEO

- [ ] `/sitemap.xml` 접근 가능
- [ ] `/robots.txt` 접근 가능
- [ ] `/api/feed.xml` 접근 가능 (RSS)

### 성능

- [ ] 캐시 헤더 확인 (DevTools)
- [ ] 이미지 최적화 확인
- [ ] Core Web Vitals 검사 (PageSpeed Insights)
  - LCP < 2.5초
  - FID < 100ms
  - CLS < 0.1

## 문제 해결

### 포스트가 표시되지 않음

1. Notion API Key 확인
2. Database ID 확인
3. 포스트 Status가 'published'인지 확인
4. Notion 데이터베이스 구조 확인

### 이미지가 로드되지 않음

1. 커버 이미지 URL 확인
2. CORS 설정 확인
3. Next/Image 설정 확인

### 캐시 문제

1. Vercel 대시보드에서 캐시 초기화
2. Notion 웹훅 테스트 (`/api/notion/sync`)
3. 브라우저 캐시 초기화

## 웹훅 설정 (선택)

Notion 데이터베이스 변경 시 자동으로 캐시 무효화하려면:

1. Notion Integration 설정에서 웹훅 활성화
2. 웹훅 URL: `https://yourdomain.com/api/notion/sync`
3. 이벤트: Database items (created, updated, deleted)

## 모니터링

### Vercel Analytics

- Real-time analytics 확인
- Error tracking
- Performance metrics

### Next.js Analytics

- Web Vitals 모니터링
- Build time 추적

## 다음 단계

배포 후 고려할 사항:

1. **커스텀 도메인** - Vercel에서 도메인 연결
2. **SSL/TLS** - Vercel에서 자동 제공
3. **CDN** - Vercel의 Edge Network 활용
4. **팀 협업** - Vercel Teams 설정
5. **모니터링** - Sentry 등 에러 추적 서비스 연결

## 유용한 링크

- [Vercel 문서](https://vercel.com/docs)
- [Next.js 배포](https://nextjs.org/learn/basics/deploying-nextjs-app)
- [Notion API](https://developers.notion.com)
- [PageSpeed Insights](https://pagespeed.web.dev/)
