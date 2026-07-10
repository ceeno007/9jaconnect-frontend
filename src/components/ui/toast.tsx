"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "neutral";

type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};

type ToastItem = ToastInput & {
  id: string;
  variant: ToastVariant;
  duration: number;
};

type ToastApi = {
  (input: ToastInput | string): string;
  success: (title: string, description?: string) => string;
  error: (title: string, description?: string) => string;
  dismiss: (id?: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

const DEFAULT_DURATION = 4200;
const MAX_VISIBLE = 3;

function createId() {
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function ToastCard({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const remainingRef = useRef(item.duration);
  const startedAtRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (paused) {
      if (startedAtRef.current != null) {
        remainingRef.current = Math.max(
          0,
          remainingRef.current - (performance.now() - startedAtRef.current),
        );
        startedAtRef.current = null;
      }
      if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
      return;
    }

    startedAtRef.current = performance.now();
    const total = item.duration;

    const tick = (now: number) => {
      const started = startedAtRef.current ?? now;
      const elapsed = now - started;
      const left = Math.max(0, remainingRef.current - elapsed);
      setProgress((left / total) * 100);
      if (left <= 0) {
        onDismiss(item.id);
        return;
      }
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
    };
  }, [item.duration, item.id, onDismiss, paused]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 420, damping: 32, mass: 0.8 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onClick={() => onDismiss(item.id)}
      role="status"
      aria-live={item.variant === "error" ? "assertive" : "polite"}
      className={cn(
        "pointer-events-auto relative w-[min(100vw-2rem,380px)] cursor-pointer overflow-hidden rounded-[12px] text-white shadow-[0_12px_40px_rgba(0,0,0,0.22)]",
        item.variant === "error"
          ? "bg-[#d93025]"
          : item.variant === "success"
            ? "bg-[#0f9d58]"
            : "bg-[#111111]",
      )}
    >
      <div className="px-4 py-3.5">
        <p className="text-[14px] font-bold leading-snug tracking-[-0.01em]">
          {item.title}
        </p>
        {item.description ? (
          <p className="mt-0.5 text-[13px] font-medium leading-snug text-white/80">
            {item.description}
          </p>
        ) : null}
      </div>

      <div className="h-[2px] w-full bg-black/15">
        <div
          className="h-full origin-left bg-white/55 transition-[width] duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id?: string) => {
    setToasts((current) =>
      id ? current.filter((toast) => toast.id !== id) : [],
    );
  }, []);

  const push = useCallback((input: ToastInput | string) => {
    const normalized: ToastInput =
      typeof input === "string" ? { title: input } : input;
    const item: ToastItem = {
      id: createId(),
      title: normalized.title,
      description: normalized.description,
      variant: normalized.variant || "neutral",
      duration: normalized.duration ?? DEFAULT_DURATION,
    };
    setToasts((current) => [item, ...current].slice(0, MAX_VISIBLE));
    return item.id;
  }, []);

  const api = useMemo<ToastApi>(
    () =>
      Object.assign(
        (input: ToastInput | string) => push(input),
        {
          success: (title: string, description?: string) =>
            push({ title, description, variant: "success" }),
          error: (title: string, description?: string) =>
            push({ title, description, variant: "error" }),
          dismiss,
        },
      ) as ToastApi,
    [dismiss, push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[80] flex flex-col items-center gap-2 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4"
        aria-label="Notifications"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((item) => (
            <ToastCard key={item.id} item={item} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
