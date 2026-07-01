import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getElection } from '../../services/electionService';
import useVote from '../../hooks/useVote';   
import GlassCard from '../common/GlassCard';
import Button from '../common/Button';
import { useToast } from '../../context/ToastContext';

export default function CastVote() {
  const { electionId } = useParams();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const { hasVoted, vote, check } = useVote(electionId);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    getElection(electionId).then(({ data }) => {
      setElection(data.election);
      setCandidates(data.election.candidates);
    });
    check();
  }, [electionId]);

  const handleVote = async () => {
    if (!selected) return;
    try {
      await vote(selected);
      toast.success('Vote cast!');
      navigate(`/voter/results/${electionId}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Vote failed');
    }
  };

  if (hasVoted) {
    return <GlassCard className="text-center mt-8">You have already voted in this election.</GlassCard>;
  }

  return (
    <div className="max-w-lg mx-auto mt-6">
      <h2 className="text-base font-semibold mb-4">{election?.title}</h2>
      <div className="space-y-2">
        {candidates.map(c => (
          <div key={c.id}
               onClick={() => setSelected(c.id)}
               className={`p-3 rounded-xl border cursor-pointer transition ${selected === c.id ? 'border-[var(--a2)] bg-[var(--a2bg)]' : 'border-[var(--gb)] bg-[var(--glass)]'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--a2bg)] flex items-center justify-center">👤</div>
              <div>
                <p className="text-sm font-medium">{c.user.firstName} {c.user.lastName}</p>
                <p className="text-xs text-[var(--t2)]">{c.party || 'Independent'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {selected && !showConfirm && (
        <Button className="w-full mt-4" onClick={() => setShowConfirm(true)}>Proceed to Vote</Button>
      )}
      {showConfirm && (
        <div className="mt-4 p-4 rounded-xl bg-[var(--bg3)] border border-[var(--gb)] text-center">
          <p className="text-sm mb-3">Confirm your vote for <strong>{candidates.find(c => c.id === selected)?.user.firstName}</strong>? This cannot be changed.</p>
          <div className="flex gap-2 justify-center">
            <Button variant="secondary" onClick={() => setShowConfirm(false)}>Cancel</Button>
            <Button onClick={handleVote}>Confirm Vote</Button>
          </div>
        </div>
      )}
    </div>
  );
}