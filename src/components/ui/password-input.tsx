"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** Password field with an animated show/hide toggle. Accepts every <input> prop. */
const PasswordInput = React.forwardRef<HTMLInputElement, Omit<React.ComponentProps<"input">, "type">>(
  ({ className, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);

    const iconBase = "absolute inset-0 m-auto h-[18px] w-[18px] transition-all duration-300";
    // Slight overshoot so the icon "pops" as it swaps
    const iconStyle = { transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" };

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={visible ? "text" : "password"}
          className={cn("pr-11", className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="group absolute right-1.5 top-1/2 h-8 w-8 -translate-y-1/2 rounded-lg text-fg-subtle transition-colors hover:bg-elevated hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 active:scale-90"
        >
          {/* Two icons stacked; each spins + scales in as the other leaves.
              Eye = "click to show" (hidden state), EyeOff = "click to hide". */}
          <Eye
            style={iconStyle}
            className={cn(
              iconBase,
              visible ? "rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100"
            )}
          />
          <EyeOff
            style={iconStyle}
            className={cn(
              iconBase,
              visible ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0"
            )}
          />
        </button>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
