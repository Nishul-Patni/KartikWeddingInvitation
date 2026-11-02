
import { useEffect, useRef, type ReactNode } from 'react';

interface FallingSakuraProps {
  children?: ReactNode;
  petalCount?: number;
}

const FallingSakura: React.FC<FallingSakuraProps> = ({
  children,
  petalCount = 35,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    resizeCanvas();

    const random = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const petalColors = [
      '#FFB6C9',
      '#FF91B8',
      '#FF80AB',
      '#F76F9E',
      '#F85C91',
      '#EC407A',
      '#FFD1DC',
      '#FFC0CB',
    ];

    type Petal = {
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      rotation: number;
      wobble: number;
      wobbleSpeed: number;
    };

    const petals: Petal[] = Array.from(
      { length: petalCount },
      () => ({
        x: random(0, width),
        y: random(0, height),
        size: random(9, 18),
        color: petalColors[
          Math.floor(Math.random() * petalColors.length)
        ],
        speedX: random(-0.3, 0.3),
        speedY: random(0.5, 1.1),
        rotation: random(0, Math.PI * 2),
        wobble: random(0, Math.PI * 2),
        wobbleSpeed: random(0.02, 0.05),
      })
    );

    const drawPetal = (petal: Petal) => {
      ctx.save();

      ctx.translate(petal.x, petal.y);
      ctx.rotate(petal.rotation);

      ctx.beginPath();
      ctx.moveTo(0, 0);

      ctx.bezierCurveTo(
        -petal.size / 2,
        -petal.size / 3,
        -petal.size / 3,
        -petal.size,
        0,
        -petal.size / 1.5
      );

      ctx.bezierCurveTo(
        petal.size / 3,
        -petal.size,
        petal.size / 2,
        -petal.size / 3,
        0,
        0
      );

      ctx.fillStyle = petal.color;
      ctx.globalAlpha = 0.9;
      ctx.fill();

      ctx.restore();
    };

    const updatePetal = (petal: Petal) => {
      petal.x += petal.speedX + Math.sin(petal.wobble) * 0.25;
      petal.y += petal.speedY;

      petal.rotation += 0.012;
      petal.wobble += petal.wobbleSpeed;

      if (petal.x < -petal.size) {
        petal.x = width + petal.size;
      }

      if (petal.x > width + petal.size) {
        petal.x = -petal.size;
      }

      if (petal.y > height + petal.size) {
        petal.y = -petal.size;
        petal.x = random(0, width);
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      petals.forEach((petal) => {
        drawPetal(petal);
        updatePetal(petal);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [petalCount]);

  return (
    <div style={{ position: 'relative', minHeight: '100%' }}>
      {children}

      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          pointerEvents: 'none',
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
};

export default FallingSakura;
