import { useState } from "react";
import { axiosInstance } from "@/lib/axios";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface VerificationOverlayProps {
  email: string;
}

export default function VerificationOverlay({
  email,
}: VerificationOverlayProps) {
  const [isResending, setIsResending] = useState(false);

  const handleResend = async () => {
    setIsResending(true);
    try {
      await axiosInstance.post("/auth/resend-verification");
      toast.success("Verification email sent!");
    } catch {
      toast.error("Failed to resend. Try again later.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center -top-60">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Mail className="h-6 w-6" />
          </div>
          <CardTitle>Verify your email to continue</CardTitle>
          <CardDescription>
            We sent a verification link to {email}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button onClick={handleResend} disabled={isResending}>
            {isResending ? "Sending..." : "Resend Verification Email"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
