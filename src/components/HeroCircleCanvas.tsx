"use client";

import { useEffect, useRef } from "react";

export default function HeroCircleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2 };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
    };

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    // Create circle grid items matching reference image
    const rows = 4;
    const cols = 7;
    const items: Array<{
      baseXRatio: number;
      baseYRatio: number;
      phase: number;
      radius: number;
    }> = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        items.push({
          baseXRatio: (c + 0.5) / cols + (r % 2 === 1 ? 0.04 : -0.04),
          baseYRatio: (r + 0.5) / rows,
          phase: Math.random() * Math.PI * 2,
          radius: Math.min(width, height) * 0.085,
        });
      }
    }

    let time = 0;

    const render = () => {
      time += 0.02;
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      ctx.clearRect(0, 0, width, height);

      // Radial background gradient matching the vibrant primary blue
      const bgGrad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        100,
        width / 2,
        height / 2,
        Math.max(width, height)
      );
      bgGrad.addColorStop(0, "#3770ff");
      bgGrad.addColorStop(1, "#2563eb");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw interactive circle grid
      items.forEach((item) => {
        const baseX = item.baseXRatio * width;
        const baseY = item.baseYRatio * height;

        const pulse = Math.sin(time + item.phase) * 6;
        const distToMouse = Math.hypot(mouse.x - baseX, mouse.y - baseY);
        const maxDist = 320;
        const factor = Math.max(0, 1 - distToMouse / maxDist);

        const currentRadius = Math.max(22, item.radius + pulse + factor * 26);
        const offsetX = (mouse.x - baseX) * factor * 0.15;
        const offsetY = (mouse.y - baseY) * factor * 0.15;

        const circleX = baseX + offsetX;
        const circleY = baseY + offsetY;

        ctx.save();
        ctx.beginPath();
        ctx.arc(circleX, circleY, currentRadius, 0, Math.PI * 2);

        // Soft gradient for light blue/white circles
        const circleGrad = ctx.createRadialGradient(
          circleX - currentRadius * 0.3,
          circleY - currentRadius * 0.3,
          currentRadius * 0.1,
          circleX,
          circleY,
          currentRadius
        );

        const opacity = 0.8 + factor * 0.2;
        circleGrad.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
        circleGrad.addColorStop(0.7, `rgba(224, 242, 254, ${opacity * 0.9})`);
        circleGrad.addColorStop(1, `rgba(186, 230, 253, ${opacity * 0.75})`);

        ctx.fillStyle = circleGrad;
        ctx.shadowColor = "rgba(255, 255, 255, 0.4)";
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block absolute inset-0 pointer-events-none"
    />
  );
}
