import { cookies } from 'next/headers';

export interface SessionUser {
  sub: string;
  role: string;
  exp: number;
  [key: string]: any;
}

function decodeJwtPayload(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return null;
  }

  try {
    // Just decode since the backend will do the actual cryptographic verification
    const payload = decodeJwtPayload(token);
    if (!payload) return null;
    
    // Check expiration
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }

    return payload as SessionUser;
  } catch (error) {
    console.error('Failed to parse session token', error);
    return null;
  }
}
