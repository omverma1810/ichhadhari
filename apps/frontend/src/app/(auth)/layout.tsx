"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

import { Butter, Cheese, MilkBottle, MilkDrop } from "@/components/icons";
import { fadeInScale, slideInRight } from "@/lib/utils/animations";

const stats = [
  { value: "100%", label: "Digital" },
  { value: "24/7", label: "Access" },
  { value: "Real-time", label: "Updates" },
];

const features = [
  "Track milk procurement in real-time",
  "Manage production batches efficiently",
  "Monitor inventory and cold storage",
  "Streamline vendor payments",
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-dairy-background lg:flex-row">
      {/* LEFT PANEL - Login Form */}
      <div className="relative flex min-h-screen flex-1 items-center justify-center border-b border-dairy-blue/10 bg-dairy-background/80 p-8 sm:p-12 lg:border-b-0 lg:border-r">
        {/* Background Decorative Icons - FIXED OPACITY */}
        <motion.div
          className="pointer-events-none absolute left-10 top-10 h-20 w-20 text-dairy-blue/10"
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            rotate: { duration: 20, repeat: Infinity, ease: "linear" as const },
            scale: {
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut" as const,
            },
          }}
        >
          <MilkBottle className="h-full w-full" />
        </motion.div>

        <motion.div
          className="pointer-events-none absolute right-10 bottom-10 h-16 w-16 text-dairy-orange/10"
          animate={{
            rotate: -360,
            y: [0, -20, 0],
          }}
          transition={{
            rotate: { duration: 15, repeat: Infinity, ease: "linear" as const },
            y: { duration: 4, repeat: Infinity, ease: "easeInOut" as const },
          }}
        >
          <Cheese className="h-full w-full" />
        </motion.div>

        <motion.div
          className="pointer-events-none absolute left-1/4 bottom-16 h-14 w-14 text-dairy-blue/10"
          animate={{
            y: [0, 12, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut" as const,
          }}
        >
          <Butter className="h-full w-full" />
        </motion.div>

        {/* Content Container - FIXED Z-INDEX */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-20 w-full max-w-md"
        >
          {children}
        </motion.div>
      </div>

      {/* RIGHT PANEL - Feature Showcase - FIXED VISIBILITY */}
      <div className="relative hidden min-h-screen flex-1 items-center justify-center overflow-hidden bg-linear-to-br from-dairy-blue via-[#2f6ae2] to-dairy-darkBlue p-12 lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35), transparent 45%), radial-gradient(circle at 80% 10%, rgba(255,255,255,0.15), transparent 40%), radial-gradient(circle at 50% 80%, rgba(255,255,255,0.2), transparent 50%)",
          }}
        />

        {/* Floating Decorative Icons */}
        <motion.div
          className="pointer-events-none absolute left-20 top-20 h-16 w-16 text-white/25"
          animate={{
            y: [0, -30, 0],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut" as const,
          }}
        >
          <MilkDrop className="h-full w-full" />
        </motion.div>

        <motion.div
          className="pointer-events-none absolute right-32 top-40 h-12 w-12 text-white/25"
          animate={{
            y: [0, 40, 0],
            rotate: [0, -10, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut" as const,
            delay: 1,
          }}
        >
          <Butter className="h-full w-full" />
        </motion.div>

        <motion.div
          className="pointer-events-none absolute left-40 bottom-32 h-14 w-14 text-white/25"
          animate={{
            y: [0, -25, 0],
            x: [0, 15, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut" as const,
            delay: 2,
          }}
        >
          <Cheese className="h-full w-full" />
        </motion.div>

        {/* Main Content */}

        <motion.div
          variants={fadeInScale}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-xl text-center text-white"
        >
          <motion.div
            className="relative mb-8 inline-flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border border-white/20 bg-white/10"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div
              className="absolute inset-0 bg-white/20"
              animate={{ rotate: 360 }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear" as const,
              }}
            />
            <MilkBottle className="relative z-10 h-12 w-12 text-white" />
          </motion.div>

          <motion.h1
            className="mb-4 text-4xl font-semibold"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Dairy Management System
          </motion.h1>

          <motion.p
            className="mx-auto mb-8 max-w-md text-lg leading-relaxed text-white/90"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Streamline your dairy operations from procurement to delivery with
            our comprehensive management platform.
          </motion.p>

          <motion.div
            className="mt-12 grid grid-cols-3 gap-6 text-sm"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1, delayChildren: 0.4 },
              },
            }}
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                className="group relative overflow-hidden rounded-xl border border-white/15 bg-white/10 p-4"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                whileHover={{
                  y: -5,
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  className="absolute inset-0 bg-white/10"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                />
                <div className="relative z-10 text-3xl font-bold">
                  {stat.value}
                </div>
                <div className="relative z-10 text-white/80">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="mt-12 space-y-3 text-left"
            variants={slideInRight}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.7 }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature}
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <motion.div
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
                  whileHover={{ scale: 1.2, rotate: 360 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="h-2 w-2 rounded-full bg-white"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.2,
                      ease: "easeInOut" as const,
                    }}
                  />
                </motion.div>
                <span className="text-white/90">{feature}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
