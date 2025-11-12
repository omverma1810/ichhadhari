import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 shadow-sm hover:shadow-md active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500 active:bg-blue-800",
        primary: "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500 active:bg-blue-800",
        destructive: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 active:bg-red-800",
        danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 active:bg-red-800",
        outline: "border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus-visible:ring-gray-500 shadow-sm",
        secondary: "bg-gray-600 text-white hover:bg-gray-700 focus-visible:ring-gray-500 active:bg-gray-800",
        ghost: "text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-500 shadow-none",
        success: "bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500 active:bg-green-800",
        link: "text-blue-600 underline-offset-4 hover:underline shadow-none",
      },
      size: {
        default: "h-10 px-5 py-2.5 text-base has-[>svg]:px-4",
        sm: "h-8 px-3 py-2 text-sm gap-1.5 has-[>svg]:px-2.5",
        md: "h-10 px-5 py-2.5 text-base has-[>svg]:px-4",
        lg: "h-11 px-6 py-3 text-lg has-[>svg]:px-5",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
