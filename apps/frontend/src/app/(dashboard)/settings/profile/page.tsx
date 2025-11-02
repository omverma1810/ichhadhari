"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { User, Mail, Phone, Building2, Save, Lock, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useMe,
  useUpdateProfile,
  useChangePassword,
} from "@/hooks/api/useAuth";
import { staggerContainer, staggerItem } from "@/lib/utils/animations";

// Profile update schema
const profileSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

// Password change schema
const passwordSchema = z
  .object({
    old_password: z.string().min(1, "Current password is required"),
    new_password: z
      .string()
      .min(6, "New password must be at least 6 characters"),
    confirm_password: z.string().min(6, "Please confirm your password"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { data: user, isLoading: userLoading } = useMe();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: {
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      department: user?.department || "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileFormData) => {
    updateProfileMutation.mutate(data, {
      onSuccess: () => {
        // Profile updated successfully (toast already shown in hook)
      },
    });
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    changePasswordMutation.mutate(data, {
      onSuccess: () => {
        resetPassword();
      },
    });
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-dairy-charcoal/70">Failed to load user profile</p>
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-4xl mx-auto py-8 px-4"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      <motion.div className="mb-8" variants={staggerItem}>
        <h1 className="text-3xl font-bold text-dairy-charcoal mb-2">
          Account Settings
        </h1>
        <p className="text-dairy-charcoal/70">
          Manage your profile and security settings
        </p>
      </motion.div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <motion.div variants={staggerItem}>
            <Card className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-dairy-charcoal mb-1">
                  Personal Information
                </h2>
                <p className="text-sm text-dairy-charcoal/70">
                  Update your profile details
                </p>
              </div>

              <form
                onSubmit={handleProfileSubmit(onProfileSubmit)}
                className="space-y-5"
              >
                {/* User Info Display */}
                <div className="mb-6 p-4 bg-dairy-blue/5 rounded-xl border border-dairy-blue/10">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-dairy-blue text-white text-2xl font-bold">
                      {(user.first_name || user.username)
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-dairy-charcoal">
                        {user.username}
                      </p>
                      <p className="text-sm text-dairy-charcoal/70">
                        {user.role_display || user.role}
                      </p>
                      <p className="text-xs text-dairy-charcoal/50 mt-1">
                        Member since{" "}
                        {new Date(user.date_joined).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="first_name"
                      className="flex items-center gap-2"
                    >
                      <User className="h-4 w-4 text-dairy-blue" />
                      First Name
                    </Label>
                    <Input
                      id="first_name"
                      type="text"
                      placeholder="John"
                      disabled={updateProfileMutation.isPending}
                      className="h-11"
                      {...registerProfile("first_name")}
                    />
                    {profileErrors.first_name && (
                      <p className="text-sm text-red-600">
                        {profileErrors.first_name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      type="text"
                      placeholder="Doe"
                      disabled={updateProfileMutation.isPending}
                      className="h-11"
                      {...registerProfile("last_name")}
                    />
                    {profileErrors.last_name && (
                      <p className="text-sm text-red-600">
                        {profileErrors.last_name.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-dairy-blue" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    disabled={updateProfileMutation.isPending}
                    className="h-11"
                    {...registerProfile("email")}
                  />
                  {profileErrors.email && (
                    <p className="text-sm text-red-600">
                      {profileErrors.email.message}
                    </p>
                  )}
                </div>

                {/* Phone & Department */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-dairy-blue" />
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+919876543210"
                      disabled={updateProfileMutation.isPending}
                      className="h-11"
                      {...registerProfile("phone")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="department"
                      className="flex items-center gap-2"
                    >
                      <Building2 className="h-4 w-4 text-dairy-blue" />
                      Department
                    </Label>
                    <Input
                      id="department"
                      type="text"
                      placeholder="Production"
                      disabled={updateProfileMutation.isPending}
                      className="h-11"
                      {...registerProfile("department")}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => resetProfile()}
                    disabled={updateProfileMutation.isPending}
                  >
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="bg-dairy-blue hover:bg-dairy-darkBlue"
                  >
                    {updateProfileMutation.isPending ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <motion.div variants={staggerItem}>
            <Card className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-dairy-charcoal mb-1">
                  Change Password
                </h2>
                <p className="text-sm text-dairy-charcoal/70">
                  Update your password to keep your account secure
                </p>
              </div>

              <form
                onSubmit={handlePasswordSubmit(onPasswordSubmit)}
                className="space-y-5"
              >
                {/* Current Password */}
                <div className="space-y-2">
                  <Label
                    htmlFor="old_password"
                    className="flex items-center gap-2"
                  >
                    <Lock className="h-4 w-4 text-dairy-blue" />
                    Current Password
                  </Label>
                  <Input
                    id="old_password"
                    type="password"
                    placeholder="Enter current password"
                    disabled={changePasswordMutation.isPending}
                    className="h-11"
                    {...registerPassword("old_password")}
                  />
                  {passwordErrors.old_password && (
                    <p className="text-sm text-red-600">
                      {passwordErrors.old_password.message}
                    </p>
                  )}
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <Label
                    htmlFor="new_password"
                    className="flex items-center gap-2"
                  >
                    <Shield className="h-4 w-4 text-dairy-blue" />
                    New Password
                  </Label>
                  <Input
                    id="new_password"
                    type="password"
                    placeholder="Enter new password (min. 6 characters)"
                    disabled={changePasswordMutation.isPending}
                    className="h-11"
                    {...registerPassword("new_password")}
                  />
                  {passwordErrors.new_password && (
                    <p className="text-sm text-red-600">
                      {passwordErrors.new_password.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label
                    htmlFor="confirm_password"
                    className="flex items-center gap-2"
                  >
                    <Shield className="h-4 w-4 text-dairy-blue" />
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    placeholder="Re-enter new password"
                    disabled={changePasswordMutation.isPending}
                    className="h-11"
                    {...registerPassword("confirm_password")}
                  />
                  {passwordErrors.confirm_password && (
                    <p className="text-sm text-red-600">
                      {passwordErrors.confirm_password.message}
                    </p>
                  )}
                </div>

                {/* Password Requirements */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-900 mb-2">
                    Password Requirements:
                  </p>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>Minimum 6 characters long</li>
                    <li>Must be different from current password</li>
                  </ul>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => resetPassword()}
                    disabled={changePasswordMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={changePasswordMutation.isPending}
                    className="bg-dairy-blue hover:bg-dairy-darkBlue"
                  >
                    {changePasswordMutation.isPending ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Change Password
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
