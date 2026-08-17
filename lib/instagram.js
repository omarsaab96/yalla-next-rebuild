const DEFAULT_INSTAGRAM_PROFILE_URL = 'https://www.instagram.com/yallatogether/';

function getInstagramConfig() {
  return {
    accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
    apiVersion: process.env.INSTAGRAM_API_VERSION || 'v26.0',
    profileUrl: process.env.INSTAGRAM_PROFILE_URL || DEFAULT_INSTAGRAM_PROFILE_URL,
    userId: process.env.INSTAGRAM_USER_ID
  };
}

function normalizeMediaItem(item) {
  const imageUrl = item.media_type === 'VIDEO' ? item.thumbnail_url : item.media_url;
  if (!imageUrl) return null;

  return {
    id: item.id,
    imageUrl,
    caption: item.caption || 'Yalla Together Instagram post',
    permalink: item.permalink || DEFAULT_INSTAGRAM_PROFILE_URL,
    timestamp: item.timestamp || ''
  };
}

export async function getInstagramFeed(limit = 6) {
  const { accessToken, apiVersion, profileUrl, userId } = getInstagramConfig();

  if (!accessToken || !userId) {
    return {
      items: [],
      profileUrl,
      source: 'fallback'
    };
  }

  const fields = 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp';
  const url = new URL(`https://graph.facebook.com/${apiVersion}/${userId}/media`);
  url.searchParams.set('fields', fields);
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('access_token', accessToken);

  try {
    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (!response.ok) {
      console.error(`Instagram feed request failed: ${response.status} ${response.statusText}`);
      return { items: [], profileUrl, source: 'fallback' };
    }

    const payload = await response.json();
    const items = Array.isArray(payload.data)
      ? payload.data.map(normalizeMediaItem).filter(Boolean)
      : [];

    return {
      items,
      profileUrl,
      source: 'instagram'
    };
  } catch (error) {
    console.error('Instagram feed request failed:', error);
    return { items: [], profileUrl, source: 'fallback' };
  }
}
