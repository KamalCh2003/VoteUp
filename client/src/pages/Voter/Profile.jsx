import { useAuth } from '../../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      <p className="text-gray-400">Name: {user.name}</p>
      <p className="text-gray-400">Email: {user.email}</p>
      <p className="text-gray-400">Role: {user.role}</p>
    </div>
  );
};
export default Profile;
