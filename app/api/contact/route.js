import { NextResponse } from 'next/server';
import { formDataToFields, saveFormSubmission } from '@/lib/formSubmissions';

function getField(fields, ...names) {
  for (const name of names) {
    const value = fields[name];
    if (Array.isArray(value) ? value.some(Boolean) : value) return Array.isArray(value) ? value[0] : value;
  }
  return '';
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request) {
  const formData = await request.formData();
  const fields = formDataToFields(formData);
  const name = getField(fields, 'your-name', 'name');
  const email = getField(fields, 'your-email', 'email');
  const subject = getField(fields, 'your-subject', 'subject');

  if (!name || !email || !subject || !isValidEmail(email)) {
    return NextResponse.redirect(new URL('/contact/?sent=invalid', request.url), 303);
  }

  try {
    await saveFormSubmission({
      formName: 'contact',
      fields,
      metadata: {
        path: '/contact',
        userAgent: request.headers.get('user-agent') || ''
      }
    });

    return NextResponse.redirect(new URL('/contact/?sent=1', request.url), 303);
  } catch {
    return NextResponse.redirect(new URL('/contact/?sent=0', request.url), 303);
  }
}
