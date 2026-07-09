import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, id, ...props }, ref) => {
    const inputId = id ?? props.name;

    return (
      <label className="flex w-full flex-col gap-2.5">
        {label ? (
          <span className="text-lg font-bold text-foreground">
            {label}
            {props.required ? <span className="text-danger"> *</span> : null}
          </span>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "field-surface w-full text-foreground outline-none transition placeholder:font-medium placeholder:text-muted/70",
            error && "ring-2 ring-danger",
            className,
          )}
          {...props}
        />
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
