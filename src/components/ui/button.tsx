import { cva, type VariantProps } from "class-variance-authority";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-buttons)] text-[14px] font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lemon focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.99]",
  {
    variants: {
      variant: {
        primary:
          "bg-lemon text-ink-black hover:bg-lemon-deep",
        secondary:
          "bg-lemon-wash text-ink-black hover:bg-[#e8f5b0]",
        outline:
          "bg-transparent text-ink-black/90 border border-black/20 hover:bg-black/[0.03]",
        ghost: "bg-transparent text-ink-black/95 hover:bg-black/[0.04]",
        danger: "bg-vermillion text-pure-white hover:opacity-90",
        dark: "bg-midnight-ink text-pure-white hover:bg-[#04105a]",
        pill: "rounded-[var(--radius-pill)] bg-lemon text-ink-black px-5",
      },
      size: {
        sm: "h-9 px-4 text-[13px]",
        md: "h-10 px-[15px]",
        lg: "h-11 px-5 text-[15px]",
        xl: "h-12 px-6 text-[15px]",
        pill: "h-10 px-5",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);

Button.displayName = "Button";
