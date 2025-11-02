import * as React from "react";

import { cn } from "@/lib/utils";

export interface SwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onCheckedChange, className, disabled, ...props }, ref) => {
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;
      props.onClick?.(event);
      if (!event.defaultPrevented) {
        onCheckedChange?.(!checked);
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled}
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A920]/60 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
          checked ? "bg-[#F4A920]" : "bg-slate-300",
          className
        )}
        {...props}
      >
        <span
          aria-hidden="true"
          className={cn(
            "inline-block size-5 transform rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-5" : "translate-x-1"
          )}
        />
      </button>
    );
  }
);

Switch.displayName = "Switch";
