"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { authAPI } from "@/lib/api/auth";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { getErrorMessage } from "@/lib/utils/api-helpers";
import { MilkDrop } from "@/components/icons";
import { staggerContainer, staggerItem } from "@/lib/utils/animations";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const email = watch("email");

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      await authAPI.forgotPassword(data.email);
      setEmailSent(true);
      toast.success("Password reset link sent to your email!");
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.1,
          }}
          className="inline-flex items-center justify-center w-20 h-20 bg-gradient-success rounded-full mb-6 relative"
        >
          <motion.div
            className="absolute inset-0 rounded-full bg-brand-green-400"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <CheckCircle className="w-10 h-10 text-white relative z-10" />
        </motion.div>
        <motion.h2
          className="text-3xl font-bold text-brand-brown-800 mb-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Check Your Email
        </motion.h2>
        <motion.p
          className="text-brand-brown-600 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          We&apos;ve sent a password reset link to <br />
          <span className="font-semibold text-brand-orange-600">{email}</span>
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4 bg-gradient-to-br from-brand-blue-50 to-dairy-sky rounded-xl border border-brand-blue-200 mb-8"
        >
          <p className="text-sm text-brand-blue-800">
            <span className="font-semibold">
              Didn&apos;t receive the email?
            </span>
            <br />
            Check your spam folder or{" "}
            <button
              onClick={() => setEmailSent(false)}
              className="text-brand-orange-600 hover:text-brand-orange-800 font-semibold underline"
            >
              try again
            </button>
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Link href="/login">
            <Button className="w-full bg-gradient-primary hover:shadow-glow text-white font-semibold h-12 rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="w-full"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={staggerItem}>
        <Link
          href="/login"
          className="inline-flex items-center text-sm text-brand-brown-600 hover:text-brand-orange-600 mb-6 transition-colors font-medium group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to login
        </Link>
      </motion.div>
      <motion.div className="text-center mb-6" variants={staggerItem}>
        <motion.div
          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-orange-400 to-brand-yellow-400 rounded-2xl mb-4 shadow-glow"
          whileHover={{ scale: 1.05, rotate: 5 }}
        >
          <Send className="w-8 h-8 text-white" />
        </motion.div>
      </motion.div>
      <motion.div className="mb-8" variants={staggerItem}>
        <h2 className="text-3xl font-bold text-brand-brown-800 mb-2 text-center">
          Forgot Password?
        </h2>
        <p className="text-brand-brown-600 text-center flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-yellow-500" />
          No worries, we&apos;ll send you reset instructions
        </p>
      </motion.div>
      <motion.form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
        variants={staggerContainer}
      >
        <motion.div className="space-y-2" variants={staggerItem}>
          <Label
            htmlFor="email"
            className="text-sm font-semibold text-brand-brown-700 flex items-center gap-2"
          >
            <Mail className="w-4 h-4 text-brand-orange-500" />
            Email Address
          </Label>
          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-orange-500 group-focus-within:text-brand-yellow-600 transition-colors z-10" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="pl-11 h-13 border-2 border-brand-orange-200 focus:border-brand-orange-500 bg-white/70 backdrop-blur-sm transition-all hover:border-brand-orange-300 rounded-xl text-base font-medium"
              {...register("email")}
            />
            <motion.div className="absolute inset-0 rounded-xl bg-gradient-primary opacity-0 group-focus-within:opacity-10 pointer-events-none transition-opacity" />
          </div>
          <AnimatePresence>
            {errors.email ? (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm text-red-600 flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                {errors.email.message}
              </motion.p>
            ) : null}
          </AnimatePresence>
        </motion.div>
        <motion.div variants={staggerItem}>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-13 bg-gradient-primary hover:shadow-glow-lg text-white font-bold text-base relative overflow-hidden group rounded-xl"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-brand-yellow-400 via-brand-orange-500 to-brand-yellow-400"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{ backgroundSize: "200% 100%" }}
              />
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="text-white" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Send Reset Link</span>
                  </>
                )}
              </span>
            </Button>
          </motion.div>
        </motion.div>
      </motion.form>
      <motion.div
        variants={staggerItem}
        className="mt-6 p-4 bg-gradient-to-br from-brand-orange-50 to-dairy-cream rounded-xl border border-brand-orange-200"
      >
        <div className="flex items-start gap-3">
          <MilkDrop className="w-5 h-5 text-brand-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-brand-brown-800 mb-1">
              What happens next?
            </p>
            <p className="text-xs text-brand-brown-600">
              You&apos;ll receive an email with instructions to reset your
              password. The link will be valid for 24 hours.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
