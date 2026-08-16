import { NextResponse } from 'next/server';
import APP_CONFIG from '@/config';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Proxy the request to the Spring Boot backend
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return NextResponse.json(
        errorData || { message: 'Login failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // The Spring Boot backend returns the JWT in data.token
    const token = data.token;
    
    if (!token) {
      return NextResponse.json({ message: 'No token received from backend' }, { status: 500 });
    }

    // Create the response object without the token
    const { token: _, ...safeData } = data;
    
    // If backend doesn't return role but it's in the token, we can decode it here and add it to safeData
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
        if (!safeData.role && payload.role) {
          safeData.role = payload.role;
        }
        if (!safeData.userId && payload.userId) {
          safeData.userId = payload.userId;
        }
        if (!safeData.fullName && payload.sub) {
          safeData.fullName = payload.sub;
        }
      }
    } catch(e) {}

    const nextResponse = NextResponse.json({ ...safeData, token });

    // Set the HttpOnly cookie
    nextResponse.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours or align with JWT expiration
    });

    return nextResponse;
  } catch (error) {
    console.error('Login proxy error:', error);
    return NextResponse.json(
      { message: 'Internal server error during login' },
      { status: 500 }
    );
  }
}
