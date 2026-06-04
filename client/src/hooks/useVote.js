import { useState } from 'react';
import { castVote, checkVoted } from '../services/voteService';

export default function useVote(electionId) {
  const [hasVoted, setHasVoted] = useState(false);
  const [voting, setVoting] = useState(false);

  const check = async () => {
    try {
      const { data } = await checkVoted(electionId);
      setHasVoted(data.hasVoted);
    } catch (e) {}
  };

  const vote = async (candidateId) => {
    setVoting(true);
    await castVote({ electionId, candidateId });
    setHasVoted(true);
    setVoting(false);
  };

  return { hasVoted, voting, check, vote };
}