import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import toast from 'react-hot-toast';

const Vote = () => {
  const { electionId } = useParams();
  const [election, setElection] = useState(null);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    API.get(`/elections/${electionId}`)
      .then(res => setElection(res.data.data))
      .catch(() => toast.error('Election not found'));
  }, [electionId]);

  const castVote = async () => {
    if (!selected) return toast.error('Select a candidate');
    try {
      await API.post('/votes', { electionId, candidateId: selected });
      toast.success('Vote cast!');
      navigate('/voter/results/' + electionId);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Voting failed');
    }
  };

  if (!election) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{election.title}</h1>
      <p className="text-gray-400 mb-6">Choose your candidate</p>
      <div className="grid grid-cols-2 gap-4 mb-8">
        {election.candidates.map(c => (
          <div
            key={c.id}
            onClick={() => setSelected(c.id)}
            className={`p-4 rounded-xl border cursor-pointer ${selected === c.id ? 'border-green-400 bg-green-400/10' : 'border-white/10 bg-white/5'}`}
          >
            <h3 className="font-semibold">{c.name}</h3>
            <p className="text-sm text-gray-400">{c.party}</p>
            <p className="text-xs">{c._count?.votes || 0} votes</p>
          </div>
        ))}
      </div>
      <button onClick={castVote} disabled={!selected} className="bg-green-600 disabled:bg-gray-600 text-white px-6 py-2 rounded-full">Confirm Vote</button>
    </div>
  );
};
export default Vote;