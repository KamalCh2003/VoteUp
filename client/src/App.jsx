import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import ElectionList from './components/voter/ElectionList';    // also used as public
import CastVote from './components/voter/CastVote';
import ResultsView from './components/voter/ResultsView';    // also used as public
import VoteHistory from './components/voter/VoteHistory';
import VoterProfile from './components/voter/VoterProfile';
import ContestantDashboard from './components/contestant/ContestantDashboard';
import ContestantProfile from './components/contestant/ContestantProfile';
import CampaignManager from './components/contestant/CampaignManager';
import AnalyticsView from './components/contestant/AnalyticsView';
import ApplyCandidacy from './components/contestant/ApplyCandidacy';
import CandidacyPayment from './components/payment/CandidacyPayment';
import PremiumPlans from './components/payment/PremiumPlans';
import PaymentSuccess from './components/payment/PaymentSuccess';
import PaymentFailed from './components/payment/PaymentFailed';
import Wallet from './components/payment/Wallet';
import NotFound from './components/common/NotFound';
import AdminHome from './components/admin/AdminHome';
import ElectionDetails from './components/elections/ElectionDetails';
import VotePaymentPage from './components/payment/VotePaymentPage';

function Protected({ children, roles }) {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <div className="flex justify-center p-10">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
}

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isContestantRoute = location.pathname.startsWith('/contestant');

  return (
    <>
      {!isAdminRoute && !isContestantRoute && <Navbar />}
      {isContestantRoute && <ContestantNavbar />}

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
            <Route path="/about" element={<About />} />
            <Route path="/elections" element={<ElectionList />} />
            <Route path="/results" element={<ResultsView />} />
            <Route path="/results/:electionId" element={<ResultsView />} />

            {/* Voter – protected actions */}
            <Route path="/voter/home" element={<Protected roles={['VOTER']}><VoterHome /></Protected>} />
            <Route path="/voter/vote/:electionId" element={<Protected roles={['VOTER']}><CastVote /></Protected>} />
            <Route path="/voter/history" element={<Protected roles={['VOTER']}><VoteHistory /></Protected>} />
            <Route path="/voter/profile" element={<Protected roles={['VOTER']}><VoterProfile /></Protected>} />
            <Route path="/elections/:id" element={<Protected roles={['VOTER']}><ElectionDetails /></Protected>} />

            {/* Contestant */}
            <Route path="/contestant/dashboard" element={<Protected roles={['CONTESTANT']}><ContestantDashboard /></Protected>} />
            <Route path="/contestant/profile" element={<Protected roles={['CONTESTANT']}><ContestantProfile /></Protected>} />
            <Route path="/contestant/campaign" element={<Protected roles={['CONTESTANT']}><CampaignManager /></Protected>} />
            <Route path="/contestant/analytics" element={<Protected roles={['CONTESTANT']}><AnalyticsView /></Protected>} />
            <Route path="/contestant/apply" element={<Protected roles={['VOTER', 'CONTESTANT']}><ApplyCandidacy /></Protected>} />

            {/* Payment */}
            <Route path="/payment/candidacy" element={<Protected><CandidacyPayment /></Protected>} />
            <Route path="/payment/plans" element={<Protected><PremiumPlans /></Protected>} />
            <Route path="/payment/success" element={<Protected><PaymentSuccess /></Protected>} />
            <Route path="/payment/failed" element={<Protected><PaymentFailed /></Protected>} />
            <Route path="/payment/wallet" element={<Protected><Wallet /></Protected>} />
            <Route path="/voter/buy-votes" element={<Protected roles={['VOTER']}><VotePaymentPage /></Protected>} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      )}
      {!isAdminRoute && !isContestantRoute && <Footer />}
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