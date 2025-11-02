import type { ComponentType, ReactNode } from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils/cn";
import { bounceAnimation } from "@/lib/utils/animations";

interface EmptyStateProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4",
        className
      )}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="relative mb-4 rounded-full bg-gradient-to-br from-dairy-cream to-dairy-background p-6"
        animate={bounceAnimation}
      >
        <motion.div
          className="absolute inset-0 rounded-full bg-dairy-blue/5"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut" as const,
          }}
        />
        <Icon className="relative z-10 h-12 w-12 text-dairy-blue" />
      </motion.div>

      <motion.h3
        className="mb-2 text-xl font-semibold text-dairy-charcoal"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {title}
      </motion.h3>

      {description ? (
        <motion.p
          className="mb-6 max-w-md text-center text-gray-600"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {description}
        </motion.p>
      ) : null}

      {action ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {action}
        </motion.div>
      ) : null}
    </motion.div>
  );
}
