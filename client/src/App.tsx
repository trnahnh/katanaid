import { Route, Routes, Outlet } from "react-router-dom";
import NavBar from "./components/NavBar";
import { Toaster } from "sonner";
import LandingPage from "./pages/public-pages/LandingPage";
import LoginPage from "./pages/public-pages/LoginPage";
import SignupPage from "./pages/public-pages/SignupPage";
import DashboardPage from "./pages/service-pages/Dashboard";
import GenerativeIdentityPage from "./pages/service-pages/GenerativeIdentityPage";
import TrafficAnalyticsPage from "./pages/service-pages/TrafficAnalyticsPage";
import TokenCallbackPage from "./pages/public-pages/AuthCallbackPage";
import GridBackground from "./components/GridBackground";
import DashboardLayout from "./components/layouts/DashboardLayout";
import RequireVerified from "./components/RequireVerified";
import EmailServicePage from "./pages/service-pages/EmailServicePage";
import EmailFraudPage from "./pages/service-pages/EmailFraudPage";

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
          <Route
            path="email-service"
            element={
              <RequireVerified>
                <EmailServicePage />
              </RequireVerified>
            }
          />
          <Route
            path="email-fraud"
            element={
              <RequireVerified>
                <EmailFraudPage />
              </RequireVerified>
            }
          />
        </Route>
      </Routes>
    </>
  );
}

export default App;
