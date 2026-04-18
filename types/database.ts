// ============================================================
// Supabase 데이터베이스 타입 정의
// ============================================================

/** profiles 테이블 행(Row) 타입 - SELECT 결과 */
export type Profile = {
  id: string; // uuid (auth.users.id와 동일)
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  website: string | null;
  bio: string | null;
  created_at: string; // ISO 8601 timestamptz
  updated_at: string;
};

/** 프로필 수정 시 허용되는 필드만 추출 (id, created_at은 변경 불가) */
export type ProfileUpdate = Pick<
  Profile,
  "username" | "full_name" | "avatar_url" | "website" | "bio"
>;

/** 프로필 수정 폼의 입력 상태 타입 */
export type ProfileFormState = {
  success: boolean;
  error: string | null;
};
