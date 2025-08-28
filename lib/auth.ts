import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import User from '@/models/User';
import dbConnect from './db';
import { createStreamUser } from './stream';
import { verifyToken, generateToken, JWTPayload } from './jwt';

export { generateToken };

export async function getCurrentUser(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    
    if (!token) {
      return null;
    }

    const payload = verifyToken(token);
    if (!payload) {
      return null;
    }

  await dbConnect();
  const user = await User.findById(payload.userId).select('-password');
     // Ensure streamUserId exists; create Stream user if missing
  // if (user && !user.streamUserId) {
  //   const streamUserId = useId();
  //   // createStreamUser is from [lib/stream.ts]
  //   await createStreamUser(streamUserId, user.name, user.email);
  //   user.streamUserId = streamUserId;
  //   await user.save();
  // }


    return user;
  } catch (error) {
    return null;
  }
}

export function setAuthCookie(token: string) {
  cookies().set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export function clearAuthCookie() {
  cookies().delete('token');
}
