import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-line bg-surface px-3.5 py-2 text-base text-fg shadow-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-fg placeholder:text-fg-subtle hover:border-line-strong focus-visible:outline-none focus-visible:border-brand/60 focus-visible:ring-4 focus-visible:ring-brand/15 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
