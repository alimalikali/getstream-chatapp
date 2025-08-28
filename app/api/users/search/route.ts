// app/api/users/search/route.ts
import { NextResponse } from "next/server";
import { StreamChat } from "stream-chat";

const serverClient = StreamChat.getInstance(
  process.env.NEXT_PUBLIC_STREAM_KEY!,   // public key
  process.env.STREAM_SECRET!             // 🔒 secret key
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  if (q.length < 2) {
    return NextResponse.json({ users: [] });
  }

  try {
    const { users } = await serverClient.queryUsers(
      { name: { $autocomplete: q } },
      { last_active: -1 },
      { limit: 10 }
    );

    return NextResponse.json({ users });
  } catch (err) {
    console.error("Stream query error:", err);
    return NextResponse.json({ users: [] }, { status: 500 });
  }
}
