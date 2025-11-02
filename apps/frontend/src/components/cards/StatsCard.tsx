"use client";

import { useEffect, useState, type ComponentType } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";

import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/formatters";

export interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ComponentType<{ className?: string }>;
  change?: number;
  changeLabel?: string;
  color?: "blue" | "green" | "orange" | "red" | "purple";
  className?: string;
  animateValue?: boolean;
  valuePrefix?: string;
  valueSuffix?: string;
}

const colorClasses = {
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    gradient: "from-blue-500 to-blue-600",
  },
  green: {
    bg: "bg-green-50",
    text: "text-green-600",
    gradient: "from-green-500 to-green-600",
  },
  orange: {
    bg: "bg-orange-50",
    text: "text-orange-600",
    gradient: "from-orange-500 to-orange-600",
  },
  red: {
    bg: "bg-red-50",
    text: "text-red-600",
    gradient: "from-red-500 to-red-600",
  },
  purple: {
    bg: "bg-purple-50",
    text: "text-purple-600",
    gradient: "from-purple-500 to-purple-600",
  },
} satisfies Record<string, { bg: string; text: string; gradient: string }>;

export function StatsCard({
  title,
  value,
  icon: Icon,
  change,
  changeLabel,
  color = "blue",
  className,
  animateValue = true,
  valuePrefix,
  valueSuffix,
}: StatsCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!animateValue || typeof value !== "number") {
      return;
    }

    let current = 0;
    const end = value;
    const duration = 2000;
    const increment = end / (duration / 16);

    const timer = window.setInterval(() => {
      current += increment;
      if (current >= end) {
        setDisplayValue(end);
        window.clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, 16);

    return () => window.clearInterval(timer);
  }, [value, animateValue]);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [5, -5]);
  const rotateY = useTransform(x, [-100, 100], [-5, 5]);
  const springConfig = { stiffness: 300, damping: 30 };
  const rotateXSpring = useSpring(rotateX, springConfig);
  const rotateYSpring = useSpring(rotateY, springConfig);

  const { bg, text, gradient } = colorClasses[color] ?? colorClasses.blue;
  const isNumericValue = typeof value === "number";
  const renderedValue = isNumericValue
    ? formatNumber(animateValue ? displayValue : value)
    : value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -8,
        boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
        transition: { duration: 0.2 },
      }}
      style={{
        rotateX: rotateXSpring,
        rotateY: rotateYSpring,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set(event.clientX - centerX);
        y.set(event.clientY - centerY);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      className={cn(
        "relative cursor-pointer overflow-hidden rounded-xl border border-gray-100 bg-white p-6 shadow-dairy",
        className
      )}
    >
      <motion.div
        className={cn("absolute inset-0 opacity-0 bg-gradient-to-br", gradient)}
        whileHover={{ opacity: 0.03 }}
        transition={{ duration: 0.3 }}
      />

      <motion.div
        className="absolute -right-6 -top-6 h-24 w-24 rounded-full"
        style={{
          background: `radial-gradient(circle, ${
            color === "blue"
              ? "#4A90E2"
              : color === "green"
              ? "#7ED321"
              : color === "orange"
              ? "#F5A623"
              : color === "red"
              ? "#D0021B"
              : "#9013FE"
          } 0%, transparent 70%)`,
          opacity: 0.05,
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.08, 0.05] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut" as const,
        }}
      />

      <div className="relative z-10 mb-4 flex items-start justify-between">
        <div className="flex-1">
          <motion.p
            className="mb-1 text-sm font-medium text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {title}
          </motion.p>
          <motion.h3
            className="flex items-baseline gap-1 text-3xl font-bold text-dairy-charcoal"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {valuePrefix ? (
              <span className="text-lg font-semibold text-gray-400">
                {valuePrefix}
              </span>
            ) : null}
            <span>{renderedValue}</span>
            {valueSuffix && isNumericValue ? (
              <span className="text-base font-semibold text-gray-400">
                {valueSuffix}
              </span>
            ) : null}
          </motion.h3>
        </div>
        <motion.div
          className={cn(
            "relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl",
            bg,
            text
          )}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <motion.div
            className="absolute inset-0 bg-white/50"
            initial={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
          <Icon className="relative z-10 h-6 w-6" />
        </motion.div>
      </div>

      {typeof change === "number" ? (
        <motion.div
          className="relative z-10 flex items-center gap-2"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-1 text-sm font-medium",
              change >= 0
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            )}
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              animate={{ y: change >= 0 ? [-2, 0, -2] : [2, 0, 2] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut" as const,
              }}
            >
              {change >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
            </motion.div>
            <span>{Math.abs(change)}%</span>
          </motion.div>
          {changeLabel ? (
            <span className="text-sm text-gray-600">{changeLabel}</span>
          ) : null}
        </motion.div>
      ) : null}

      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
        initial={{ x: "-100%", opacity: 0 }}
        whileHover={{ x: "100%", opacity: 0.1 }}
        transition={{ duration: 0.6 }}
      />
    </motion.div>
  );
}
