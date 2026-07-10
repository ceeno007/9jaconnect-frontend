import { HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("ui-card p-6", className)} {...props} />
  );
}

export function Badge({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-white px-3 py-1 text-sm font-bold text-black",
        className,
      )}
      {...props}
    />
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      {eyebrow ? (
        <p className="mb-2 text-base font-bold text-black">{eyebrow}</p>
      ) : null}
      <h2 className="text-4xl font-bold tracking-tight text-black sm:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-lg font-medium leading-relaxed text-muted">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="ui-card px-8 py-16 text-center">
      <h3 className="text-2xl font-bold text-black">{title}</h3>
      {description ? (
        <p className="mx-auto mt-3 max-w-md text-base font-medium text-muted">
          {description}
        </p>
      ) : null}
      {children ? <div className="mt-6 flex justify-center">{children}</div> : null}
    </div>
  );
}

export function PageShell({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col gap-5 border-b border-[#e4e2e0] pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-black sm:text-5xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-3 max-w-2xl text-lg font-medium text-muted">
              {description}
            </p>
          ) : null}
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}
