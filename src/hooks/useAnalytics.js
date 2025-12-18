import { useEffect, useState } from 'react';

export const useAnalytics = (id, title, type) => {
  const [views, setViews] = useState(0);

  useEffect(() => {
    if (!id) return;

    // 1. Increment View (Only once per session per item)
    const sessionKey = `viewed_${id}`;
    const hasViewed = sessionStorage.getItem(sessionKey);

    if (!hasViewed) {
      // API call to increment view
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, title, type }),
      }).catch(err => console.error("Tracking Error", err));

      // Mark as viewed in this session
      sessionStorage.setItem(sessionKey, 'true');
    }

  }, [id, title, type]);

  return null; // Ye hook bas background me kaam karega
};

// Data Fetch karne ke liye alag function
export const useAnalyticsData = () => {
    const [rankings, setRankings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/analytics')
            .then(res => res.json())
            .then(data => {
                if(data.success) setRankings(data.data);
                setLoading(false);
            })
            .catch(err => setLoading(false));
    }, []);

    return { rankings, loading };
}