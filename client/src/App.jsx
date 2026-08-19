import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import Navbar from "./components/layout/Navbar";
import ContestantNavbar from "./components/layout/ContestantNavbar";
import Footer from "./components/layout/Footer";
import Landing from "./components/common/Landing";
import PrivacyPolicy from "./components/common/PrivacyPolicy";
import TermsOfService from "./components/common/TermsOfService";
import Compliance from "./components/common/Compliance";
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";
import ForgotPassword from "./components/auth/ForgotPassword";
import VerifyEmail from "./components/auth/VerifyEmail";
import About from "./components/voter/About";
import FAQSection from "./components/home/FAQSection";
import FeaturesSection from "./components/home/FeaturesSection";
import ContactSection from "./components/home/ElectionRequestCTA";
import VoterHome from "./components/voter/VoterHome";
import ElectionList from "./components/voter/ElectionList";
import CastVote from "./components/voter/CastVote";
import ResultsView from "./components/voter/ResultsView";
import VoteHistory from "./components/voter/VoteHistory";
import VoterProfile from "./components/voter/VoterProfile";
import VoterNotifications from "./components/voter/VoterNotifications";
import VoterBookmarks from "./components/voter/VoterBookmarks";
import VoterDashboard from "./components/voter/VoterDashboard";
import VoterSettings from "./components/voter/VoterSettings";
import AnalyticsView from "./components/contestant/AnalyticsView";
import ApplyCandidacy from "./components/contestant/ApplyCandidacy";
import PaymentSuccess from "./components/payment/PaymentSuccess";
import PaymentFailed from "./components/payment/PaymentFailed";
import NotFound from "./components/common/NotFound";
import AdminHome from "./components/admin/AdminHome";
import AdminLayout from "./components/admin/AdminLayout";
import ElectionDetails from "./components/elections/ElectionDetails";
import VotePaymentPage from "./components/payment/VotePaymentPage";
import ContestantProfileCampaign from "./components/contestant/ContestantProfileCampaign";
import ContestantDashboard from "./components/contestant/ContestantDashboard";
import CandidateHistory from "./components/contestant/CandidateHistory";
import PaymentCallback from "./components/payment/PaymentCallback";
import GoogleCallback from "./components/auth/GoogleCallback";
import ResetPassword from "./components/auth/ResetPassword";
import ResetLinkSent from "./components/auth/ResetLinkSent";
import RequestElection from "./components/common/RequestElection";
import SystemSettings from "./components/admin/SystemSettings";
import DashboardOverview from "./components/admin/DashboardOverview";
import Leaderboard from "./components/admin/Leaderboard";
import UserManager from "./components/admin/UserManager";
import ContestantManagement from "./components/admin/CandidateManager";
import ElectionManager from "./components/admin/ElectionManager";
import VoteVerifier from "./components/admin/VoteVerifier";
import FinanceView from "./components/admin/FinanceView";
import ElectionRequestManager from "./components/admin/ElectionRequestManager";
import NotificationCenter from "./components/admin/NotificationCenter";
import AuditLogs from "./components/admin/AuditLogs";
import ElectionDetailView from "./components/admin/ElectionDetailView";
import AdminAnalytics from "./components/admin/AdminAnalytics";
import CreateElectionPage from "./components/admin/CreateElectionPage";
import PastResults from "./components/admin/PastResults";
import MaintenancePage from "./components/common/MaintenancePage";
import api from "./services/api";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Protected({ children, roles }) {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading)
    return <div className="flex justify-center p-10">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center p-10">Loading...</div>;
  }

  if (isAuthenticated) {
    if (user?.role === "ADMIN") {
      return <Navigate to="/admin/dashboard" replace />;
    }

    if (user?.role === "CONTESTANT") {
      return <Navigate to="/contestant/dashboard" replace />;
    }

    return <Navigate to="/voter/dashboard" replace />;
  }

  return children;
}

