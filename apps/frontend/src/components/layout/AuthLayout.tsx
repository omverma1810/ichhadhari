"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Milk } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <div className="flex flex-1 items-center justify-center bg-white p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {children}
        </motion.div>
      </div>

      <div className="relative hidden flex-1 items-center justify-center overflow-hidden bg-gradient-to-br from-dairy-blue via-dairy-blue/90 to-dairy-darkBlue p-12 lg:flex">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative z-10 text-center text-white"
        >
          <div className="mb-8 inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-sm">
            <Milk className="h-12 w-12 text-white" />
          </div>
          <h1 className="mb-4 text-4xl font-bold">Dairy Management System</h1>
          <p className="mx-auto max-w-md text-lg leading-relaxed text-white/90">
            Streamline your dairy operations from procurement to delivery with
            our comprehensive management platform.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-6 text-sm">
            {[
              { label: "Digital", value: "100%" },
              { label: "Access", value: "24/7" },
              { label: "Updates", value: "Real-time" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl bg-white/10 p-4 backdrop-blur-sm"
              >
                <div className="text-3xl font-bold">{item.value}</div>
                <div className="text-white/80">{item.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
