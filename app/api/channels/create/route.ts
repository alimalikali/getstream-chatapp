import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createChannel, serverClient } from '@/lib/stream';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { channelType = 'messaging', channelId, members } = await request.json();

    if (!channelId || !members) {
      return NextResponse.json(
        { error: 'Channel ID and members array are required' },
        { status: 400 }
      );
    }

    // Ensure the current user is included in members
    // const allMembers = Array.from(new Set([...members, user.streamUserId]));

    // const channel = await createChannel(
    //   channelType,
    //   channelId,
    //   allMembers,
    //   user.streamUserId
    // );
    const channel = serverClient.channel('messaging', channelId);
    await channel.addMembers([members]);

    return NextResponse.json({
      channel: {
        id: channel.id,
        type: channel.type,
        members: members,
      },
    });
  } catch (error: any) {
    console.error('Create channel error:', error);
    return NextResponse.json(
      { error: 'Failed to create channel' },
      { status: 500 }
    );
  }
}
