import { decodeJwt } from 'jose';
import { cookies } from 'next/headers';

export interface SessionUser {
  sub: string;
  role: string;
  exp: number;
  [key: string]: any;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return null;
  }

  try {
    // Just decode since the backend will do the actual cryptographic verification
    const payload = decodeJwt(token);
    
    // Check expiration
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }

    return payload as unknown as SessionUser;
  } catch (error) {
    console.error('Failed to parse session token', error);
    return null;
  }
}
