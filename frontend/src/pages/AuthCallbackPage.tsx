import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "sonner";
import { LucideLoader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setOAuthToken } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      toast.error(`OAuth error: ${error}`);
      navigate("/login");
      return;
    }

    if (token) {
      setOAuthToken(token);
      navigate("/dashboard");
    } else {
      toast.error("No token received from OAuth provider.");
      navigate("/login");
    }
  }, [searchParams, navigate, setOAuthToken]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <LucideLoader2 className="size-8 animate-spin" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}
