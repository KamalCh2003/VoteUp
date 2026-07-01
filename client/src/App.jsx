// client/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/layout/Navbar';
import ContestantNavbar from './components/layout/ContestantNavbar';
import Footer from './components/layout/Footer';
import Landing from './components/common/Landing';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ForgotPassword from './components/auth/ForgotPassword';
import VerifyEmail from './components/auth/VerifyEmail';
import About from './components/voter/About';
import VoterHome from './components/voter/VoterHome';
import ElectionList from './components/voter/ElectionList';
import CastVote from './components/voter/CastVote';
import ResultsView from './components/voter/ResultsView';
import VoteHistory from './components/voter/VoteHistory';
import VoterProfile from './components/voter/VoterProfile';
import AnalyticsView from './components/contestant/AnalyticsView';
import ApplyCandidacy from './components/contestant/ApplyCandidacy';
import CandidacyPayment from './components/payment/CandidacyPayment';
import PaymentSuccess from './components/payment/PaymentSuccess';
import PaymentFailed from './components/payment/PaymentFailed';
import NotFound from './components/common/NotFound';
import AdminHome from './components/admin/AdminHome';
import ElectionDetails from './components/elections/ElectionDetails';
import VotePaymentPage from './components/payment/VotePaymentPage';
import ContestantProfileCampaign from './components/contestant/ContestantProfileCampaign';
import ContestantDashboard from './components/contestant/ContestantDashboard';
import CandidateHistory from './components/contestant/CandidateHistory';
import PaymentCallback from './components/payment/PaymentCallback';
import GoogleCallback from './components/auth/GoogleCallback';
import ResetPassword from './components/auth/ResetPassword';
import ResetLinkSent from './components/auth/ResetLinkSent';

// Scroll‑to‑top component
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Protected({ children, roles }) {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <div className="flex justify-center p-10">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
}

function AppContent() {
  const location = useLocation();
  const { user } = useAuth();
  const isAdminRoute = location.pathname.startsWith('/admin');

  const hideNavbarPaths = ['/login', '/register', '/forgot-password', '/verify-email', '/reset-password', '/reset-link-sent', '/auth/callback', '/payment/callback', '/voter-profile'];
  const shouldHideNavbar = hideNavbarPaths.includes(location.pathname);

  const showContestantNavbar = !shouldHideNavbar && !isAdminRoute && user?.role === 'CONTESTANT';
  const showPublicNavbar = !shouldHideNavbar && !isAdminRoute && !showContestantNavbar;

  const shouldHideFooter = isAdminRoute || hideNavbarPaths.includes(location.pathname) || location.pathname === '/request-election';

  return (
    <>
      <ScrollToTop />
      {/* <Toaster position="top-right" /> */}
      {showPublicNavbar && <Navbar />}
      {showContestantNavbar && <ContestantNavbar />}

      {isAdminRoute ? (
        <Routes>
          <Route path="/admin" element={<Protected roles={['ADMIN']}><AdminHome /></Protected>} />
          <Route path="/admin/*" element={<Protected roles={['ADMIN']}><AdminHome /></Protected>} />
        </Routes>
      ) : (
        <main className="min-h-screen px-4 py-4 max-w-7xl mx-auto">
          <Routes>
            {/* Public pages */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/auth/callback" element={<GoogleCallback />} />
            <Route path="/about" element={<About />} />
            <Route path="/elections" element={<ElectionList />} />
            <Route path="/results" element={<ResultsView />} />
            <Route path="/results/:electionId" element={<ResultsView />} />
            <Route path="/elections/:id" element={<ElectionDetails />} />
            <Route path="/reset-password" element={<ResetPassword />} />
           <Route path="/reset-link-sent" element={<ResetLinkSent />} />

            {/* Voter routes */}
            <Route path="/voter/home" element={<Protected roles={['VOTER']}><VoterHome /></Protected>} />
            <Route path="/voter/vote/:electionId" element={<Protected roles={['VOTER']}><CastVote /></Protected>} />
            <Route path="/voter/history" element={<Protected roles={['VOTER']}><VoteHistory /></Protected>} />
            <Route path="/voter/profile" element={<Protected roles={['VOTER']}><VoterProfile /></Protected>} />
            <Route path="/history" element={<Protected roles={['VOTER']}><VoteHistory /></Protected>} />
            <Route path="/voter-profile" element={<Protected><VoterProfile /></Protected>} />

            {/* Contestant routes */}
            <Route path="/contestant/profile-campaign" element={<Protected roles={['CONTESTANT']}><ContestantProfileCampaign /></Protected>} />
            <Route path="/contestant/dashboard" element={<Protected roles={['CONTESTANT']}><ContestantDashboard /></Protected>} />
            <Route path="/contestant/analytics" element={<Protected roles={['CONTESTANT']}><AnalyticsView /></Protected>} />
            <Route path="/contestant/apply" element={<Protected roles={['VOTER', 'CONTESTANT']}><ApplyCandidacy /></Protected>} />
            <Route path="/contestant/history" element={<Protected roles={['CONTESTANT']}><CandidateHistory /></Protected>} />
            {/* Payment routes */}
            <Route path="/payment/candidacy" element={<Protected><CandidacyPayment /></Protected>} />
            <Route path="/payment/success" element={<Protected><PaymentSuccess /></Protected>} />
            <Route path="/payment/failed" element={<Protected><PaymentFailed /></Protected>} />
            <Route path="/voter/buy-votes" element={<Protected roles={['VOTER']}><VotePaymentPage /></Protected>} />
            <Route path="/payment/callback" element={<PaymentCallback />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      )}
      {!shouldHideFooter && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}