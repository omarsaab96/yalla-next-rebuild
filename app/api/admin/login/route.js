import { redirect } from 'next/navigation';
import { setAdminSession, validateAdminCredentials } from '@/lib/auth';

export async function POST(request) {
  const formData = await request.formData();
  const email = String(formData.get('email') || '');
  const password = String(formData.get('password') || '');

  if (!validateAdminCredentials(email, password)) {
    redirect('/admin/login?error=1');
  }

  await setAdminSession(email);
  redirect('/admin');
}
