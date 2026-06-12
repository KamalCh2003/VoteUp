// src/components/auth/GoogleCallback.jsx
import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GoogleCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuth();
  const processed = useRef(false); // prevents double processing

  useEffect(() => {
    // Avoid running twice (React StrictMode or manual revisits)
    if (processed.current) return;
    
    const params = new URLSearchParams(location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const userParam = params.get('user');

    if (accessToken && refreshToken && userParam) {
      processed.current = true;
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        setAuth(user, accessToken, refreshToken);
        
        // Show success only once
        toast.success('Google login successful!');
        
        // Clean URL parameters (optional, prevents re-trigger)
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Redirect based on role
        switch (user.role) {
          case 'ADMIN':
            navigate('/admin', { replace: true });
            break;
          case 'CONTESTANT':
            navigate('/contestant/profile-campaign', { replace: true });
            break;
          default:
            navigate('/voter/home', { replace: true });
        }
      } catch (err) {
        console.error('Google callback error:', err);
        toast.error('Invalid authentication data');
        navigate('/login', { replace: true });
      }
    } else {
      toast.error('Google login failed - missing tokens');
      navigate('/login', { replace: true });
    }
  }, [location.search, setAuth, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-violet-600" size={40} />
    </div>
  );
}