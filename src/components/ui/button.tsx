import Link from "next/link";

import { cn } from "@/lib/utils";

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 text-[0.92rem] font-semibold tracking-[0.005em] transition-[background-color,border-color,color,transform,box-shadow] duration-300 ease-out-expo active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0";

const variants = {
  primary:
    "bg-ink text-bg shadow-[0_10px_24px_-12px_var(--ink)] hover:-translate-y-0.5 hover:shadow-[0_16px_30px_-12px_var(--ink)]",
  accent:
    "bg-accent text-bg hover:-translate-y-0.5 hover:shadow-[0_16px_30px_-14px_var(--accent)]",
  outline: "border border-line-strong text-ink hover:border-ink hover:bg-raised",
  ghost: "text-ink-soft hover:bg-sunken hover:text-ink",
  stage:
    "border border-white/20 bg-white/10 text-stage-ink backdrop-blur-sm hover:border-white/40 hover:bg-white/15",
  stageSolid: "bg-stage-ink text-stage hover:-translate-y-0.5 hover:bg-white",
} as const;

export type ButtonVariant = keyof typeof variants;

export function buttonClasses(variant: ButtonVariant = "primary", className?: string): string {
  return cn(base, variants[variant], className);
}

interface ButtonLinkProps extends React.ComponentProps<typeof Link> {
  variant?: ButtonVariant;
}

export function ButtonLink({ variant = "primary", className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClasses(variant, className)} {...props} />;
}
