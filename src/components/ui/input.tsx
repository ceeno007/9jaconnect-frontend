"use client";

import { InputHTMLAttributes, forwardRef, useState } from "react";
import { Eyeglasses, Sunglasses } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, id, type, ...props }, ref) => {
    const inputId = id ?? props.name;
    const isPassword = type === "password";
    const [visible, setVisible] = useState(false);
    const resolvedType = isPassword ? (visible ? "text" : "password") : type;

    return (
      <label className="flex w-full flex-col gap-2.5">
        {label ? (
          <span className="text-[15px] font-medium text-graphite">
            {label}
            {props.required ? <span className="text-danger"> *</span> : null}
          </span>
        ) : null}
        <span className="relative block w-full">
          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            className={cn(
              "field-surface w-full text-foreground outline-none transition placeholder:font-medium placeholder:text-muted/70",
              isPassword && "has-reveal",
              error && "ring-2 ring-danger",
              className,
            )}
            {...props}
          />
          {isPassword ? (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setVisible((value) => !value)}
              className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center text-fog transition hover:text-obsidian"
              aria-label={visible ? "Hide password" : "Show password"}
              aria-pressed={visible}
            >
              {visible ? (
                <Eyeglasses size={22} weight="duotone" />
              ) : (
                <Sunglasses size={22} weight="duotone" />
              )}
            </button>
          ) : null}
        </span>
        {error ? (
          <span className="text-base font-semibold text-danger">{error}</span>
        ) : null}
        {!error && hint ? (
          <span className="text-base font-medium text-muted">{hint}</span>
        ) : null}
      </label>
    );
  },
);

Input.displayName = "Input";
