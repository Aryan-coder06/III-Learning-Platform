import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold uppercase tracking-[0.18em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_18px_32px_rgba(19,19,19,0.16)] hover:-translate-y-0.5 hover:bg-accent",
        accent:
          "bg-accent text-accent-foreground shadow-[0_18px_32px_rgba(255,48,0,0.18)] hover:-translate-y-0.5 hover:bg-primary",
        outline:
          "border border-border bg-transparent text-foreground hover:-translate-y-0.5 hover:bg-primary hover:text-primary-foreground",
        ghost:
          "text-foreground hover:bg-secondary/80",
        dark:
          "bg-sidebar text-sidebar-foreground hover:-translate-y-0.5 hover:bg-accent",
      },
      size: {
        default: "h-12 px-6",
        lg: "h-14 px-8 text-[0.78rem]",
        xl: "h-16 px-10 text-[0.8rem]",
        icon: "h-11 w-11 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
