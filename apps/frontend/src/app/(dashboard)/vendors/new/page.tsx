"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { VendorForm } from "@/app/(dashboard)/vendors/_components/vendor-form";

const motivationPhrases = [
  "Strengthen your supply chain with richer vendor data.",
  "Capture payment preferences to streamline reconciliations.",
  "Store key compliance documents to stay audit ready.",
  "Use auto-save to safeguard longer onboarding sessions.",
];

export default function CreateVendorPage() {
  const router = useRouter();
  const tip = useMemo(
    () =>
      motivationPhrases[Math.floor(Math.random() * motivationPhrases.length)],
    []
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="space-y-6"
    >
      <header className="flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-[#FFF3D9] via-[#FFF9EC] to-[#FFFEF7] p-6 shadow-[0_20px_45px_rgba(244,169,32,0.25)] lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <Button
            type="button"
            variant="ghost"
            className="w-fit rounded-full bg-white/70 text-[#8B5A3C] hover:bg-[#F4A920]/15 hover:text-[#5D4037]"
            onClick={() => router.push("/vendors")}
          >
            <ArrowLeft className="mr-2 size-4" />
            Back to Vendors
          </Button>
          <div>
            <h1 className="text-3xl font-semibold text-[#5D4037]">
              Onboard New Vendor
            </h1>
            <p className="mt-1 text-sm text-[#8B5A3C]/80">
              Provide comprehensive details to enable purchase orders, payments,
              and performance tracking.
            </p>
          </div>
        </div>
        <Card className="max-w-sm border-none bg-white/80 shadow-[0_12px_30px_rgba(93,64,55,0.15)]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[#8B5A3C]/70">
              <Sparkles className="size-4 text-[#F4A920]" />
              Productivity Tip
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[#5D4037]">
            {tip}
            <Link
              href="/vendors/list"
              className="ml-1 text-[#1E88E5] hover:underline"
            >
              Review existing vendor data
            </Link>
            to avoid duplicates.
          </CardContent>
        </Card>
      </header>

      <VendorForm mode="create" />
    </motion.section>
  );
}
