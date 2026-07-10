"use client";

import { useEffect, useRef } from "react";
import {
  isGoogleAuthConfigured,
  mountGoogleSignInButton,
  setGoogleCredentialHandler,
  type GoogleButtonText,
} from "@/lib/google-auth";
import { cn } from "@/lib/utils";

export function GoogleSignInButton({
  className,
  text = "signin_with",
  onCredential,
  disabled = false,
}: {
  className?: string;
  /** GIS button label variant */
  text?: GoogleButtonText;
  onCredential: (idToken: string) => void | Promise<void>;
  disabled?: boolean;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const handlerRef = useRef(onCredential);
  handlerRef.current = onCredential;

  useEffect(() => {
    if (!isGoogleAuthConfigured()) return;

    setGoogleCredentialHandler((idToken) => {
      void handlerRef.current(idToken);
    });

    const host = hostRef.current;
    if (!host) return;

    const render = () => {
      const width = host.clientWidth || host.offsetWidth;
      if (
        width > 0 &&
        Math.abs(width - lastWidth) < 12 &&
        host.childElementCount > 0
      ) {
        return;
      }
      lastWidth = width;
      void mountGoogleSignInButton(host, {
        text,
        width,
      });
    };

    let lastWidth = 0;
    render();

    const observer = new ResizeObserver(() => render());
    observer.observe(host);
    return () => {
      observer.disconnect();
      setGoogleCredentialHandler(null);
    };
  }, [text]);

  if (!isGoogleAuthConfigured()) return null;

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-full",
        disabled && "pointer-events-none opacity-60",
        className,
      )}
    >
      <div
        ref={hostRef}
        className="flex min-h-12 w-full items-center justify-center [&_iframe]:!max-w-full"
        aria-label="Continue with Google"
      />
    </div>
  );
}
