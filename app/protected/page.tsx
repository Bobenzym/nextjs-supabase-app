import { redirect } from "next/navigation";
import { Suspense } from "react";
import { InfoIcon } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getMyProfile } from "@/lib/profile";
import { ProfileCard } from "@/components/profile-card";
import { ProfileEditForm } from "@/components/profile-edit-form";
import { FetchDataSteps } from "@/components/tutorial/fetch-data-steps";

async function UserDetails() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return JSON.stringify(data.claims, null, 2);
}

// 프로필 섹션: getClaims() 인증 확인 + DB 조회를 함께 처리
async function ProfileSection() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const profile = await getMyProfile();

  if (!profile) {
    // 트리거가 아직 실행되지 않은 엣지 케이스 대비
    return (
      <p className="text-sm text-muted-foreground">
        프로필을 불러올 수 없습니다. 잠시 후 다시 시도해주세요.
      </p>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <ProfileCard profile={profile} />
      <ProfileEditForm profile={profile} />
    </div>
  );
}

export default function ProtectedPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          인증된 사용자만 볼 수 있는 보호된 페이지입니다.
        </div>
      </div>

      {/* 프로필 섹션 */}
      <div className="flex flex-col gap-4">
        <h2 className="font-bold text-2xl">내 프로필</h2>
        <Suspense fallback={<p className="text-sm">프로필 불러오는 중...</p>}>
          <ProfileSection />
        </Suspense>
      </div>

      <div className="flex flex-col gap-2 items-start">
        <h2 className="font-bold text-2xl mb-4">Your user details</h2>
        <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
          <Suspense>
            <UserDetails />
          </Suspense>
        </pre>
      </div>
      <div>
        <h2 className="font-bold text-2xl mb-4">Next steps</h2>
        <FetchDataSteps />
      </div>
    </div>
  );
}
