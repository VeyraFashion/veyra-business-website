import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-12 shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-styld border px-5 font-styld text-[14px] font-extrabold no-underline transition-[color,background-color,border-color,translate] duration-150 outline-none hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-styld-cobalt disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "border-styld-cobalt bg-styld-cobalt text-white! hover:border-styld-foreground hover:bg-styld-foreground",
        inverse:
          "border-styld-paper bg-styld-paper text-styld-foreground! hover:border-styld-lime hover:bg-styld-lime",
        outline:
          "border-styld-foreground bg-transparent text-styld-foreground! hover:bg-styld-foreground hover:text-white!",
      },
      size: {
        default: "min-h-12 px-5",
        sm: "min-h-10 px-4 text-[13px]",
        lg: "min-h-14 px-7 text-sm",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Component = asChild ? Slot : "button";

  return (
    <Component
      data-slot="button"
      data-variant={variant ?? "primary"}
      data-size={size ?? "default"}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
