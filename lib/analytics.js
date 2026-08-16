import { getDb, hasMongoConfig } from '@/lib/mongo';

export async function recordPageView({ path, lang, referrer, query, userAgent }) {
  if (!hasMongoConfig()) return;
  const db = await getDb();
  await db.collection('analytics').insertOne({
    path: path || '/',
    lang: lang || 'en',
    referrer: referrer || '',
    query: query || '',
    userAgent: userAgent || '',
    createdAt: new Date()
  });
}

export async function getAnalyticsSummary() {
  if (!hasMongoConfig()) {
    return {
      totalViews: 0,
      todayViews: 0,
      topPages: [],
      languages: [],
      recentViews: []
    };
  }

  const db = await getDb();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalViews, todayViews, topPages, languages, recentViews] = await Promise.all([
    db.collection('analytics').countDocuments(),
    db.collection('analytics').countDocuments({ createdAt: { $gte: today } }),
    db.collection('analytics')
      .aggregate([
        { $group: { _id: '$path', views: { $sum: 1 } } },
        { $sort: { views: -1 } },
        { $limit: 10 }
      ])
      .toArray(),
    db.collection('analytics')
      .aggregate([
        { $group: { _id: '$lang', views: { $sum: 1 } } },
        { $sort: { views: -1 } }
      ])
      .toArray(),
    db.collection('analytics').find({}).sort({ createdAt: -1 }).limit(20).toArray()
  ]);

  return {
    totalViews,
    todayViews,
    topPages: topPages.map((item) => ({ path: item._id, views: item.views })),
    languages: languages.map((item) => ({ lang: item._id || 'unknown', views: item.views })),
    recentViews: recentViews.map((item) => ({
      path: item.path,
      lang: item.lang,
      referrer: item.referrer,
      createdAt: item.createdAt?.toISOString?.() || ''
    }))
  };
}
