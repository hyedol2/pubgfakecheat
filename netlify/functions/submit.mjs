import { getStore } from "@netlify/blobs";

export default async (request, context) => {
  if (request.method !== "POST") {
    return Response.json(
      { error: "POST만 허용됩니다." },
      { status: 405 }
    );
  }

  try {
    const body = await request.json();
    const word = body.word?.trim();

    if (!word || word.length > 100) {
      return Response.json(
        { error: "잘못된 단어입니다." },
        { status: 400 }
      );
    }

    const store = getStore("submissions");

    const data =
      await store.get("data.json", {
        type: "json",
        consistency: "strong"
      }) || [];

    data.push({
      ip: context.ip || "unknown",
      word: word,
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