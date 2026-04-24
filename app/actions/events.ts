"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getClaims } from "@/lib/supabase/server";

// 이벤트 생성
export async function createEventAction(formData: FormData) {
  const supabase = await createClient();
  const claims = await getClaims();

  if (!claims) {
    return { error: "로그인이 필요합니다." };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const location = formData.get("location") as string;
  const eventDate = formData.get("eventDate") as string;
  const maxMembers = formData.get("maxMembers")
    ? parseInt(formData.get("maxMembers") as string)
    : null;

  if (!title || !eventDate) {
    return { error: "제목과 날짜는 필수입니다." };
  }

  try {
    const { data, error } = await supabase
      .from("events")
      .insert({
        host_id: claims.sub,
        title,
        description: description || null,
        location: location || null,
        event_date: new Date(eventDate).toISOString(),
        max_members: maxMembers,
        status: "open",
      })
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/protected");
    revalidatePath("/protected/events");
    return { data, success: true };
  } catch {
    return { error: "이벤트 생성에 실패했습니다." };
  }
}

// 이벤트 수정
export async function updateEventAction(eventId: string, formData: FormData) {
  const supabase = await createClient();
  const claims = await getClaims();

  if (!claims) {
    return { error: "로그인이 필요합니다." };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const location = formData.get("location") as string;
  const eventDate = formData.get("eventDate") as string;
  const status = formData.get("status") as string;
  const maxMembers = formData.get("maxMembers")
    ? parseInt(formData.get("maxMembers") as string)
    : null;

  try {
    // 주최자 확인
    const { data: event, error: fetchError } = await supabase
      .from("events")
      .select("host_id")
      .eq("id", eventId)
      .single();

    if (fetchError || !event || event.host_id !== claims.sub) {
      return { error: "권한이 없습니다." };
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description || null;
    if (location !== undefined) updateData.location = location || null;
    if (eventDate) updateData.event_date = new Date(eventDate).toISOString();
    if (status) updateData.status = status;
    if (maxMembers !== null) updateData.max_members = maxMembers;

    const { data, error } = await supabase
      .from("events")
      .update(updateData)
      .eq("id", eventId)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/protected");
    revalidatePath(`/protected/events/${eventId}`);
    return { data, success: true };
  } catch {
    return { error: "이벤트 수정에 실패했습니다." };
  }
}

// 이벤트 참여 신청
export async function joinEventAction(eventId: string) {
  const supabase = await createClient();
  const claims = await getClaims();

  if (!claims) {
    return { error: "로그인이 필요합니다." };
  }

  try {
    const { data, error } = await supabase
      .from("event_members")
      .insert({
        event_id: eventId,
        user_id: claims.sub,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return { error: "이미 참여 신청했습니다." };
      }
      return { error: error.message };
    }

    revalidatePath(`/protected/events/${eventId}`);
    return { data, success: true };
  } catch (err) {
    return { error: "참여 신청에 실패했습니다." };
  }
}

// 참여자 상태 변경 (주최자 전용)
export async function updateMemberStatusAction(
  memberId: string,
  newStatus: "confirmed" | "rejected",
) {
  const supabase = await createClient();
  const claims = await getClaims();

  if (!claims) {
    return { error: "로그인이 필요합니다." };
  }

  try {
    // 멤버 정보 조회
    const { data: member, error: memberError } = await supabase
      .from("event_members")
      .select("event_id")
      .eq("id", memberId)
      .single();

    if (memberError || !member) {
      return { error: "멤버를 찾을 수 없습니다." };
    }

    // 주최자 확인
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("host_id")
      .eq("id", member.event_id)
      .single();

    if (eventError || !event || event.host_id !== claims.sub) {
      return { error: "권한이 없습니다." };
    }

    const { data, error } = await supabase
      .from("event_members")
      .update({ status: newStatus })
      .eq("id", memberId)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidatePath(`/protected/events/${member.event_id}/members`);
    return { data, success: true };
  } catch (err) {
    return { error: "상태 변경에 실패했습니다." };
  }
}

// 카풀 신청
export async function createCarpoolAction(eventId: string, formData: FormData) {
  const supabase = await createClient();
  const claims = await getClaims();

  if (!claims) {
    return { error: "로그인이 필요합니다." };
  }

  const type = formData.get("type") as "driver" | "passenger";
  const note = formData.get("note") as string;

  if (!type) {
    return { error: "운전/탑승 여부를 선택해주세요." };
  }

  try {
    const insertData = {
      event_id: eventId,
      note: note || null,
      status: "open",
      driver_id: type === "driver" ? claims.sub : null,
      passenger_id: type === "passenger" ? claims.sub : null,
    };

    const { data, error } = await supabase
      .from("carpools")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidatePath(`/protected/events/${eventId}/carpool`);
    return { data, success: true };
  } catch (err) {
    return { error: "카풀 신청에 실패했습니다." };
  }
}

// 카풀 매칭 (주최자 전용)
export async function matchCarpoolAction(
  eventId: string,
  driverId: string,
  passengerId: string,
) {
  const supabase = await createClient();
  const claims = await getClaims();

  if (!claims) {
    return { error: "로그인이 필요합니다." };
  }

  try {
    // 주최자 확인
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("host_id")
      .eq("id", eventId)
      .single();

    if (eventError || !event || event.host_id !== claims.sub) {
      return { error: "권한이 없습니다." };
    }

    // 운전자 카풀 조회
    const { data: driverCarpool, error: driverError } = await supabase
      .from("carpools")
      .select("id")
      .eq("event_id", eventId)
      .eq("driver_id", driverId)
      .single();

    if (driverError || !driverCarpool) {
      return { error: "운전자를 찾을 수 없습니다." };
    }

    // 탑승자 카풀 조회
    const { data: passengerCarpool, error: passengerError } = await supabase
      .from("carpools")
      .select("id")
      .eq("event_id", eventId)
      .eq("passenger_id", passengerId)
      .single();

    if (passengerError || !passengerCarpool) {
      return { error: "탑승자를 찾을 수 없습니다." };
    }

    // 운전자 카풀 업데이트 (passenger_id 추가)
    const { error: updateDriverError } = await supabase
      .from("carpools")
      .update({
        passenger_id: passengerId,
        status: "matched",
      })
      .eq("id", driverCarpool.id);

    if (updateDriverError) {
      return { error: updateDriverError.message };
    }

    // 탑승자 카풀 업데이트 (driver_id 추가, status matched)
    const { error: updatePassengerError } = await supabase
      .from("carpools")
      .update({
        driver_id: driverId,
        status: "matched",
      })
      .eq("id", passengerCarpool.id);

    if (updatePassengerError) {
      return { error: updatePassengerError.message };
    }

    revalidatePath(`/protected/events/${eventId}/carpool`);
    return { success: true };
  } catch (err) {
    return { error: "카풀 매칭에 실패했습니다." };
  }
}

// 정산 입력
export async function createSettlementAction(
  eventId: string,
  formData: FormData,
) {
  const supabase = await createClient();
  const claims = await getClaims();

  if (!claims) {
    return { error: "로그인이 필요합니다." };
  }

  const totalCost = formData.get("totalCost")
    ? parseInt(formData.get("totalCost") as string)
    : null;
  const note = formData.get("note") as string;

  if (!totalCost || totalCost <= 0) {
    return { error: "올바른 금액을 입력해주세요." };
  }

  try {
    // 주최자 확인
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("host_id")
      .eq("id", eventId)
      .single();

    if (eventError || !event || event.host_id !== claims.sub) {
      return { error: "권한이 없습니다." };
    }

    // 기존 정산 확인
    const { data: existing } = await supabase
      .from("settlements")
      .select("id")
      .eq("event_id", eventId)
      .single();

    let result;

    if (existing) {
      // 업데이트
      result = await supabase
        .from("settlements")
        .update({
          total_cost: totalCost,
          note: note || null,
        })
        .eq("id", existing.id)
        .select()
        .single();
    } else {
      // 생성
      result = await supabase
        .from("settlements")
        .insert({
          event_id: eventId,
          total_cost: totalCost,
          note: note || null,
        })
        .select()
        .single();
    }

    if (result.error) {
      return { error: result.error.message };
    }

    revalidatePath(`/protected/events/${eventId}/settlement`);
    return { data: result.data, success: true };
  } catch (err) {
    return { error: "정산 입력에 실패했습니다." };
  }
}
