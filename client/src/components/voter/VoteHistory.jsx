import { useState, useEffect } from 'react';
import api from '../../services/api';
import GlassCard from '../common/GlassCard';
import Badge from '../common/Badge';

export default function VoteHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    api.get('/users/me/votes')
      .then(({ data }) => setHistory(data.votes || []))
      .catch(() => {});
  }, []);

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-4">Voting History</h2>
      {history.length === 0 ? (
        <p className="text-sm text-[var(--t2)]">No votes yet.</p>
      ) : (
        history.map((vote) => (
          <GlassCard key={vote.id} className="mb-2 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">{vote.election?.title || 'Election'}</p>
              <p className="text-xs text-[var(--t2)]">Voted: {new Date(vote.votedAt).toLocaleDateString()}</p>
            </div>
            <Badge color="var(--a2)" bg="var(--a2bg)">Counted</Badge>
          </GlassCard>
        ))
      )}
    </div>
  );
}