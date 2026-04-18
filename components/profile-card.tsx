// ============================================================
// 프로필 정보 표시 카드 (읽기 전용, 서버 컴포넌트)
// ============================================================
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Profile } from "@/types/database";

interface ProfileCardProps {
  profile: Profile;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          {profile.full_name ?? "이름 미설정"}
        </CardTitle>
        {profile.username && (
          <p className="text-sm text-muted-foreground">@{profile.username}</p>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {profile.bio && <p className="text-sm">{profile.bio}</p>}
        {profile.website && (
          <a
            href={profile.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-500 hover:underline"
          >
            {profile.website}
          </a>
        )}
        <p className="text-xs text-muted-foreground">
          가입일: {new Date(profile.created_at).toLocaleDateString("ko-KR")}
        </p>
      </CardContent>
    </Card>
  );
}
