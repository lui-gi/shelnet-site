const CACHE_KEY = 'shelnet_news_cache';
const CACHE_TIMESTAMP_KEY = 'shelnet_news_timestamp';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

async function fetchNews() {
  const baseUrl = import.meta.env.VITE_RESOURCES_BASE_URL || 'https://lui-gi.github.io/shelnet-resources';
  const newsUrl = `${baseUrl}/news.md`;

  try {
    // Check cache first
    const cachedNews = sessionStorage.getItem(CACHE_KEY);
    const cacheTimestamp = sessionStorage.getItem(CACHE_TIMESTAMP_KEY);
    const now = Date.now();

    if (cachedNews && cacheTimestamp) {
      const age = now - parseInt(cacheTimestamp, 10);
      if (age < CACHE_TTL) {
        console.log('[newsService] Using cached news');
        return cachedNews;
      }
    }

    // Fetch fresh news
    console.log('[newsService] Fetching news from:', newsUrl);

    const response = await fetch(newsUrl, {
      cache: 'no-cache',
      headers: {
        'Accept': 'text/plain, text/markdown, */*'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const newsText = await response.text();

    // Cache the result
    sessionStorage.setItem(CACHE_KEY, newsText);
    sessionStorage.setItem(CACHE_TIMESTAMP_KEY, now.toString());

    return newsText;

  } catch (error) {
    console.error('[newsService] Error fetching news:', error);

    // Fallback to stale cache if available
    const staleCache = sessionStorage.getItem(CACHE_KEY);
    if (staleCache) {
      console.warn('[newsService] Using stale cache as fallback');
      return staleCache;
    }

    // If no cache, throw error to trigger fallback to hardcoded news
    throw error;
  }
}

export { fetchNews };
