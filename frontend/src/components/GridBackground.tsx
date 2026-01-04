import { useEffect, useRef } from "react";

interface GridBackgroundProps {
  gridSize?: number;
  glowRadius?: number;
  glowIntensity?: number;
  glowColor?: string;
}

const GridBackground = ({
  gridSize = 40,
  glowRadius = 150,
  glowIntensity = 0.3,
  glowColor = "#a855f7",
}: GridBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const targetRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
    };
    document.addEventListener("mousemove", handleMouseMove);

    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : { r: 168, g: 85, b: 247 };
    };

    let animationId: number;

    const animate = () => {
      const smoothing = 0.15;
      mouseRef.current.x += (targetRef.current.x - mouseRef.current.x) * smoothing;
      mouseRef.current.y += (targetRef.current.y - mouseRef.current.y) * smoothing;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const rgb = hexToRgb(glowColor);
      const { x: mouseX, y: mouseY } = mouseRef.current;

      for (let x = 0; x <= canvas.width; x += gridSize) {
        for (let y = 0; y <= canvas.height; y += gridSize) {
          const dx = mouseX - x;
          const dy = mouseY - y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          let opacity = 0.03;
          let lineWidth = 1;

          if (distance < glowRadius) {
            const intensity = 1 - distance / glowRadius;
            opacity = 0.08 + glowIntensity * intensity;
            lineWidth = 1 + 2 * intensity;
          }

          if (y + gridSize <= canvas.height) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
            ctx.lineWidth = lineWidth;
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + gridSize);
            ctx.stroke();
          }

          if (x + gridSize <= canvas.width) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
            ctx.lineWidth = lineWidth;
            ctx.moveTo(x, y);
            ctx.lineTo(x + gridSize, y);
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      document.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, [gridSize, glowRadius, glowIntensity, glowColor]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};

export default GridBackground;