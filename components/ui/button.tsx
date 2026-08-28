import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-12 shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-veyra border px-5 font-veyra text-[14px] font-extrabold no-underline transition-[color,background-color,border-color,translate] duration-150 outline-none hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-veyra-cobalt disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "border-veyra-cobalt bg-veyra-cobalt text-white! hover:border-veyra-foreground hover:bg-veyra-foreground",
        inverse:
          "border-veyra-paper bg-veyra-paper text-veyra-foreground! hover:border-veyra-lime hover:bg-veyra-lime",
        outline:
          "border-veyra-foreground bg-transparent text-veyra-foreground! hover:bg-veyra-foreground hover:text-white!",
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
