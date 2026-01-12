import { useState, useRef, useEffect, useCallback } from "react";
import { axiosInstance } from "@/lib/axios";

// =============================================================================
// TYPES
// =============================================================================

interface HintConfig {
  start_x: number;
  start_y: number;
  end_x: number;
  end_y: number;
}

interface ChallengeResponse {
  session_id: string;
  challenge: string;
  instruction: string;
  emoji: string;
  hint: HintConfig;
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

export type CaptchaStatus =
  | "idle"
  | "ready"
  | "drawing"
  | "verifying"
  | "success"
  | "failed";

export interface KatanaCaptchaProps {
  onVerified: (token: string) => void;
  onError?: (error: string) => void;
  onStatusChange?: (status: CaptchaStatus) => void;
  width?: number;
  height?: number;
  className?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const DEFAULT_WIDTH = 400;
const DEFAULT_HEIGHT = 280;

// Visual guide colors
const HINT_COLOR = "rgba(168, 85, 247, 0.3)";
const HINT_ACTIVE_COLOR = "rgba(168, 85, 247, 0.6)";
const SLASH_COLOR = "#f97316"; // Orange katana slash
const SLASH_GLOW = "#fbbf24";  // Gold glow

// =============================================================================
// COMPONENT
// =============================================================================

const KatanaCaptcha: React.FC<KatanaCaptchaProps> = ({
  onVerified,
  onError,
  onStatusChange,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  className = "",
}) => {
  // Challenge state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [instruction, setInstruction] = useState<string>("");
  const [emoji, setEmoji] = useState<string>("⚔️");
  const [hint, setHint] = useState<HintConfig | null>(null);
  const [status, setStatus] = useState<CaptchaStatus>("idle");

  // Drawing state
  const pointsRef = useRef<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hasFetchedRef = useRef(false);
  const animationRef = useRef<number | null>(null);

  // ---------------------------------------------------------------------------
  // STATUS HELPER
  // ---------------------------------------------------------------------------

  const updateStatus = useCallback(
    (newStatus: CaptchaStatus) => {
      setStatus(newStatus);
      onStatusChange?.(newStatus);
    },
    [onStatusChange]
  );

  // ---------------------------------------------------------------------------
  // CANVAS HELPERS
  // ---------------------------------------------------------------------------

  const drawHintGuide = useCallback(
    (hintData: HintConfig, active: boolean = false) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const startX = hintData.start_x * canvas.width;
      const startY = hintData.start_y * canvas.height;
      const endX = hintData.end_x * canvas.width;
      const endY = hintData.end_y * canvas.height;

      const color = active ? HINT_ACTIVE_COLOR : HINT_COLOR;

      // Draw dashed line path
      ctx.beginPath();
      ctx.setLineDash([12, 8]);
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw start circle with pulse effect
      const pulseSize = active ? 18 : 14;
      ctx.beginPath();
      ctx.arc(startX, startY, pulseSize, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(startX, startY, pulseSize - 4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.fill();

      // Draw end arrow
      const angle = Math.atan2(endY - startY, endX - startX);
      const arrowSize = active ? 20 : 16;

      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - arrowSize * Math.cos(angle - Math.PI / 6),
        endY - arrowSize * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        endX - arrowSize * Math.cos(angle + Math.PI / 6),
        endY - arrowSize * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      // Draw "START" and "END" labels
      ctx.font = "bold 10px sans-serif";
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.fillText("START", startX, startY - 22);
      ctx.fillText("END", endX, endY + 30);
    },
    []
  );

  const redrawWithHint = useCallback(() => {
    if (!hint) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawHintGuide(hint, isDrawing);
  }, [hint, isDrawing, drawHintGuide]);

  const getCanvasCoords = useCallback(
    (e: React.MouseEvent | React.TouchEvent): Point | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

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
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
        time: Date.now(),
      };
    },
    []
  );

