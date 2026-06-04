import { useState, useEffect } from 'react';
import { getElections } from '../services/electionService';

export default function useElections(params) {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getElections(params)
      .then(({ data }) => setElections(data.elections))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params]);

  return { elections, loading };
}