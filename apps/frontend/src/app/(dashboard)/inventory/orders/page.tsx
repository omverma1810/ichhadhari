"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function InventoryOrdersPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/inventory/purchase-orders");
  }, [router]);
  return null;
}
