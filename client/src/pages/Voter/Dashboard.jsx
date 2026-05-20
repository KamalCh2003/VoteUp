import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';   // ← ADD THIS
import API from '../../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState({ active: 0, voted: 0 });

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const { data } = await API.get('/elections?status=ACTIVE');
        setStats({ active: data.data.length, voted: 0 });
      } catch (e) {
        toast.error('Failed to load dashboard');
      }
    };
    fetchElections();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Voter Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white/5 p-4 rounded-lg">
          <p className="text-gray-400">Active Elections</p>
          <p className="text-2xl font-bold text-purple-400">{stats.active}</p>
        </div>
        <div className="bg-white/5 p-4 rounded-lg">
          <p className="text-gray-400">Votes Cast</p>
          <p className="text-2xl font-bold text-green-400">0</p>
        </div>
      </div>
      <Link to="/voter/elections" className="text-purple-400 hover:underline">
        View all elections →
      </Link>
    </div>
  );
};

export default Dashboard;