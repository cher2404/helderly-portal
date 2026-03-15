import * as React from "react";
import { cn } from "@/lib/utils";

const LinearCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-[12px] border border-zinc-200 bg-white text-zinc-900",
      "dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-100",
      "transition-colors hover:border-zinc-300 dark:hover:border-zinc-700/80",
      className
    )}
    {...props}
  />
));
LinearCard.displayName = "LinearCard";

const LinearCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-5 border-b border-zinc-200 dark:border-zinc-800/80", className)} {...props} />
));
LinearCardHeader.displayName = "LinearCardHeader";

const LinearCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100", className)}
    {...props}
  />
));
LinearCardTitle.displayName = "LinearCardTitle";

const LinearCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-xs text-zinc-600 dark:text-zinc-400 mt-0.5", className)} {...props} />
));
LinearCardDescription.displayName = "LinearCardDescription";

const LinearCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-5", className)} {...props} />
));
LinearCardContent.displayName = "LinearCardContent";

export { LinearCard, LinearCardHeader, LinearCardTitle, LinearCardDescription, LinearCardContent };
