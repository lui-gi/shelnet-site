import { useState, useEffect, useRef } from 'react';
import { fetchNews } from './newsService';

export function useNews() {
  const [newsText, setNewsText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    async function loadNews() {
      try {
        setLoading(true);
        setError(null);

        const news = await fetchNews();

        if (isMounted.current) {
          setNewsText(news);
          setLoading(false);
        }
      } catch (err) {
        console.error('[useNews] Failed to load news:', err);
        if (isMounted.current) {
          setError(err.message || 'Failed to load news');
          setLoading(false);
        }
      }
    }

    loadNews();

    return () => {
      isMounted.current = false;
    };
  }, []);

  return { newsText, loading, error };
}
