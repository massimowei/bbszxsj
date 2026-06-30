'use server';

import { cookies } from 'next/headers';
import crypto from 'node:crypto';

const SESSION_COOKIE_NAME = 'admin_session';
const SESSION_MAX_AGE = 86400; // 24 hours

function getSessionSecret() {
  return process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || 'fallback-insecure-secret';
}

function signToken(token) {
  const secret = getSessionSecret();
  return crypto.createHmac('sha256', secret).update(token).digest('hex');
}

function createSignedToken() {
  const token = crypto.randomBytes(32).toString('hex');
  const signature = signToken(token);
  return `${token}.${signature}`;
}

function verifySignedToken(signedToken) {
  if (!signedToken || typeof signedToken !== 'string') return false;
  const parts = signedToken.split('.');
  if (parts.length !== 2) return false;
  const [token, signature] = parts;
  if (!token || !signature) return false;
  const expectedSignature = signToken(token);
  try {
    const a = Buffer.from(signature, 'hex');
    const b = Buffer.from(expectedSignature, 'hex');
    if (a.length !== b.length || a.length === 0) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function login(username, password) {
  const envUser = process.env.ADMIN_USERNAME || 'admin';
  const envPass = process.env.ADMIN_PASSWORD || 'password';

  if (username === envUser && password === envPass) {
    const cookieStore = await cookies();
    const signedToken = createSignedToken();
    cookieStore.set(SESSION_COOKIE_NAME, signedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: SESSION_MAX_AGE,
    });
    return { success: true };
  }
  return { success: false, error: '账号或密码错误' };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function checkAuth() {
  const cookieStore = await cookies();
  const signedToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return verifySignedToken(signedToken);
}
