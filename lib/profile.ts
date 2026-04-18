// ============================================================
// 프로필 관련 서버 사이드 유틸 함수
// createClient()는 요청마다 새로 생성 (Fluid compute 권고사항 준수)
// ============================================================
"use server";

import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

/**
 * 현재 로그인한 사용자의 프로필을 조회합니다.
 * getClaims()로 파싱한 claims.sub를 userId로 사용합니다.
 */
export async function getMyProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) return null;

  const userId = claimsData.claims.sub; // JWT subject = auth.users.id

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("[getMyProfile] 프로필 조회 실패:", error.message);
    return null;
  }
  return data;
}

/**
 * 특정 userId의 프로필을 조회합니다 (공개 프로필 조회용).
 */
export async function getProfileById(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) return null;
  return data;
}
