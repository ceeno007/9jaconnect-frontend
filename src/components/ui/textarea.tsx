import { TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, hint, id, ...props }, ref) => {
    const textareaId = id ?? props.name;

    return (
      <label className="flex w-full flex-col gap-2.5 text-base">
        {label ? (
          <span className="text-lg font-bold text-foreground">
            {label}
            {props.required ? <span className="text-danger"> *</span> : null}
          </span>
        ) : null}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            "field-surface min-h-44 w-full rounded-[var(--radius-lg)] bg-white px-6 py-5 text-lg font-semibold text-foreground outline-none transition placeholder:font-medium placeholder:text-muted/70 focus:ring-2 focus:ring-black",
            className,
          )}
          {...props}
        />
        {hint ? <span className="text-base font-medium text-muted">{hint}</span> : null}
      </label>
    );
  },
);

Textarea.displayName = "Textarea";
