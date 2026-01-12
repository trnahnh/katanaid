import { useState, useRef, useEffect, useCallback } from "react";
import { axiosInstance } from "@/lib/axios";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// =============================================================================
// TYPES
// =============================================================================

interface ChallengeResponse {
  session_id: string;
  challenge: string;
  instruction: string;
  expires_in: number;
}

interface VerifyResponse {
  success: boolean;
  token?: string;
}

interface Point {
  x: number;
  y: number;
  time: number;
}

type CaptchaStatus = "idle" | "ready" | "drawing" | "verifying" | "success" | "failed";

// =============================================================================
// CONSTANTS
// =============================================================================

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 300;
const STROKE_COLOR = "#a855f7"; // Purple to match your theme
const STROKE_WIDTH = 4;

// =============================================================================
// COMPONENT
// =============================================================================

const CaptchaPage = () => {
  // Challenge state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [instruction, setInstruction] = useState<string>("");
  const [status, setStatus] = useState<CaptchaStatus>("idle");
  const [verificationToken, setVerificationToken] = useState<string | null>(null);

  // Drawing state
  const [points, setPoints] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef<number>(0);

  // ---------------------------------------------------------------------------
  // FETCH CHALLENGE
  // ---------------------------------------------------------------------------

  const fetchChallenge = async () => {
    setStatus("idle");
    setVerificationToken(null);
    clearCanvas();

    try {
      const response = await axiosInstance.post<ChallengeResponse>("/api/captcha/create");
      setSessionId(response.data.session_id);
      setInstruction(response.data.instruction);
      setStatus("ready");
    } catch (error) {
      toast.error("Failed to load challenge");
      setStatus("failed");
    }
  };

  // ---------------------------------------------------------------------------
  // VERIFY GESTURE
  // ---------------------------------------------------------------------------

  const verifyGesture = async () => {
    if (!sessionId || points.length < 2) return;

    setStatus("verifying");

    const startPoint = points[0];
    const endPoint = points[points.length - 1];
    const durationMs = endPoint.time - startPoint.time;

    try {
      const response = await axiosInstance.post<VerifyResponse>("/api/captcha/verify", {
        session_id: sessionId,
        start_x: startPoint.x,
        start_y: startPoint.y,
        end_x: endPoint.x,
        end_y: endPoint.y,
        duration_ms: durationMs,
        point_count: points.length,
      });

      if (response.data.success) {
        setStatus("success");
        setVerificationToken(response.data.token || null);
        toast.success("Verification successful!");
      } else {
        setStatus("failed");
        toast.error("Verification failed. Try again.");
      }
    } catch (error) {
      setStatus("failed");
      toast.error("Verification error");
    }
  };

  // ---------------------------------------------------------------------------
  // CANVAS DRAWING
  // ---------------------------------------------------------------------------

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setPoints([]);
  };

  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;

    if ("touches" in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
      time: Date.now(),
    };
  };

  const drawLine = useCallback((from: Point, to: Point) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.strokeStyle = STROKE_COLOR;
    ctx.lineWidth = STROKE_WIDTH;
    ctx.lineCap = "round";
    ctx.stroke();
  }, []);

  // ---------------------------------------------------------------------------
  // EVENT HANDLERS
  // ---------------------------------------------------------------------------

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (status !== "ready" && status !== "failed") return;

    const point = getCanvasCoords(e);
    if (!point) return;

    clearCanvas();
    setIsDrawing(true);
    setStatus("drawing");
    startTimeRef.current = Date.now();
    setPoints([point]);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;

    const point = getCanvasCoords(e);
    if (!point) return;

    setPoints((prev) => {
      const lastPoint = prev[prev.length - 1];
      if (lastPoint) {
        drawLine(lastPoint, point);
      }
      return [...prev, point];
    });
  };

  const handleEnd = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    verifyGesture();
  };

  // ---------------------------------------------------------------------------
  // EFFECTS
  // ---------------------------------------------------------------------------

  useEffect(() => {
    fetchChallenge();
  }, []);

  // Prevent scrolling while drawing on touch devices
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const preventScroll = (e: TouchEvent) => {
      if (isDrawing) {
        e.preventDefault();
      }
    };

    canvas.addEventListener("touchmove", preventScroll, { passive: false });
    return () => canvas.removeEventListener("touchmove", preventScroll);
  }, [isDrawing]);

  // ---------------------------------------------------------------------------
  // STATUS DISPLAY
  // ---------------------------------------------------------------------------

  const getStatusBadge = () => {
    switch (status) {
      case "idle":
        return <Badge variant="secondary">Loading...</Badge>;
      case "ready":
        return <Badge className="bg-blue-500">Ready</Badge>;
      case "drawing":
        return <Badge className="bg-yellow-500">Drawing...</Badge>;
      case "verifying":
        return <Badge variant="secondary">Verifying...</Badge>;
      case "success":
        return <Badge className="bg-green-500">Verified!</Badge>;
      case "failed":
        return <Badge className="bg-red-500">Failed</Badge>;
    }
  };

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* CAPTCHA Demo Card */}
      <Card>
        <CardHeader>
          <CardTitle>Katana Slash CAPTCHA</CardTitle>
          <CardDescription>
            Draw the gesture pattern to verify you're human.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status and Instruction */}
          <div className="flex items-center justify-between">
            {getStatusBadge()}
            <span className="text-sm text-muted-foreground">{instruction}</span>
          </div>

          {/* Canvas */}
          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="border rounded-lg bg-muted/30 cursor-crosshair touch-none"
              onMouseDown={handleStart}
              onMouseMove={handleMove}
              onMouseUp={handleEnd}
              onMouseLeave={handleEnd}
              onTouchStart={handleStart}
              onTouchMove={handleMove}
              onTouchEnd={handleEnd}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <Button
              variant="outline"
              onClick={fetchChallenge}
              disabled={status === "verifying"}
            >
              New Challenge
            </Button>
            {status === "failed" && (
              <Button onClick={fetchChallenge}>Try Again</Button>
            )}
          </div>

          {/* Success Token Display */}
          {status === "success" && verificationToken && (
            <div className="p-4 border rounded-lg bg-green-500/10 space-y-2">
              <p className="text-sm font-medium text-green-600">
                Verification Token (valid for 5 minutes):
              </p>
              <code className="text-xs break-all block p-2 bg-muted rounded">
                {verificationToken}
              </code>
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Documentation Card */}
      <Card>
        <CardHeader>
          <CardTitle>API Reference</CardTitle>
          <CardDescription>
            Integrate Katana CAPTCHA into your application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">1. Create Challenge</h4>
            <code className="text-sm block p-3 bg-muted rounded">
              POST /api/captcha/create
            </code>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">2. Verify Gesture</h4>
            <code className="text-sm block p-3 bg-muted rounded whitespace-pre">{`POST /api/captcha/verify
{
  "session_id": "...",
  "start_x": 350, "start_y": 50,
  "end_x": 50, "end_y": 250,
  "duration_ms": 450,
  "point_count": 28
}`}</code>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">3. Use Token</h4>
            <p className="text-sm text-muted-foreground">
              Include the verification token in protected requests to prove the user passed CAPTCHA.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CaptchaPage;