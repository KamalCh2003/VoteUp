import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// Layout
import Navbar from "./layout/Navbar";
import Footer from "./layout/Footer";
import ProtectedRoute from "./layout/ProtectedRoute";

// Public Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ElectionsPage from "./pages/Elections";
import ResultsPage from "./pages/Results";
import AboutPage from "./pages/About";

// Voter Pages
// import VoterDashboard from "./pages/Voter/Dashboard";
import VoterElections from "./pages/Voter/Elections";
import VoterVote from "./pages/Voter/Vote";
import VoterResults from "./pages/Voter/Results";
import VoterProfile from "./pages/Voter/Profile";
import UserHome from "./pages/Voter/UserHome";

// Contestant Pages
import ContestantDashboard from "./pages/Contestant/Dashboard";
import ContestantCampaign from "./pages/Contestant/Campaign";
import ContestantAnalytics from "./pages/Contestant/Analytics";

// Admin Pages
import AdminHome from "./pages/Admin/AdminHome";
import AdminDashboard from "./pages/Admin/Dashboard";
import AdminElections from "./pages/Admin/Elections";
import AdminCandidates from "./pages/Admin/Candidates";
import AdminUsers from "./pages/Admin/Users";
import AdminAuditLogs from "./pages/Admin/AuditLogs";

function AppContent() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Show Navbar only on Home page */}
      {location.pathname === "/" && <Navbar />}

      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/pages/Elections" element={<ElectionsPage />} />
        <Route path="/pages/Results" element={<ResultsPage />} />
        <Route path="/pages/About" element={<AboutPage />} />
        <Route path="/Results" element={<ResultsPage />} />


        {/* VOTER ROUTES */}
        <Route
          path="/voter/userhome"
          element={
            <ProtectedRoute roles={["VOTER"]}>
              <UserHome />
            </ProtectedRoute>
          }
        />

        <Route
          path="/voter/elections"
          element={
            <ProtectedRoute roles={["VOTER"]}>
              <VoterElections />
            </ProtectedRoute>
          }
        />

        <Route
          path="/voter/vote/:electionId"
          element={
            <ProtectedRoute roles={["VOTER"]}>
              <VoterVote />
            </ProtectedRoute>
          }
        />

        <Route
          path="/voter/results"
          element={
            <ProtectedRoute roles={["VOTER"]}>
              <VoterResults />
            </ProtectedRoute>
          }
        />

        <Route
          path="/voter/results/:electionId"
          element={
            <ProtectedRoute roles={["VOTER"]}>
              <VoterResults />
            </ProtectedRoute>
          }
        />

        <Route
          path="/voter/profile"
          element={
            <ProtectedRoute roles={["VOTER"]}>
              <VoterProfile />
            </ProtectedRoute>
          }
        />

        {/* CONTESTANT ROUTES */}
        <Route
          path="/contestant/dashboard"
          element={
            <ProtectedRoute roles={["CANDIDATE"]}>
              <ContestantDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/contestant/campaign"
          element={
            <ProtectedRoute roles={["CANDIDATE"]}>
              <ContestantCampaign />
            </ProtectedRoute>
          }
        />

        <Route
          path="/contestant/analytics"
          element={
            <ProtectedRoute roles={["CANDIDATE"]}>
              <ContestantAnalytics />
            </ProtectedRoute>
          }
        />

        {/* ADMIN ROUTES */}
        <Route
          path="/admin/adminhome"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AdminHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/elections"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AdminElections />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/candidates"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AdminCandidates />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/audit-logs"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AdminAuditLogs />
            </ProtectedRoute>
          }
        />

        {/* 404 PAGE */}
        <Route
          path="*"
          element={
            <div className="flex min-h-screen flex-col items-center justify-center">
              <h1 className="text-7xl font-bold text-violet-500">
                404
              </h1>

              <p className="mt-4 text-zinc-400">
                Page not found
              </p>
            </div>
          }
        />
      </Routes>

       {/* Show Navbar only on Home page */}
      {location.pathname === "/" && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;