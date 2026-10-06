"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "gold" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:brightness-110 shadow-soft",
  secondary: "bg-secondary text-secondary-foreground hover:brightness-110",
  ghost: "bg-transparent text-foreground hover:bg-muted",
  outline: "border border-border bg-card/60 text-foreground hover:bg-muted",
  gold: "bg-gold text-primary-foreground hover:brightness-110 shadow-soft",
  danger: "bg-danger text-white hover:brightness-110",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-4 text-[0.95rem] gap-2",
  lg: "h-14 px-6 text-base gap-2.5",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex select-none items-center justify-center rounded-xl font-medium transition-[transform,filter,background-color] duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
});

/** Icon-only button. `label` is required for screen readers. */
export const IconButton = forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, "aria-label"> & { label: string; pressed?: boolean }
>(function IconButton({ label, pressed, className, variant = "ghost", size = "md", ...props }, ref) {
  return (
    <Button
      ref={ref}
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      variant={variant}
      size={size}
      className={cn(
        "aspect-square px-0",
        size === "sm" ? "w-9" : size === "lg" ? "w-14" : "w-11",
        className,
      )}
      {...props}
    />
  );
});
