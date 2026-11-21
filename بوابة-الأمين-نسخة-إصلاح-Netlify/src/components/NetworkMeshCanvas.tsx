import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';

interface MeshNode {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  radius: number;
  isGold: boolean;
}

export function NetworkMeshCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId = 0;
    let width = 0;
    let height = 0;
    let pointerX = 0.5;
    let pointerY = 0.5;
    let targetPointerX = 0.5;
    let targetPointerY = 0.5;

    const nodes: MeshNode[] = [];
    const nodeCount = 28;

    const initNodes = () => {
      nodes.length = 0;
      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          z: 0.45 + Math.random() * 0.75,
          vx: (Math.random() - 0.5) * 0.28,
          vy: (Math.random() - 0.5) * 0.28,
          radius: 1.3 + Math.random() * 1.8,
          isGold: i % 7 === 0,
        });
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width || window.innerWidth;
      height = rect.height || 640;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (nodes.length === 0) {
        initNodes();
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (shouldReduceMotion) return;
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      targetPointerX = (e.clientX - rect.left) / rect.width;
      targetPointerY = (e.clientY - rect.top) / rect.height;
    };

    const drawFrame = () => {
      ctx.clearRect(0, 0, width, height);

      pointerX += (targetPointerX - pointerX) * 0.04;
      pointerY += (targetPointerY - pointerY) * 0.04;

      const offsetX = (pointerX - 0.5) * 20;
      const offsetY = (pointerY - 0.5) * 14;

      if (!shouldReduceMotion) {
        for (const node of nodes) {
          node.x += node.vx * node.z;
          node.y += node.vy * node.z;

          if (node.x < -30) node.x = width + 30;
          if (node.x > width + 30) node.x = -30;
          if (node.y < -30) node.y = height + 30;
          if (node.y > height + 30) node.y = -30;
        }
      }

      const maxDist = Math.min(185, Math.max(125, width * 0.14));

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        const ax = a.x + offsetX * a.z;
        const ay = a.y + offsetY * a.z;

        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const bx = b.x + offsetX * b.z;
          const by = b.y + offsetY * b.z;

          const dx = ax - bx;
          const dy = ay - by;
          const dist = Math.hypot(dx, dy);

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.24;
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
            if (a.isGold || b.isGold) {
              ctx.strokeStyle = `rgba(214, 181, 109, ${alpha * 0.72})`;
            } else {
              ctx.strokeStyle = `rgba(34, 211, 238, ${alpha})`;
            }
            ctx.lineWidth = 0.85;
            ctx.stroke();
          }
        }
      }

      for (const node of nodes) {
        const nx = node.x + offsetX * node.z;
        const ny = node.y + offsetY * node.z;

        ctx.beginPath();
        ctx.arc(nx, ny, node.radius * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = node.isGold
          ? 'rgba(214, 181, 109, 0.12)'
          : 'rgba(34, 211, 238, 0.12)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(nx, ny, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.isGold
          ? 'rgba(214, 181, 109, 0.82)'
          : 'rgba(34, 211, 238, 0.85)';
        ctx.fill();
      }
    };

    resize();
    drawFrame();

    const animate = () => {
      drawFrame();
      animationFrameId = window.requestAnimationFrame(animate);
    };

    if (!shouldReduceMotion) {
      animationFrameId = window.requestAnimationFrame(animate);
      window.addEventListener('pointermove', handlePointerMove, {
        passive: true,
      });
    }
    window.addEventListener('resize', resize);

    return () => {
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', resize);
    };
  }, [shouldReduceMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 w-full h-full opacity-75"
    />
  );
}
