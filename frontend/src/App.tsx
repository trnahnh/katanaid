import { Route, Routes, Outlet } from "react-router-dom";
import NavBar from "./components/NavBar";
import { Toaster } from "sonner";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/Dashboard";
import GenerativeIdentityPage from "./pages/GenerativeIdentityPage";
import TrafficAnalyticsPage from "./pages/TrafficAnalyticsPage";
import TokenCallbackPage from "./pages/AuthCallbackPage";
import GridBackground from "./components/GridBackground";
import DashboardLayout from "./components/layouts/DashboardLayout";
import RequireVerified from "./components/RequireVerified";

const PublicLayout = () => (
  <>
    {/* Grid Background with cursor effect */}
    <GridBackground
      glowColor="#a855f7"
      glowRadius={180}
      glowIntensity={0.3}
      gridSize={32}
    />
    <NavBar />
    <Outlet />
  </>
);

function App() {
  return (
    <>
      <Toaster position="top-center" />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>
        <Route path="/auth/callback" element={<TokenCallbackPage />} />
        <Route path="/auth/verified" element={<TokenCallbackPage />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route
            path="generative-identity"
            element={
              <RequireVerified>
                <GenerativeIdentityPage />
              </RequireVerified>
            }
          />
          <Route
            path="traffic-analytics"
            element={
              <RequireVerified>
                <TrafficAnalyticsPage />
              </RequireVerified>
            }
          />
        </Route>
      </Routes>
    </>
  );
}

export default App;
