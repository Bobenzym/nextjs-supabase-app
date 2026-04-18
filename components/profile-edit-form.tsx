// ============================================================
// 프로필 수정 폼 (클라이언트 컴포넌트)
// React 19의 useActionState + Next.js Server Action 사용
// ============================================================
"use client";

import { useActionState } from "react";
import { updateProfileAction } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Profile, ProfileFormState } from "@/types/database";

interface ProfileEditFormProps {
  profile: Profile;
}

const initialState: ProfileFormState = { success: false, error: null };

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateProfileAction,
    initialState
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">프로필 수정</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <div className="flex flex-col gap-4">
            {/* 사용자명 */}
            <div className="grid gap-2">
              <Label htmlFor="username">사용자명</Label>
              <Input
                id="username"
                name="username"
                placeholder="my_username"
                defaultValue={profile.username ?? ""}
              />
              <p className="text-xs text-muted-foreground">
                3~30자, 영문·숫자·언더스코어(_)만 사용 가능
              </p>
            </div>

            {/* 이름 */}
            <div className="grid gap-2">
              <Label htmlFor="full_name">이름</Label>
              <Input
                id="full_name"
                name="full_name"
                placeholder="홍길동"
                defaultValue={profile.full_name ?? ""}
              />
            </div>

            {/* 웹사이트 */}
            <div className="grid gap-2">
              <Label htmlFor="website">웹사이트</Label>
              <Input
                id="website"
                name="website"
                type="url"
                placeholder="https://example.com"
                defaultValue={profile.website ?? ""}
              />
            </div>

            {/* 자기소개 */}
            <div className="grid gap-2">
              <Label htmlFor="bio">자기소개</Label>
              <Input
                id="bio"
                name="bio"
                placeholder="자기소개를 입력하세요"
                defaultValue={profile.bio ?? ""}
              />
            </div>

            {/* 성공/에러 메시지 */}
            {state.success && (
              <p className="text-sm text-green-600">프로필이 수정되었습니다.</p>
            )}
            {state.error && (
              <p className="text-sm text-red-500">{state.error}</p>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "저장 중..." : "저장"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
