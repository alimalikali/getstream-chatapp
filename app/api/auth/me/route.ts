import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { generateStreamToken } from '@/lib/stream';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Generate Stream token
    const streamToken = generateStreamToken(user.streamUserId);

    return NextResponse.json({
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        streamUserId: user.streamUserId,
      },
      streamToken,
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
