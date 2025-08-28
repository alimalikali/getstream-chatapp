import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { generateToken, setAuthCookie } from '@/lib/auth';
import { createStreamUser, generateStreamToken } from '@/lib/stream';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Generate Stream user ID
    const streamUserId = uuidv4();

    // Create Stream user
    await createStreamUser(streamUserId, name, email);

    // Create user in database
    const user = await User.create({
      name,
      email,
      password,
      streamUserId,
    });

    // Generate JWT token
    const token = generateToken({
      userId: String(user._id),
      email: user.email,
    });

    // Set cookie
    setAuthCookie(token);

    // Generate Stream token
    const streamToken = generateStreamToken(user.streamUserId);

    // Return user data (without password)
    const userResponse = {
      id: String(user._id),
      name: user.name,
      email: user.email,
      streamUserId: user.streamUserId,
    };

    return NextResponse.json({
      user: userResponse,
      streamToken,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
