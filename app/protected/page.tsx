import { Suspense } from "react";
import { redirect } from "next/navigation";
import { InfoIcon } from "lucide-react";
import { ProfileCard } from "@/components/profile-card";
import { ProfileEditForm } from "@/components/profile-edit-form";
import { FetchDataSteps } from "@/components/tutorial/fetch-data-steps";
import { getMyProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";

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
    <div className="flex w-full flex-1 flex-col gap-12">
      <div className="w-full">
        <div className="flex items-center gap-3 rounded-md bg-accent p-3 px-5 text-sm text-foreground">
          <InfoIcon size="16" strokeWidth={2} />
          인증된 사용자만 볼 수 있는 보호된 페이지입니다.
        </div>
      </div>

      {/* 프로필 섹션 */}
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">내 프로필</h2>
        <Suspense fallback={<p className="text-sm">프로필 불러오는 중...</p>}>
          <ProfileSection />
        </Suspense>
      </div>

      <div className="flex flex-col items-start gap-2">
        <h2 className="mb-4 text-2xl font-bold">Your user details</h2>
        <pre className="max-h-32 overflow-auto rounded border p-3 font-mono text-xs">
          <Suspense>
            <UserDetails />
          </Suspense>
        </pre>
      </div>
      <div>
        <h2 className="mb-4 text-2xl font-bold">Next steps</h2>
        <FetchDataSteps />
      </div>
    </div>
  );
}
