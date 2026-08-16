import crypto from 'crypto';
import { cookies } from 'next/headers';

const sessionCookie = 'yalla_admin_session';

function getSecret() {
  return process.env.AUTH_SECRET || 'local-development-auth-secret';
}

function sign(value) {
  return crypto.createHmac('sha256', getSecret()).update(value).digest('hex');
}

export function createSessionValue(email) {
  const payload = Buffer.from(JSON.stringify({ email, issuedAt: Date.now() })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function verifySessionValue(value) {
  if (!value || !value.includes('.')) return null;
  const [payload, signature] = value.split('.');
  if (signature !== sign(payload)) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    const maxAge = 1000 * 60 * 60 * 24 * 7;
    if (!session.email || Date.now() - session.issuedAt > maxAge) return null;
    return session;
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  return verifySessionValue(cookieStore.get(sessionCookie)?.value);
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) throw new Error('Unauthorized');
  return session;
}

export async function setAdminSession(email) {
  const cookieStore = await cookies();
  cookieStore.set(sessionCookie, createSessionValue(email), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookie);
}

export function validateAdminCredentials(email, password) {
  return email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD;
}
