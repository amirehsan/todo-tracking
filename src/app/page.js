'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { data: session, status } = useSession();
  const [twitterUrl, setTwitterUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/profiles/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ twitterUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong.');
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <div>Loading session...</div>;
  }

  if (status === 'unauthenticated') {
    return <div>Please sign in to use the analyzer.</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Analyze a Twitter Profile</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={twitterUrl}
          onChange={(e) => setTwitterUrl(e.target.value)}
          placeholder="Enter Twitter Profile URL"
          style={{ width: '300px', padding: '0.5rem' }}
          required
        />
        <button type="submit" disabled={loading} style={{ padding: '0.5rem' }}>
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </form>

      {error && <div style={{ color: 'red', marginTop: '1rem' }}>Error: {error}</div>}

      {result && (
        <div style={{ marginTop: '2rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap', border: '1px solid #ccc', padding: '1rem', background: '#f9f9f9' }}>
          <h3>Analysis for @{result.twitterProfile.username}</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
