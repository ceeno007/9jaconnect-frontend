import { SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: readonly { label: string; value: string }[] | readonly string[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, placeholder, id, ...props }, ref) => {
    const selectId = id ?? props.name;
    const normalized = options.map((option) =>
      typeof option === "string"
        ? { label: option, value: option }
        : option,
    );

    return (
      <label className="flex w-full flex-col gap-2.5">
        {label ? (
          <span className="text-[15px] font-medium text-graphite">
            {label}
            {props.required ? <span className="text-danger"> *</span> : null}
          </span>
        ) : null}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "field-surface w-full appearance-none text-foreground outline-none transition",
            className,
          )}
          {...props}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {normalized.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  },
);

Select.displayName = "Select";
