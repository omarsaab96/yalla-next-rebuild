import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage({ searchParams }) {
  const session = await getAdminSession();
  if (session) redirect('/admin');
  const resolvedSearchParams = await searchParams;

  return (
    <section className="login-page">
      <form action="/api/admin/login" method="post" className="login-panel">
        <p className="section-kicker">admin</p>
        <h1>Sign in</h1>
        {resolvedSearchParams?.error && <p className="form-error">Invalid email or password.</p>}
        <label>
          Email
          <input name="email" type="email" defaultValue="admin@yallatogether.com" required />
        </label>
        <label>
          Password
          <input name="password" type="password" required />
        </label>
        <button type="submit">Sign in</button>
      </form>
    </section>
  );
}