  const drawSlashLine = useCallback((from: Point, to: Point) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw glow effect
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.strokeStyle = SLASH_GLOW;
    ctx.lineWidth = 12;
    ctx.lineCap = "round";
    ctx.globalAlpha = 0.3;
    ctx.stroke();

    // Draw main slash line
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.strokeStyle = SLASH_COLOR;
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.globalAlpha = 1;
    ctx.stroke();

    // Draw bright center
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
  }, []);

  // ---------------------------------------------------------------------------
  // ANIMATIONS
  // ---------------------------------------------------------------------------

  const playSuccessAnimation = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    const maxFrames = 30;

    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw expanding green checkmark
      const progress = frame / maxFrames;
      const scale = 0.5 + progress * 0.5;
      const alpha = 1 - progress * 0.3;

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(scale, scale);
      ctx.globalAlpha = alpha;

      // Checkmark
      ctx.beginPath();
      ctx.moveTo(-30, 0);
      ctx.lineTo(-10, 20);
      ctx.lineTo(30, -20);
      ctx.strokeStyle = "#22c55e";
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();

      ctx.restore();

      if (frame < maxFrames) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animate();
  }, []);

  const playFailAnimation = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    const maxFrames = 20;

    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw red X
      const shake = Math.sin(frame * 0.8) * (1 - frame / maxFrames) * 5;

      ctx.save();
      ctx.translate(canvas.width / 2 + shake, canvas.height / 2);

      ctx.beginPath();
      ctx.moveTo(-25, -25);
      ctx.lineTo(25, 25);
      ctx.moveTo(25, -25);
      ctx.lineTo(-25, 25);
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.stroke();

      ctx.restore();

      if (frame < maxFrames) {
        animationRef.current = requestAnimationFrame(animate);
      } else if (hint) {
        // Redraw hint after animation
        setTimeout(() => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          drawHintGuide(hint, false);
        }, 300);
      }
    };

    animate();
  }, [hint, drawHintGuide]);

  // ---------------------------------------------------------------------------
  // API CALLS
  // ---------------------------------------------------------------------------

  const fetchChallenge = useCallback(async () => {
    updateStatus("idle");

    // Cancel any running animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    try {
      const response = await axiosInstance.post<ChallengeResponse>(
        "/api/captcha/create"
      );
      setSessionId(response.data.session_id);
      setInstruction(response.data.instruction);
      setEmoji(response.data.emoji || "⚔️");
      setHint(response.data.hint);
      pointsRef.current = [];
      updateStatus("ready");

      // Draw hint guide after state update
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawHintGuide(response.data.hint, false);
      }, 0);
    } catch {
      onError?.("Failed to load challenge");
      updateStatus("failed");
    }
  }, [updateStatus, onError, drawHintGuide]);

  const verifyGesture = useCallback(
    async (gesturePoints: Point[]) => {
      if (!sessionId || gesturePoints.length < 2) return;

      updateStatus("verifying");

      const startPoint = gesturePoints[0];
      const endPoint = gesturePoints[gesturePoints.length - 1];
      const durationMs = endPoint.time - startPoint.time;

      try {
        const response = await axiosInstance.post<VerifyResponse>(
          "/api/captcha/verify",
          {
            session_id: sessionId,
            start_x: startPoint.x,
            start_y: startPoint.y,
            end_x: endPoint.x,
            end_y: endPoint.y,
            duration_ms: durationMs,
            point_count: gesturePoints.length,
          }
        );

        if (response.data.success && response.data.token) {
          updateStatus("success");
          playSuccessAnimation();
          onVerified(response.data.token);
        } else {
          updateStatus("failed");
          playFailAnimation();
          onError?.("Wrong slash direction - try again!");
        }
      } catch {
        updateStatus("failed");
        playFailAnimation();
        onError?.("Verification error");
      }
    },
    [sessionId, updateStatus, onVerified, onError, playSuccessAnimation, playFailAnimation]
  );

  // ---------------------------------------------------------------------------
  // EVENT HANDLERS
  // ---------------------------------------------------------------------------

  const handleStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (status !== "ready" && status !== "failed") return;

      const point = getCanvasCoords(e);
      if (!point) return;

      setIsDrawing(true);
      updateStatus("drawing");
      pointsRef.current = [point];

      // Redraw with active hint style
      if (hint) {
        redrawWithHint();
      }
    },
    [status, getCanvasCoords, updateStatus, hint, redrawWithHint]
  );

  const handleMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing) return;

      const point = getCanvasCoords(e);
      if (!point) return;

      // Redraw hint and all previous lines
      if (hint) {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawHintGuide(hint, true);

            // Redraw all previous slash segments
            for (let i = 0; i < pointsRef.current.length - 1; i++) {
              drawSlashLine(pointsRef.current[i], pointsRef.current[i + 1]);
            }
          }
        }
      }

      const lastPoint = pointsRef.current[pointsRef.current.length - 1];
      if (lastPoint) {
        drawSlashLine(lastPoint, point);
      }
      pointsRef.current.push(point);
    },
    [isDrawing, getCanvasCoords, hint, drawHintGuide, drawSlashLine]
  );

  const handleEnd = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    verifyGesture(pointsRef.current);
  }, [isDrawing, verifyGesture]);

  // ---------------------------------------------------------------------------
  // EFFECTS
  // ---------------------------------------------------------------------------

  // Fetch challenge on mount (with Strict Mode protection)
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchChallenge();
  }, [fetchChallenge]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const preventScroll = (e: TouchEvent) => {
      if (isDrawing) e.preventDefault();
    };

    canvas.addEventListener("touchmove", preventScroll, { passive: false });
    return () => canvas.removeEventListener("touchmove", preventScroll);
  }, [isDrawing]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------

  const getInstructionContent = () => {
    switch (status) {
      case "idle":
        return { text: "Loading challenge...", color: "text-muted-foreground" };
      case "ready":
        return { text: instruction, color: "text-foreground" };
      case "drawing":
        return { text: "Release to verify!", color: "text-primary" };
      case "verifying":
        return { text: "Verifying slash...", color: "text-muted-foreground" };
      case "success":
        return { text: "✓ Verified! You're human!", color: "text-green-500" };
      case "failed":
        return { text: "Miss! Click to try again", color: "text-red-500" };
    }
  };

  const instructionInfo = getInstructionContent();

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* Instruction with emoji */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">{emoji}</span>
        <span className={`text-sm font-medium ${instructionInfo.color}`}>
          {instructionInfo.text}
        </span>
      </div>

      {/* Canvas container with visual flair */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className={`rounded-xl touch-none transition-all duration-200
            ${status === "ready" || status === "failed" ? "cursor-crosshair" : "cursor-default"}
            ${status === "success" ? "ring-2 ring-green-500 ring-offset-2 ring-offset-background" : ""}
            ${status === "failed" ? "ring-2 ring-red-500 ring-offset-2 ring-offset-background" : ""}
            ${status === "drawing" ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}
          `}
          style={{
            maxWidth: "100%",
            height: "auto",
            background: "linear-gradient(135deg, hsl(var(--muted)/0.5) 0%, hsl(var(--muted)/0.2) 100%)",
            boxShadow: isDrawing
              ? "0 0 30px rgba(249, 115, 22, 0.3), inset 0 0 60px rgba(168, 85, 247, 0.05)"
              : "inset 0 0 60px rgba(168, 85, 247, 0.05)",
          }}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        />

        {/* Overlay hint for first-time users */}
        {status === "ready" && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-muted-foreground/60 bg-background/80 px-2 py-1 rounded">
            Draw from START → END
          </div>
        )}
      </div>

      {/* Retry button */}
      {status === "failed" && (
        <button
          onClick={fetchChallenge}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
        >
          <span>🔄</span>
          <span>New Challenge</span>
        </button>
      )}

      {/* Success badge */}
      {status === "success" && (
        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-500 rounded-lg text-sm font-medium">
          <span>⚔️</span>
          <span>Katana Master!</span>
        </div>
      )}
    </div>
  );
};

export default KatanaCaptcha;
