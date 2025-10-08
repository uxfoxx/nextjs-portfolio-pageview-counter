"use client";

import React, { useRef, useEffect } from "react";

interface GradientMeshProps {
  className?: string;
}

export default function GradientMesh({ className = "" }: GradientMeshProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    class Blob {
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      color: string;

      constructor(x: number, y: number, radius: number, color: string) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.color = color;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < -this.radius || this.x > width + this.radius) {
          this.vx *= -1;
        }
        if (this.y < -this.radius || this.y > height + this.radius) {
          this.vy *= -1;
        }
      }
    }

    const blobs: Blob[] = [
      new Blob(width * 0.2, height * 0.3, 300, "rgba(59, 130, 246, 0.15)"),
      new Blob(width * 0.8, height * 0.4, 350, "rgba(139, 92, 246, 0.12)"),
      new Blob(width * 0.5, height * 0.7, 320, "rgba(14, 165, 233, 0.13)"),
      new Blob(width * 0.3, height * 0.8, 280, "rgba(99, 102, 241, 0.11)"),
      new Blob(width * 0.7, height * 0.2, 310, "rgba(6, 182, 212, 0.14)"),
    ];

    const animate = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = "lighter";

      blobs.forEach((blob) => {
        blob.update();

        const gradient = ctx.createRadialGradient(
          blob.x,
          blob.y,
          0,
          blob.x,
          blob.y,
          blob.radius
        );
        gradient.addColorStop(0, blob.color);
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalCompositeOperation = "source-over";
      animationRef.current = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("resize", handleResize);
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className={className}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          filter: "blur(60px)",
          opacity: 0.6,
        }}
      />
    </div>
  );
}
