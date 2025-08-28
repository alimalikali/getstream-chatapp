import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createDirectChannel } from '@/lib/stream';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { otherStreamUserId } = await request.json();
    if (!otherStreamUserId) {
      return NextResponse.json({ error: 'otherStreamUserId is required' }, { status: 400 });
    }

    const members = [user.streamUserId, otherStreamUserId];

    const channel = await createDirectChannel(members, user.streamUserId);

    return NextResponse.json({
      channel: {
        id: channel.id,
        type: channel.type,
        members,
      },
    });
  } catch (err: any) {
    console.error('Direct channel create error:', err);
    return NextResponse.json({ error: 'Failed to create direct channel' }, { status: 500 });
  }
}
