"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { PenLine } from "lucide-react";

export interface SignaturePadHandle {
  clear: () => void;
  getDataUrl: () => string | null;
  isEmpty: () => boolean;
}

export const SignaturePad = forwardRef<
  SignaturePadHandle,
  { onInkChange?: (hasInk: boolean) => void }
>(function SignaturePad({ onInkChange }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const savedDataRef = useRef<string | null>(null);
  const inkRef = useRef(false);
  const [hasInk, setHasInk] = useState(false);

  const notifyInk = useCallback(
    (value: boolean) => {
      inkRef.current = value;
      setHasInk(value);
      onInkChange?.(value);
    },
    [onInkChange],
  );

  const configureCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);
    const context = canvas.getContext("2d");
    if (!context) return;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.lineWidth = 2.4;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "#0F3D2E";

    if (savedDataRef.current) {
      const image = new Image();
      image.onload = () => {
        context.drawImage(image, 0, 0, rect.width, rect.height);
      };
      image.src = savedDataRef.current;
    }
  }, []);

  useEffect(() => {
    configureCanvas();
    const canvas = canvasRef.current;
    if (!canvas || typeof ResizeObserver === "undefined") return;
    let frame = 0;
    const observer = new ResizeObserver(() => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(configureCanvas);
    });
    observer.observe(canvas);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [configureCanvas]);

  const getPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    event.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    const point = getPoint(event);
    lastPointRef.current = point;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.beginPath();
    context.moveTo(point.x, point.y);
    context.lineTo(point.x + 0.1, point.y + 0.1);
    context.stroke();
    if (!inkRef.current) notifyInk(true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    event.preventDefault();
    const canvas = canvasRef.current;
    const last = lastPointRef.current;
    if (!canvas || !last) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const point = getPoint(event);
    context.beginPath();
    context.moveTo(last.x, last.y);
    context.lineTo(point.x, point.y);
    context.stroke();
    lastPointRef.current = point;
  };

  const finishStroke = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (drawingRef.current && canvas) {
      savedDataRef.current = canvas.toDataURL("image/png");
    }
    drawingRef.current = false;
    lastPointRef.current = null;
    if (canvas?.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
  };

  const clear = useCallback(() => {
    savedDataRef.current = null;
    drawingRef.current = false;
    lastPointRef.current = null;
    configureCanvas();
    notifyInk(false);
  }, [configureCanvas, notifyInk]);

  useImperativeHandle(
    ref,
    () => ({
      clear,
      getDataUrl: () => {
        if (!inkRef.current || !canvasRef.current) return null;
        return canvasRef.current.toDataURL("image/png");
      },
      isEmpty: () => !inkRef.current,
    }),
    [clear],
  );

  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-white">
      <div className="pointer-events-none absolute inset-x-6 bottom-12 border-b border-dashed border-line" />
      <canvas
        ref={canvasRef}
        className="relative z-10 block h-56 w-full touch-none cursor-crosshair sm:h-64"
        aria-label="Customer signature pad. Sign with a finger or pointer."
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishStroke}
        onPointerCancel={finishStroke}
        onPointerLeave={finishStroke}
      />
      {!hasInk && (
        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center text-ink-muted/55">
          <PenLine className="size-5" strokeWidth={1.8} aria-hidden="true" />
          <p className="mt-2 text-xs font-semibold">Customer signs here</p>
          <p className="mt-0.5 text-[10px]">Use a finger or stylus</p>
        </div>
      )}
      <div className="pointer-events-none absolute inset-x-6 bottom-4 z-20 flex items-center justify-between text-[9px] font-medium uppercase tracking-[0.12em] text-ink-muted/50">
        <span>Customer signature</span>
        <span>Demo Auto Workshop</span>
      </div>
    </div>
  );
});
