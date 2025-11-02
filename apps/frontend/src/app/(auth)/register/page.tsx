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
  User,
  Phone,
  AlertCircle,
  Building2,
  Briefcase,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { MilkBottle } from "@/components/icons";
import { staggerContainer, staggerItem } from "@/lib/utils/animations";
import { useRegister } from "@/hooks/api/useAuth";

const registerSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm_password: z.string().min(6, "Please confirm your password"),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    phone: z.string().optional(),
    department: z.string().optional(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Use React Query mutation hook for registration
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setApiError(null);

    registerMutation.mutate(data, {
      onError: (error: any) => {
        const errorMessage =
          error?.message ||
          error?.response?.data?.message ||
          "Registration failed. Please try again.";
        setApiError(errorMessage);
      },
    });
  };

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto rounded-3xl border border-dairy-blue/10 bg-white p-8 shadow-dairy-lg sm:p-10"
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
          Create Account
        </motion.h2>
        <motion.p
          className="flex items-center justify-center gap-2 text-sm text-dairy-charcoal/70"
          variants={staggerItem}
        >
          <Sparkles className="h-4 w-4 text-dairy-orange" />
          Join Ichhadhari Dairy Management System
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
              <p className="text-sm font-semibold text-red-800">
                Registration Failed
              </p>
              <p className="text-sm text-red-600">{apiError}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Registration Form */}
      <motion.form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
        variants={staggerContainer}
      >
        {/* Username */}
        <motion.div className="space-y-2" variants={staggerItem}>
          <Label
            htmlFor="username"
            className="flex items-center gap-2 text-sm font-semibold text-dairy-charcoal"
          >
            <User className="h-4 w-4 text-dairy-blue" />
            Username *
          </Label>
          <Input
            id="username"
            type="text"
            placeholder="johndoe"
            disabled={registerMutation.isPending}
            className="h-12 rounded-xl border border-dairy-blue/20 bg-white text-base"
            {...register("username")}
          />
          {errors.username && (
            <p className="text-sm text-red-600">{errors.username.message}</p>
          )}
        </motion.div>

        {/* Email */}
        <motion.div className="space-y-2" variants={staggerItem}>
          <Label
            htmlFor="email"
            className="flex items-center gap-2 text-sm font-semibold text-dairy-charcoal"
          >
            <Mail className="h-4 w-4 text-dairy-blue" />
            Email *
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            disabled={registerMutation.isPending}
            className="h-12 rounded-xl border border-dairy-blue/20 bg-white text-base"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </motion.div>

        {/* Name Fields - Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div className="space-y-2" variants={staggerItem}>
            <Label
              htmlFor="first_name"
              className="flex items-center gap-2 text-sm font-semibold text-dairy-charcoal"
            >
              First Name
            </Label>
            <Input
              id="first_name"
              type="text"
              placeholder="John"
              disabled={registerMutation.isPending}
              className="h-12 rounded-xl border border-dairy-blue/20 bg-white text-base"
              {...register("first_name")}
            />
          </motion.div>

          <motion.div className="space-y-2" variants={staggerItem}>
            <Label
              htmlFor="last_name"
              className="flex items-center gap-2 text-sm font-semibold text-dairy-charcoal"
            >
              Last Name
            </Label>
            <Input
              id="last_name"
              type="text"
              placeholder="Doe"
              disabled={registerMutation.isPending}
              className="h-12 rounded-xl border border-dairy-blue/20 bg-white text-base"
              {...register("last_name")}
            />
          </motion.div>
        </div>

        {/* Phone & Department - Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div className="space-y-2" variants={staggerItem}>
            <Label
              htmlFor="phone"
              className="flex items-center gap-2 text-sm font-semibold text-dairy-charcoal"
            >
              <Phone className="h-4 w-4 text-dairy-blue" />
              Phone
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+919876543210"
              disabled={registerMutation.isPending}
              className="h-12 rounded-xl border border-dairy-blue/20 bg-white text-base"
              {...register("phone")}
            />
          </motion.div>

          <motion.div className="space-y-2" variants={staggerItem}>
            <Label
              htmlFor="department"
              className="flex items-center gap-2 text-sm font-semibold text-dairy-charcoal"
            >
              <Building2 className="h-4 w-4 text-dairy-blue" />
              Department
            </Label>
            <Input
              id="department"
              type="text"
              placeholder="Production"
              disabled={registerMutation.isPending}
              className="h-12 rounded-xl border border-dairy-blue/20 bg-white text-base"
              {...register("department")}
            />
          </motion.div>
        </div>

        {/* Password Fields */}
        <motion.div className="space-y-2" variants={staggerItem}>
          <Label
            htmlFor="password"
            className="flex items-center gap-2 text-sm font-semibold text-dairy-charcoal"
          >
            <Lock className="h-4 w-4 text-dairy-blue" />
            Password *
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter password (min. 6 characters)"
              disabled={registerMutation.isPending}
              className="h-12 rounded-xl border border-dairy-blue/20 bg-white pr-11 text-base"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={registerMutation.isPending}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dairy-charcoal/40"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </motion.div>

        <motion.div className="space-y-2" variants={staggerItem}>
          <Label
            htmlFor="confirm_password"
            className="flex items-center gap-2 text-sm font-semibold text-dairy-charcoal"
          >
            <Lock className="h-4 w-4 text-dairy-blue" />
            Confirm Password *
          </Label>
          <div className="relative">
            <Input
              id="confirm_password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter your password"
              disabled={registerMutation.isPending}
              className="h-12 rounded-xl border border-dairy-blue/20 bg-white pr-11 text-base"
              {...register("confirm_password")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={registerMutation.isPending}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dairy-charcoal/40"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.confirm_password && (
            <p className="text-sm text-red-600">
              {errors.confirm_password.message}
            </p>
          )}
        </motion.div>

        {/* Submit Button */}
        <motion.div variants={staggerItem} className="pt-4">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              disabled={registerMutation.isPending}
              className="group relative flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-dairy-blue/20 bg-dairy-blue text-base font-semibold text-white shadow-dairy-lg transition-all hover:bg-dairy-darkBlue disabled:cursor-not-allowed disabled:bg-dairy-blue/60"
            >
              {registerMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" className="text-white" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5" />
                  <span>Create Account</span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </motion.div>
        </motion.div>
      </motion.form>

      <motion.p
        className="mt-6 text-center text-sm text-dairy-charcoal/70"
        variants={staggerItem}
      >
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-dairy-blue transition-colors hover:text-dairy-darkBlue"
        >
          Sign In
        </Link>
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-6 flex items-center justify-center gap-2 text-xs text-dairy-charcoal/60"
      >
        <Shield className="h-4 w-4 text-dairy-green" />
        <span>Your data is secured with 256-bit SSL encryption</span>
      </motion.div>
    </motion.div>
  );
}
