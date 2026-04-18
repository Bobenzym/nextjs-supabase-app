// ============================================================
// 프로필 수정 Server Action
// Next.js App Router의 'use server' 지시어 사용
// ============================================================
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ProfileFormState, ProfileUpdate } from "@/types/database";

/**
 * 프로필 수정 Server Action.
 * 폼의 FormData를 받아 현재 로그인 사용자의 프로필을 업데이트합니다.
 * RLS 정책에 의해 자신의 행만 수정 가능합니다.
 */
export async function updateProfileAction(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const supabase = await createClient();

  // getClaims()로 JWT 직접 파싱 (getUser() 대신 - 프로젝트 컨벤션 준수)
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) {
    return { success: false, error: "인증이 필요합니다." };
  }

  const userId = claimsData.claims.sub;

  // FormData에서 허용된 필드만 추출
  const updates: ProfileUpdate = {
    username: (formData.get("username") as string) || null,
    full_name: (formData.get("full_name") as string) || null,
    avatar_url: (formData.get("avatar_url") as string) || null,
    website: (formData.get("website") as string) || null,
    bio: (formData.get("bio") as string) || null,
  };

  // username 중복 체크 (변경하려는 경우만)
  if (updates.username) {
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", updates.username)
      .neq("id", userId)
      .maybeSingle();

    if (existing) {
      return { success: false, error: "이미 사용 중인 사용자명입니다." };
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId);

  if (error) {
    console.error("[updateProfileAction] 프로필 수정 실패:", error.message);
    // Postgres 23505 = unique_violation (username 중복)
    if (error.code === "23505") {
      return { success: false, error: "이미 사용 중인 사용자명입니다." };
    }
    return { success: false, error: "프로필 수정 중 오류가 발생했습니다." };
  }

  // 보호된 페이지 캐시 무효화 → 프로필 즉시 반영
  revalidatePath("/protected");

  return { success: true, error: null };
}
