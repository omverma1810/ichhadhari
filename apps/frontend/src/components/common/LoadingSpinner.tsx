import { motion } from "framer-motion";

import { cn } from "@/lib/utils/cn";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  withText?: boolean;
  text?: string;
}

const sizeClasses: Record<NonNullable<LoadingSpinnerProps["size"]>, string> = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

export function LoadingSpinner({
  size = "md",
  className,
  withText = false,
  text = "Loading...",
}: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={cn("relative", sizeClasses[size])}>
        <motion.div
          className={cn(
            "absolute inset-0 rounded-full border-4 border-dairy-blue/20",
            className
          )}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear" as const,
          }}
        />
        <motion.div
          className={cn(
            "absolute inset-0 rounded-full border-4 border-transparent border-t-dairy-blue",
            className
          )}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear" as const,
          }}
        />
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut" as const,
          }}
        >
          <div
            className={cn("h-1.5 w-1.5 rounded-full bg-dairy-blue", className)}
          />
        </motion.div>
      </div>

      {withText ? (
        <motion.p
          className="text-sm text-gray-600"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut" as const,
          }}
        >
          {text}
        </motion.p>
      ) : null}
    </div>
  );
}
