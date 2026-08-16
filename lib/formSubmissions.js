import { getDb, hasMongoConfig } from '@/lib/mongo';

function normalizeFormValue(current, next) {
  if (current === undefined) return next;
  if (Array.isArray(current)) return [...current, next];
  return [current, next];
}

export function serializeSubmission(submission) {
  return {
    ...submission,
    _id: submission._id?.toString?.() || submission._id,
    createdAt: submission.createdAt?.toISOString?.() || submission.createdAt
  };
}

export async function saveFormSubmission({ formName = 'contact', fields = {}, metadata = {} }) {
  if (!hasMongoConfig()) {
    throw new Error('MONGODB_URI is not configured.');
  }

  const db = await getDb();
  const submission = {
    formName,
    fields,
    metadata,
    createdAt: new Date()
  };
  const result = await db.collection('formSubmissions').insertOne(submission);
  return { ...submission, _id: result.insertedId };
}

export async function getFormSubmissions() {
  if (!hasMongoConfig()) return [];

  const db = await getDb();
  const submissions = await db
    .collection('formSubmissions')
    .find({})
    .sort({ createdAt: -1 })
    .limit(200)
    .toArray();

  return submissions.map(serializeSubmission);
}

export function formDataToFields(formData) {
  const fields = {};

  for (const [name, value] of formData.entries()) {
    if (!name || name.startsWith('_')) continue;
    const normalizedValue = typeof value === 'string' ? value.trim() : value.name || '';
    if (!normalizedValue) continue;
    fields[name] = normalizeFormValue(fields[name], normalizedValue);
  }

  return fields;
}