function AppContent() {
  const location = useLocation();
  const { user } = useAuth();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isContestantRoute = location.pathname.startsWith("/contestant");

  const [maintenance, setMaintenance] = useState({ loading: true, enabled: false });

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const res = await api.get("/maintenance-status");
        setMaintenance({ loading: false, enabled: res.data.maintenanceMode });
      } catch {
        setMaintenance({ loading: false, enabled: false });
      }
    };
    checkMaintenance();
  }, []);

  if (maintenance.loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (maintenance.enabled && user?.role !== "ADMIN") {
    return <MaintenancePage />;
  }

  const hideNavbarPaths = [
    "/login",
    "/register",
    "/forgot-password",
    "/verify-email",
    "/reset-password",
    "/reset-link-sent",
    "/auth/callback",
    "/payment/callback",
    "/voter-profile",
  ];
  const shouldHideNavbar =
    hideNavbarPaths.includes(location.pathname) || isAdminRoute;

  const showContestantNavbar = isContestantRoute && !shouldHideNavbar;
  const showPublicNavbar = !shouldHideNavbar && !isContestantRoute;

  const shouldHideFooter =
    isAdminRoute ||
    isContestantRoute ||
    hideNavbarPaths.includes(location.pathname) ||
    location.pathname === "/request-election";

  return (
    <>
      <ScrollToTop />
      {showPublicNavbar && <Navbar />}
      {showContestantNavbar && <ContestantNavbar />}

      {isAdminRoute ? (
        <Routes>
          <Route
            path="/admin"
            element={
              <Protected roles={["ADMIN"]}>
                <AdminLayout>
                  <DashboardOverview />
                </AdminLayout>
              </Protected>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <Protected roles={["ADMIN"]}>
                <AdminLayout>
                  <DashboardOverview />
                </AdminLayout>
              </Protected>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <Protected roles={["ADMIN"]}>
                <AdminLayout>
                  <AdminAnalytics />
                </AdminLayout>
              </Protected>
            }
          />
          <Route
            path="/admin/leaderboard"
            element={
              <Protected roles={["ADMIN"]}>
                <AdminLayout>
                  <Leaderboard />
                </AdminLayout>
              </Protected>
            }
          />

          <Route
            path="/admin/past-results"
            element={
              <Protected roles={["ADMIN"]}>
                <AdminLayout>
                  <PastResults />
                </AdminLayout>
              </Protected>
            }
          />
          <Route
            path="/admin/users"
            element={
              <Protected roles={["ADMIN"]}>
                <AdminLayout>
                  <UserManager />
                </AdminLayout>
              </Protected>
            }
          />
          <Route
            path="/admin/candidates"
            element={
              <Protected roles={["ADMIN"]}>
                <AdminLayout>
                  <ContestantManagement />
                </AdminLayout>
              </Protected>
            }
          />
          <Route
            path="/admin/elections"
            element={
              <Protected roles={["ADMIN"]}>
                <AdminLayout>
                  <ElectionManager />
                </AdminLayout>
              </Protected>
            }
          />
          <Route
            path="/admin/elections/:id"
            element={
              <Protected roles={["ADMIN"]}>
                <AdminLayout>
                  <ElectionDetailView />
                </AdminLayout>
              </Protected>
            }
          />
          <Route
            path="/admin/elections/create"
            element={
              <Protected roles={["ADMIN"]}>
                <AdminLayout>
                  <CreateElectionPage />
                </AdminLayout>
              </Protected>
            }
          />
          <Route
            path="/admin/create-election"
            element={<Navigate to="/admin/elections/create" replace />}
          />
          <Route
            path="/admin/vote-verifier"
            element={
              <Protected roles={["ADMIN"]}>
                <AdminLayout>
                  <VoteVerifier />
                </AdminLayout>
              </Protected>
            }
          />
          <Route
            path="/admin/finance"
            element={
              <Protected roles={["ADMIN"]}>
                <AdminLayout>
                  <FinanceView />
                </AdminLayout>
              </Protected>
            }
          />
          <Route
            path="/admin/election-requests"
            element={
              <Protected roles={["ADMIN"]}>
                <AdminLayout>
                  <ElectionRequestManager />
                </AdminLayout>
              </Protected>
            }
          />
          <Route
            path="/admin/audit-logs"
            element={
              <Protected roles={["ADMIN"]}>
                <AdminLayout>
                  <AuditLogs />
                </AdminLayout>
              </Protected>
            }
          />
          <Route
            path="/admin/notifications"
            element={
              <Protected roles={["ADMIN"]}>
                <AdminLayout>
                  <NotificationCenter />
                </AdminLayout>
              </Protected>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <Protected roles={["ADMIN"]}>
                <AdminLayout>
                  <SystemSettings />
                </AdminLayout>
              </Protected>
            }
          />
          <Route
            path="/admin/*"
            element={
              <Protected roles={["ADMIN"]}>
                <AdminLayout>
                  <DashboardOverview />
                </AdminLayout>
              </Protected>
            }
          />
        </Routes>
      ) : (
        <main className="min-h-screen">
          <Routes>
            <Route
              path="/voter/home"
              element={<Navigate to="/voter/dashboard" replace />}
            />

            <Route
              path="/"
              element={
                <PublicRoute>
                  <Landing />
                </PublicRoute>
              }
            />

            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/compliance" element={<Compliance />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/auth/callback" element={<GoogleCallback />} />
            <Route path="/about" element={<About />} />
            <Route path="/FAQSection" element={<FAQSection />} />
            <Route path="/FeaturesSection" element={<FeaturesSection />} />
            <Route path="/ContactSection" element={<ContactSection />} />
            <Route path="/elections" element={<ElectionList />} />
            <Route path="/results/:electionId" element={<ResultsView />} />
            <Route path="/elections/:id" element={<ElectionDetails />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/reset-link-sent" element={<ResetLinkSent />} />
            <Route path="/request-election" element={<RequestElection />} />

            <Route
              path="/voter/dashboard"
              element={
                <Protected roles={["VOTER"]}>
                  <VoterDashboard />
                </Protected>
              }
            />
            <Route
              path="/voter/elections"
              element={
                <Protected roles={["VOTER"]}>
                  <ElectionList />
                </Protected>
              }
            />
            <Route
              path="/voter/vote/:electionId"
              element={
                <Protected roles={["VOTER"]}>
                  <CastVote />
                </Protected>
              }
            />
            <Route
              path="/voter/history"
              element={
                <Protected roles={["VOTER"]}>
                  <VoteHistory />
                </Protected>
              }
            />
            <Route
              path="/voter/results"
              element={
                <Protected roles={["VOTER"]}>
                  <ResultsView />
                </Protected>
              }
            />
            <Route
              path="/voter/profile"
              element={
                <Protected roles={["VOTER"]}>
                  <VoterProfile />
                </Protected>
              }
            />
            <Route
              path="/voter-profile"
              element={
                <Protected>
                  <VoterProfile />
                </Protected>
              }
            />
            <Route
              path="/voter-settings"
              element={
                <Protected roles={["VOTER"]}>
                  <VoterSettings />
                </Protected>
              }
            />
            <Route
              path="/voter-notifications"
              element={
                <Protected>
                  <VoterNotifications />
                </Protected>
              }
            />
            <Route
              path="/voter-bookmarks"
              element={
                <Protected>
                  <VoterBookmarks />
                </Protected>
              }
            />

            <Route
              path="/contestant/profile"
              element={
                <Protected roles={["CONTESTANT"]}>
                  <ContestantProfileCampaign />
                </Protected>
              }
            />
            <Route
              path="/contestant/profile-campaign"
              element={
                <Protected roles={["CONTESTANT"]}>
                  <ContestantDashboard />
                </Protected>
              }
            />
            <Route
              path="/contestant/dashboard"
              element={
                <Protected roles={["CONTESTANT"]}>
                  <ContestantDashboard />
                </Protected>
              }
            />
            <Route
              path="/contestant/analytics"
              element={
                <Protected roles={["CONTESTANT"]}>
                  <AnalyticsView />
                </Protected>
              }
            />
            <Route
              path="/contestant/apply"
              element={
                <Protected roles={["VOTER", "CONTESTANT"]}>
                  <ApplyCandidacy />
                </Protected>
              }
            />
            <Route
              path="/contestant/history"
              element={
                <Protected roles={["CONTESTANT"]}>
                  <CandidateHistory />
                </Protected>
              }
            />

            <Route
              path="/payment/success"
              element={
                <Protected>
                  <PaymentSuccess />
                </Protected>
              }
            />
            <Route
              path="/payment/failed"
              element={
                <Protected>
                  <PaymentFailed />
                </Protected>
              }
            />
            <Route
              path="/voter/buy-votes"
              element={
                <Protected roles={["VOTER"]}>
                  <VotePaymentPage />
                </Protected>
              }
            />
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