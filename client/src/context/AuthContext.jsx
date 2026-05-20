import { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      API.get('/auth/me')
        .then((res) => setUser(res.data.data))
        .catch(() => localStorage.clear())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async ({ email, password }) => {
    const { data } = await API.post('/auth/login', { email, password });
    localStorage.setItem('accessToken', data.data.tokens.accessToken);
    localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
    setUser(data.data.user);
    return data;
  };

  // ✅ Updated: includes electionId for contestants
  const register = async ({ name, email, password, role, contestantId, adminKey, electionId }) => {
  console.log("🔵 register called with:", { name, email, role, contestantId, electionId });
  const payload = { name, email, password, role };
  if (role === 'CONTESTANT') {
    payload.contestantId = contestantId;
    if (electionId) payload.electionId = electionId;
  }
  if (role === 'ADMIN') payload.adminKey = adminKey;
  console.log("🔵 sending payload:", payload);

  try {
    const { data } = await API.post('/auth/register', payload);
    console.log("🔵 register response:", data);
    localStorage.setItem('accessToken', data.data.tokens.accessToken);
    localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
    setUser(data.data.user);
    return data;
  } catch (error) {
    console.error("🔵 register error:", error);
    throw error; // rethrow so the calling component can handle it
  }
};

  const logout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};