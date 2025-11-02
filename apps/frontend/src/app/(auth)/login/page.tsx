"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Shield,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { MilkBottle, MilkDrop } from "@/components/icons";
import { staggerContainer, staggerItem } from "@/lib/utils/animations";
import { useLogin } from "@/hooks/api/useAuth";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Use React Query mutation hook for login
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setApiError(null);

    loginMutation.mutate(
      {
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      },
      {
        onError: (error: any) => {
          const errorMessage =
            error?.message ||
            error?.response?.data?.message ||
            "Invalid credentials. Please try again.";
          setApiError(errorMessage);
        },
      }
    );
  };

  // Quick login function for demo credentials
  const quickLogin = async (email: string, password: string) => {
    setApiError(null);

    loginMutation.mutate(
      {
        email,
        password,
        rememberMe: true,
      },
      {
        onError: (error: any) => {
          const errorMessage =
            error?.message ||
            error?.response?.data?.message ||
            "Login failed. Please try again.";
          setApiError(errorMessage);
        },
      }
    );
  };

  return (
    <motion.div
      className="w-full max-w-md mx-auto rounded-3xl border border-dairy-blue/10 bg-white p-8 shadow-dairy-lg sm:p-10"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      {/* Header Section */}
      <motion.div className="text-center mb-8" variants={staggerItem}>
        <motion.div
          className="inline-flex h-20 w-20 items-center justify-center rounded-3xl border border-dairy-blue/20 mb-4 relative overflow-hidden shadow-dairy"
          style={{
            background: "linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)",
          }}
          whileHover={{ scale: 1.05, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <motion.div
            className="absolute inset-0 bg-white/25"
            animate={{ opacity: [0.2, 0.35, 0.2] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <MilkBottle className="relative z-10 h-10 w-10 text-white" />
        </motion.div>
        <motion.h2
          className="mb-2 text-3xl font-semibold text-dairy-charcoal"
          variants={staggerItem}
        >
          Welcome Back
        </motion.h2>
        <motion.p
          className="flex items-center justify-center gap-2 text-sm text-dairy-charcoal/70"
          variants={staggerItem}
        >
          <Sparkles className="h-4 w-4 text-dairy-orange" />
          Sign in to Ichhadhari Dairy Management
        </motion.p>
      </motion.div>

      {/* API Error Alert */}
      <AnimatePresence>
        {apiError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 flex items-start gap-3 rounded-xl border-2 border-red-200 bg-red-50 p-4"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <div>
              <p className="text-sm font-semibold text-red-800">Login Failed</p>
              <p className="text-sm text-red-600">{apiError}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Form */}
      <motion.form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
        variants={staggerContainer}
      >
        {/* Email/Username Field */}
        <motion.div className="space-y-2" variants={staggerItem}>
          <Label
            htmlFor="email"
            className="flex items-center gap-2 text-sm font-semibold text-dairy-charcoal"
          >
            <Mail className="h-4 w-4 text-dairy-blue" />
            Username or Email
          </Label>
          <div className="relative group">
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10"
            >
              <Mail className="h-5 w-5 text-dairy-blue transition-colors group-focus-within:text-dairy-darkBlue" />
            </motion.div>
            <Input
              id="email"
              type="text"
              placeholder="admin or admin@dairy.com"
              disabled={loginMutation.isPending}
              className="h-13 rounded-xl border border-dairy-blue/20 bg-white pl-11 text-base font-medium text-dairy-charcoal placeholder:text-dairy-charcoal/40 transition-all focus:border-dairy-blue focus:ring-2 focus:ring-dairy-blue/30 disabled:cursor-not-allowed disabled:opacity-60"
              {...register("email")}
            />
            <motion.div className="pointer-events-none absolute inset-0 rounded-xl border border-dairy-blue/10 opacity-0 transition-opacity group-focus-within:opacity-100" />
          </div>
          <AnimatePresence>
            {errors.email && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                {errors.email.message}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div className="space-y-2" variants={staggerItem}>
          <Label
            htmlFor="password"
            className="flex items-center gap-2 text-sm font-semibold text-dairy-charcoal"
          >
            <Lock className="h-4 w-4 text-dairy-blue" />
            Password
          </Label>
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-dairy-blue transition-colors group-focus-within:text-dairy-darkBlue" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              disabled={loginMutation.isPending}
              className="h-13 rounded-xl border border-dairy-blue/20 bg-white pl-11 pr-11 text-base font-medium text-dairy-charcoal placeholder:text-dairy-charcoal/40 transition-all focus:border-dairy-blue focus:ring-2 focus:ring-dairy-blue/30 disabled:cursor-not-allowed disabled:opacity-60"
              {...register("password")}
            />
            <motion.button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loginMutation.isPending}
              className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-dairy-charcoal/40 transition-colors hover:text-dairy-darkBlue disabled:opacity-50"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </motion.button>
            <motion.div className="pointer-events-none absolute inset-0 rounded-xl border border-dairy-blue/10 opacity-0 transition-opacity group-focus-within:opacity-100" />
          </div>
          <AnimatePresence>
            {errors.password ? (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                {errors.password.message}
              </motion.p>
            ) : null}
          </AnimatePresence>
        </motion.div>

        {/* Remember Me & Forgot Password */}
        <motion.div
          className="flex items-center justify-between"
          variants={staggerItem}
        >
          <label className="group flex cursor-pointer items-center">
            <input
              id="remember-me"
              type="checkbox"
              disabled={loginMutation.isPending}
              className="h-4 w-4 rounded border border-dairy-blue/30 text-dairy-blue transition-all focus:ring-2 focus:ring-dairy-blue/40 disabled:opacity-50"
              {...register("rememberMe")}
            />
            <span className="ml-2 text-sm font-medium text-dairy-charcoal/80 transition-colors group-hover:text-dairy-darkBlue">
              Remember me
            </span>
          </label>
          <Link
            href="/forgot-password"
            className="relative text-sm font-semibold text-dairy-blue transition-colors hover:text-dairy-darkBlue"
          >
            Forgot password?
          </Link>
        </motion.div>

        {/* Submit Button - FIXED TO BE ALWAYS VISIBLE */}
        <motion.div variants={staggerItem} className="pt-2">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="group relative flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-dairy-blue/20 bg-dairy-blue text-base font-semibold text-white shadow-dairy-lg transition-all hover:bg-dairy-darkBlue hover:shadow-lg disabled:cursor-not-allowed disabled:bg-dairy-blue/60 disabled:text-white/80"
            >
              {loginMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" className="text-white" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5" />
                  <span>Sign In Securely</span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </motion.div>
        </motion.div>
      </motion.form>

      <motion.div
        variants={staggerItem}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.5 }}
        className="mt-6 rounded-2xl border border-dairy-blue/15 bg-dairy-background p-6 shadow-dairy"
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-4">
            <div className="rounded-lg bg-dairy-blue/10 p-2">
              <MilkDrop className="h-5 w-5 text-dairy-blue" />
            </div>
            <p className="text-sm font-semibold text-dairy-charcoal">
              Demo Credentials
            </p>
            <span className="ml-auto flex items-center gap-1 rounded-full bg-dairy-green/10 px-3 py-1 text-xs font-medium text-dairy-green">
              <CheckCircle2 className="h-3 w-3" />
              Ready to use
            </span>
          </div>
          <div className="space-y-3">
            {[
              {
                role: "Admin",
                email: "admin",
                display: "admin@dairy.com",
                password: "admin123",
                color: "orange",
              },
              {
                role: "Manager",
                email: "manager",
                display: "manager@dairy.com",
                password: "manager123",
                color: "green",
              },
            ].map((cred, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="group rounded-xl border border-dairy-blue/15 bg-white p-4 shadow-sm transition-all hover:border-dairy-blue/40 hover:shadow-dairy"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      cred.color === "orange"
                        ? "bg-dairy-orange text-white"
                        : "bg-dairy-green text-white"
                    }`}
                  >
                    {cred.role}
                  </span>

                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${cred.email}\n${cred.password}`
                        );
                        toast.success("Credentials copied!");
                      }}
                      disabled={loginMutation.isPending}
                      className="text-xs font-medium text-dairy-blue transition-colors hover:text-dairy-darkBlue disabled:opacity-50"
                    >
                      Copy
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => quickLogin(cred.email, cred.password)}
                      disabled={loginMutation.isPending}
                      className="text-xs font-medium text-dairy-green transition-colors hover:text-dairy-green/80 disabled:opacity-50"
                    >
                      Quick Login
                    </motion.button>
                  </div>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3 text-dairy-charcoal/50" />
                    <div className="flex flex-col">
                      <span className="font-mono font-semibold text-dairy-charcoal">
                        {cred.email}
                      </span>
                      <span className="text-[10px] text-dairy-charcoal/50">
                        ({cred.display})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="h-3 w-3 text-dairy-charcoal/50" />
                    <span className="font-mono text-dairy-charcoal">
                      {cred.password}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.p
        className="mt-8 text-center text-sm text-dairy-charcoal/70"
        variants={staggerItem}
      >
        Don&apos;t have an account?{" "}
        <Link
          href="/contact"
          className="font-semibold text-dairy-blue transition-colors hover:text-dairy-darkBlue"
        >
          Contact Administrator
        </Link>
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-6 flex items-center justify-center gap-2 text-xs text-dairy-charcoal/60"
      >
        <Shield className="h-4 w-4 text-dairy-green" />
        <span>Secured with 256-bit SSL encryption</span>
      </motion.div>
    </motion.div>
  );
}
