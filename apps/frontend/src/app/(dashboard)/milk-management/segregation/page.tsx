"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Split,
  Droplet,
  Plus,
  Save,
  Trash2,
  Sparkles,
  Factory,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  useCollectionStats,
  useSegregationPlans,
  useCreateSegregationPlan,
} from "@/hooks/api/useMilkManagement";
import { useProducts } from "@/hooks/api/useProduction";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils/formatters";

const PALETTE = [
  "#F5A623",
  "#4A90E2",
  "#7ED321",
  "#BD10E0",
  "#50E3C2",
  "#B8E986",
  "#F8E71C",
  "#FF6F61",
];

type AllocationRow = {
  productId: string;
  allocatedLiters: string;
  notes: string;
};

export default function MilkSegregationPage() {
  const [planDate, setPlanDate] = useState<Date>(new Date());
  const [totalLiters, setTotalLiters] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [rows, setRows] = useState<AllocationRow[]>([
    { productId: "", allocatedLiters: "", notes: "" },
  ]);

  const { data: collectionStats } = useCollectionStats(7);
  const { data: productsData, isLoading: loadingProducts } = useProducts();
  const { data: plansData } = useSegregationPlans({ page_size: 5 });
  const createPlan = useCreateSegregationPlan();

  const products = productsData?.results ?? [];
  const plans = plansData?.results ?? [];
  const latestPlan = plans[0];

  const totalAvailable = Number(collectionStats?.total_quantity || 0);

  const selectedIds = new Set(rows.map((row) => row.productId).filter(Boolean));

  const allocations = useMemo(() => {
    return rows.map((row) => {
      const product = products.find(
        (item: any) => String(item.id) === row.productId,
      );
      const allocated = Number(row.allocatedLiters) || 0;
      const milkRequired = Number(product?.milk_required_per_unit) || 0;
      const plannedUnits = milkRequired > 0 ? allocated / milkRequired : 0;
      return {
        ...row,
        product,
        allocated,
        plannedUnits,
      };
    });
  }, [rows, products]);

  const validAllocations = allocations.filter((row) => row.product);

  const allocatedTotal = validAllocations.reduce(
    (sum, row) => sum + row.allocated,
    0,
  );

  const effectiveTotal = Number(totalLiters) || totalAvailable || 0;
  const remaining = Math.max(effectiveTotal - allocatedTotal, 0);

  const pieData = validAllocations.map((row, index) => ({
    name: row.product?.name ?? "",
    value: row.allocated,
    color: PALETTE[index % PALETTE.length],
  }));

  const trendData = latestPlan?.items?.map((item: any) => ({
    name: item.product_name,
    liters: Number(item.allocated_liters) || 0,
  }));

  const updateRow = (index: number, next: Partial<AllocationRow>) => {
    setRows((prev) =>
      prev.map((row, idx) => (idx === index ? { ...row, ...next } : row)),
    );
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { productId: "", allocatedLiters: "", notes: "" },
    ]);
  };

  const removeRow = (index: number) => {
    setRows((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSave = () => {
    const payloadItems = validAllocations.map((row) => ({
      product: Number(row.product?.id),
      allocated_liters: row.allocated,
      notes: row.notes,
    }));

    if (effectiveTotal <= 0) {
      toast.error("Enter total available milk to plan segregation");
      return;
    }

    if (!payloadItems.length) {
      toast.error("Add at least one product allocation");
      return;
    }

    if (allocatedTotal > effectiveTotal) {
      toast.error("Allocated liters exceed total available milk");
      return;
    }

    createPlan.mutate(
      {
        plan_date: format(planDate, "yyyy-MM-dd"),
        total_liters: effectiveTotal,
        notes: notes || undefined,
        items: payloadItems,
      },
      {
        onSuccess: () => {
          setRows([{ productId: "", allocatedLiters: "", notes: "" }]);
          setNotes("");
        },
      },
    );
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="flex items-center gap-3 text-3xl font-bold text-dairy-charcoal">
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Split className="h-8 w-8 text-dairy-blue" />
          </motion.div>
          Milk segregation planning
        </h1>
        <p className="mt-1 text-gray-600">
          Manually allocate milk into products like paneer, dahi, and more using
          your product catalog.
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-none shadow-[0_20px_60px_rgba(30,136,229,0.12)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-dairy-blue" />
              Create segregation plan
            </CardTitle>
            <CardDescription>
              Allocate available milk into products and see planned production
              units instantly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Plan date</Label>
                <Input
                  type="date"
                  value={format(planDate, "yyyy-MM-dd")}
                  onChange={(event) =>
                    setPlanDate(new Date(event.target.value))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Total milk available (L)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={totalLiters}
                  placeholder={
                    totalAvailable
                      ? `${formatNumber(totalAvailable)} L (last 7 days)`
                      : "Enter total liters"
                  }
                  onChange={(event) => setTotalLiters(event.target.value)}
                />
              </div>
              <div className="rounded-xl border border-dashed border-blue-100 bg-blue-50/60 p-3">
                <p className="text-xs uppercase text-blue-500">
                  Remaining milk
                </p>
                <p className="text-2xl font-semibold text-blue-700">
                  {formatNumber(remaining)} L
                </p>
                <p className="text-xs text-blue-500">
                  Allocated: {formatNumber(allocatedTotal)} L
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-dairy-charcoal">
                  Product allocations
                </h3>
                <Button type="button" size="sm" onClick={addRow}>
                  <Plus className="mr-1 h-4 w-4" />
                  Add product
                </Button>
              </div>

              <div className="space-y-3">
                {rows.map((row, index) => (
                  <div
                    key={`allocation-${index}`}
                    className="grid gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm md:grid-cols-[2fr_1fr_1fr_auto]"
                  >
                    <div className="space-y-1.5">
                      <Label className="text-xs">Product</Label>
                      <Select
                        value={row.productId}
                        onValueChange={(value) =>
                          updateRow(index, { productId: value })
                        }
                        disabled={loadingProducts}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              loadingProducts
                                ? "Loading products..."
                                : "Select product"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product: any) => (
                            <SelectItem
                              key={product.id}
                              value={String(product.id)}
                              disabled={
                                selectedIds.has(String(product.id)) &&
                                row.productId !== String(product.id)
                              }
                            >
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Allocated (L)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0"
                        value={row.allocatedLiters}
                        onChange={(event) =>
                          updateRow(index, {
                            allocatedLiters: event.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Planned units</Label>
                      <div className="flex h-10 items-center rounded-md border border-dashed border-gray-200 px-3 text-sm text-gray-600">
                        {allocations[index]?.plannedUnits
                          ? formatNumber(allocations[index].plannedUnits)
                          : "—"}
                      </div>
                    </div>

                    <div className="flex items-end justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRow(index)}
                        className={cn(rows.length === 1 && "invisible")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="md:col-span-4">
                      <Textarea
                        rows={2}
                        placeholder="Optional notes for this allocation"
                        value={row.notes}
                        onChange={(event) =>
                          updateRow(index, { notes: event.target.value })
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Plan notes</Label>
              <Textarea
                rows={3}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Add planning notes, shift details, or constraints"
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted-foreground">
                Total planned units are derived from product milk requirements.
              </div>
              <Button
                type="button"
                onClick={handleSave}
                disabled={createPlan.isPending}
              >
                <Save className="mr-2 h-4 w-4" />
                {createPlan.isPending ? "Saving..." : "Save segregation"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none bg-gradient-to-br from-[#EEF7FF] via-[#F8FBFF] to-[#FFFFFF] shadow-[0_20px_45px_rgba(74,144,226,0.2)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Droplet className="h-4 w-4 text-dairy-blue" />
                Allocation snapshot
              </CardTitle>
              <CardDescription>
                Visualize the current product mix before saving.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[260px]">
              {pieData.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={80}
                      label
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => `${formatNumber(value)} L`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Add allocations to preview the mix.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Factory className="h-4 w-4 text-dairy-blue" />
                Latest segregation plan
              </CardTitle>
              <CardDescription>
                Reference the most recent plan for production planning.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {latestPlan ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-blue-50/60 p-3">
                    <div>
                      <p className="text-xs uppercase text-blue-500">
                        Plan date
                      </p>
                      <p className="text-sm font-semibold text-blue-900">
                        {latestPlan.plan_date}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-blue-500">
                        Total liters
                      </p>
                      <p className="text-sm font-semibold text-blue-900">
                        {formatNumber(latestPlan.total_liters)} L
                      </p>
                    </div>
                  </div>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={trendData ?? []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip
                          formatter={(value: number) =>
                            `${formatNumber(value)} L`
                          }
                        />
                        <Bar
                          dataKey="liters"
                          fill="#4A90E2"
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
                  No segregation plans yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent plans</CardTitle>
          <CardDescription>
            Review the last few segregation decisions for audits or planning.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {plans.length ? (
            plans.map((plan: any) => (
              <div
                key={plan.id}
                className="flex flex-col gap-2 rounded-xl border border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold">{plan.plan_date}</p>
                  <p className="text-xs text-muted-foreground">
                    {plan.items.length} products ·{" "}
                    {formatNumber(plan.total_liters)} L
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">
                  {plan.created_by_name ? `By ${plan.created_by_name}` : ""}
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground">
              No plans created yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
