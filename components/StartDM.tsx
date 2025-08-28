'use client';

import { useState } from 'react';
import { UserSearch } from './UserSearch';

export function StartDM({ onChannel }: { onChannel?: (channel: any) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = async (otherUserId: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/channels/direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otherStreamUserId: otherUserId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create/open channel');
        return;
      }

      if (onChannel) onChannel(data.channel);
    } catch (err) {
      console.error('StartDM error', err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="w-full">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Start a Direct Message</h3>
          {loading && <div className="spinner" aria-hidden />}
        </div>

        <UserSearch onSelect={handleSelect} />

        {error && (
          <div className="text-sm text-destructive bg-destructive-foreground/5 p-2 rounded">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default StartDM;
