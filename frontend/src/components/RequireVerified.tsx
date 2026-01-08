import { useAuthStore } from "@/store/useAuthStore";
import VerificationOverlay from "./VerificationOverlay";

interface RequireVerifiedProps {
  children: React.ReactNode;
}

export default function RequireVerified({ children }: RequireVerifiedProps) {
  const { authUser } = useAuthStore();

  // Not logged in - let other guards handle this
  if (!authUser) {
    return <>{children}</>;
  }

  // Unverified - show overlay
  if (!authUser.email_verified) {
    return (
      <div className="relative min-h-full">
        <div className="pointer-events-none blur-xl opacity-50">{children}</div>
        <VerificationOverlay email={authUser.email} />
      </div>
    );
  }

  // Verified - render normally
  return <>{children}</>;
}
