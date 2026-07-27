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
      <label className="flex w-full flex-col gap-2.5 text-[15px]">
        {label ? (
          <span className="text-[15px] font-medium text-graphite">
            {label}
            {props.required ? <span className="text-danger"> *</span> : null}
          </span>
        ) : null}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            "field-surface min-h-44 w-full text-[15px] font-normal text-foreground outline-none transition placeholder:font-normal placeholder:text-ash focus:ring-2 focus:ring-obsidian",
            className,
          )}
          {...props}
        />
        {hint ? (
          <span className="text-[13px] font-normal text-fog">{hint}</span>
        ) : null}
      </label>
    );
  },
);

Textarea.displayName = "Textarea";
