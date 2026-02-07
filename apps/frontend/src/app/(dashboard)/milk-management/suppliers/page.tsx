"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, PencilLine, Plus, RefreshCcw, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

import { StatsCard } from "@/components/cards/StatsCard";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import {
  SupplierFormModal,
  type SupplierFormValues,
} from "@/components/milk-management/suppliers/SupplierFormModal";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateSupplier,
  useDeleteSupplier,
  useSuppliers,
  useUpdateSupplier,
} from "@/hooks/api/milk-management/suppliers";
import { getErrorMessage } from "@/lib/utils/api-helpers";
import { cn } from "@/lib/utils/cn";
import { formatCurrency, formatNumber } from "@/lib/utils/formatters";
import type {
  Supplier,
  SupplierStatus,
  SupplierType,
  PaymentCycle,
  SupplierFilters,
} from "@/types/api";

const PAGE_SIZE = 20;

type SupplierRow = Omit<Supplier, "id"> & {
  id: string;
  supplierId: number;
};

type FilterState = {
  status: "all" | SupplierStatus;
  supplier_type: "all" | SupplierType;
  route_name: "all" | string;
  payment_cycle: "all" | PaymentCycle;
};

const statusClasses: Record<SupplierStatus, string> = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  inactive: "border-slate-200 bg-slate-50 text-slate-600",
  suspended: "border-amber-200 bg-amber-50 text-amber-700",
};
document;
export default function SuppliersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    status: "all",
    supplier_type: "all",
    route_name: "all",
    payment_cycle: "all",
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null,
  );

  const queryFilters = useMemo<SupplierFilters>(
    () => ({
      page,
      search: searchTerm || undefined,
      status: filters.status !== "all" ? filters.status : undefined,
      supplier_type:
        filters.supplier_type !== "all" ? filters.supplier_type : undefined,
      route_name: filters.route_name !== "all" ? filters.route_name : undefined,
      payment_cycle:
        filters.payment_cycle !== "all" ? filters.payment_cycle : undefined,
      page_size: PAGE_SIZE,
    }),
    [page, searchTerm, filters],
  );

  const { data, isLoading, isFetching, error, refetch } =
    useSuppliers(queryFilters);

  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const deleteSupplier = useDeleteSupplier();

  useEffect(() => {
    setPage(1);
  }, [
    searchTerm,
    filters.status,
    filters.supplier_type,
    filters.route_name,
    filters.payment_cycle,
  ]);

  const routes = useMemo(() => {
    const unique = new Set<string>();
    data?.results.forEach((supplier) => {
      if (supplier.route_name) unique.add(supplier.route_name);
    });
    return Array.from(unique).sort();
  }, [data?.results]);

  const suppliers = useMemo<SupplierRow[]>(() => {
    return (data?.results ?? []).map((supplier) => ({
      ...supplier,
      supplierId: supplier.id,
      id: String(supplier.id),
    }));
  }, [data?.results]);

  const summary = useMemo(() => {
    const total = data?.count ?? 0;
    const active = suppliers.filter((item) => item.status === "active").length;
    const outstanding = suppliers.reduce((sum, supplier) => {
      return sum + toNumber(supplier.outstanding_balance);
    }, 0);
    const totalMilk = suppliers.reduce((sum, supplier) => {
      return sum + toNumber(supplier.total_milk_supplied);
    }, 0);

    return {
      total,
      active,
      routes: routes.length,
      outstanding,
      totalMilk,
    };
  }, [data?.count, suppliers, routes.length]);

  const columns: Column<SupplierRow>[] = useMemo(
    () => [
      {
        key: "supplier_id",
        label: "ID",
        sortable: true,
        render: (value) => (
          <span className="font-mono text-xs font-semibold text-dairy-blue">
            {String(value)}
          </span>
        ),
      },
      {
        key: "name",
        label: "Name",
        sortable: true,
        render: (value, row) => (
          <div>
            <p className="font-semibold text-gray-900">{String(value)}</p>
            <p className="text-xs text-gray-500">{row.phone}</p>
          </div>
        ),
      },
      {
        key: "supplier_type",
        label: "Type",
        render: (value) => (
          <Badge variant="outline" className="capitalize">
            {String(value)}
          </Badge>
        ),
      },
      {
        key: "route_name",
        label: "Route",
      },
      {
        key: "status",
        label: "Status",
        render: (value: unknown) => {
          const status = (value as SupplierStatus) ?? "inactive";
          return (
            <Badge className={cn("capitalize", statusClasses[status])}>
              {status}
            </Badge>
          );
        },
      },
      {
        key: "avg_quality_score",
        label: "Avg Quality",
        render: (_, row) => (
          <div className="flex items-center gap-2">
            <span>{toNumber(row.avg_quality_score).toFixed(1)}%</span>
            <QualityIndicator score={toNumber(row.avg_quality_score)} />
          </div>
        ),
      },
      {
        key: "total_milk_supplied",
        label: "Total Milk (L)",
        render: (_, row) => formatNumber(toNumber(row.total_milk_supplied)),
      },
      {
        key: "outstanding_balance",
        label: "Outstanding",
        render: (_, row) => {
          const amount = toNumber(row.outstanding_balance);
          return (
            <span className={cn(amount > 0 && "text-red-600 font-semibold")}>
              {formatCurrency(amount)}
            </span>
          );
        },
      },
      {
        key: "actions",
        label: "Actions",
        render: (_, row) => (
          <div className="flex items-center gap-2">
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() =>
                router.push(`/milk-management/suppliers/${row.supplierId}`)
              }
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => {
                const { supplierId, id: _rowId, ...rest } = row;
                setSelectedSupplier({ ...rest, id: supplierId });
              }}
              title="Edit"
            >
              <PencilLine className="h-4 w-4" />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              className="text-red-600 hover:bg-red-50"
              onClick={() => handleDelete(row)}
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [router],
  );

  const handleCreate = async (formValues: SupplierFormValues) => {
    try {
      await createSupplier.mutateAsync({
        supplier_id: formValues.supplier_id,
        name: formValues.name,
        supplier_type: formValues.supplier_type,
        phone: formValues.phone,
        alternate_phone: normalizeOptional(formValues.alternate_phone),
        email: normalizeOptional(formValues.email),
        address: formValues.address,
        route_name: formValues.route_name,
        collection_time: formValues.collection_time,
        payment_cycle: formValues.payment_cycle,
        bank_name: formValues.bank_name,
        account_number: formValues.account_number,
        ifsc_code: formValues.ifsc_code,
        notes: formValues.notes,
      });
      toast.success("Supplier created successfully");
      setIsCreateModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleUpdate = async (
    supplier: Supplier,
    formValues: SupplierFormValues,
  ) => {
    try {
      await updateSupplier.mutateAsync({
        id: supplier.id,
        data: {
          name: formValues.name,
          supplier_type: formValues.supplier_type,
          status: formValues.status,
          phone: formValues.phone,
          alternate_phone: normalizeOptional(formValues.alternate_phone),
          email: normalizeOptional(formValues.email),
          address: formValues.address,
          route_name: formValues.route_name,
          collection_time: formValues.collection_time,
          payment_cycle: formValues.payment_cycle,
          bank_name: formValues.bank_name,
          account_number: formValues.account_number,
          ifsc_code: formValues.ifsc_code,
          notes: formValues.notes,
        },
      });
      toast.success("Supplier updated successfully");
      setSelectedSupplier(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async (supplier: SupplierRow) => {
    if (!window.confirm(`Delete supplier ${supplier.name}?`)) return;
    try {
      await deleteSupplier.mutateAsync(supplier.supplierId);
      toast.success("Supplier deleted successfully");
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (isLoading && !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner withText text="Loading suppliers..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorMessage
          message="Failed to load suppliers"
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-dairy-charcoal">
            <Users className="h-8 w-8 text-dairy-blue" />
            Suppliers Management
          </h1>
          <p className="text-sm text-gray-600">
            Track procurement partners, their quality metrics, and payment
            status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="gap-2 bg-linear-to-r from-[#F4A920] via-[#F4A920] to-[#8B5A3C] text-white shadow-[0_10px_20px_rgba(244,169,32,0.25)] transition-transform duration-200 hover:scale-[1.02] hover:from-[#8B5A3C] hover:to-[#F4A920]"
            onClick={() => {
              setIsCreateModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add Supplier
          </Button>
          <Button
            variant="ghost"
            className="gap-2"
            onClick={() => {
              refetch();
            }}
            disabled={isFetching}
          >
            <RefreshCcw
              className={cn("h-4 w-4", isFetching && "animate-spin")}
            />
            Refresh
          </Button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Total Suppliers"
          value={summary.total}
          icon={Users}
          animateValue
        />
        <StatsCard
          title="Active Suppliers"
          value={summary.active}
          icon={Users}
          color="green"
          animateValue
        />
        <StatsCard
          title="Routes Covered"
          value={summary.routes}
          icon={Users}
          color="orange"
          animateValue
        />
        <StatsCard
          title="Outstanding Balance"
          value={summary.outstanding}
          icon={Users}
          color="red"
          valuePrefix="₹"
          animateValue
        />
      </section>

      <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-dairy">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <FilterSelect
            label="Status"
            value={filters.status}
            onChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                status: value as FilterState["status"],
              }))
            }
            options={[
              { label: "All Status", value: "all" },
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
              { label: "Suspended", value: "suspended" },
            ]}
          />

          <FilterSelect
            label="Type"
            value={filters.supplier_type}
            onChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                supplier_type: value as FilterState["supplier_type"],
              }))
            }
            options={[
              { label: "All Types", value: "all" },
              { label: "Milk Supplier", value: "milk_supplier" },
              { label: "Equipment", value: "equipment" },
              { label: "Packaging", value: "packaging" },
              { label: "Chemical", value: "chemical" },
              { label: "Other", value: "other" },
            ]}
          />

          <FilterSelect
            label="Payment Cycle"
            value={filters.payment_cycle}
            onChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                payment_cycle: value as FilterState["payment_cycle"],
              }))
            }
            options={[
              { label: "All Cycles", value: "all" },
              { label: "Daily", value: "daily" },
              { label: "Weekly", value: "weekly" },
              { label: "Fortnightly", value: "fortnightly" },
              { label: "Monthly", value: "monthly" },
            ]}
          />

          <FilterSelect
            label="Route"
            value={filters.route_name}
            onChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                route_name: value as FilterState["route_name"],
              }))
            }
            options={[
              { label: "All Routes", value: "all" },
              ...routes.map((route) => ({ label: route, value: route })),
            ]}
          />

          <FilterSelect
            label="Quick Search"
            value={searchTerm}
            onChange={(value) => setSearchTerm(value)}
            options={[]}
            isSearch
          />
        </div>
      </section>

      <DataTable
        columns={columns}
        data={suppliers}
        isLoading={isFetching && !data}
        onSearch={(query) => setSearchTerm(query)}
        pagination={{
          page,
          totalPages: Math.max(1, Math.ceil((data?.count ?? 0) / PAGE_SIZE)),
          onPageChange: setPage,
        }}
        searchPlaceholder="Search by ID, name, or phone..."
        emptyTitle="No suppliers found"
        emptyDescription="Adjust filters or add your first supplier."
      />

      <SupplierFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        loading={createSupplier.isPending}
      />

      <SupplierFormModal
        isOpen={Boolean(selectedSupplier)}
        onClose={() => setSelectedSupplier(null)}
        onSubmit={(values) =>
          selectedSupplier
            ? handleUpdate(selectedSupplier, values)
            : Promise.resolve()
        }
        initialData={selectedSupplier ?? undefined}
        loading={updateSupplier.isPending}
      />
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  isSearch = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  isSearch?: boolean;
}) {
  if (isSearch) {
    return (
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          {label}
        </p>
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search suppliers..."
          className="h-10"
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-10">
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function QualityIndicator({ score }: { score: number }) {
  const color =
    score >= 90
      ? "bg-emerald-500"
      : score >= 75
        ? "bg-blue-500"
        : score >= 60
          ? "bg-amber-500"
          : "bg-red-500";
  return <span className={cn("h-2.5 w-2.5 rounded-full", color)} />;
}

const normalizeOptional = (value?: string | null) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const toNumber = (value: number | string | null | undefined): number => {
  if (value == null) return 0;
  const parsed = Number(typeof value === "string" ? value : value);
  return Number.isFinite(parsed) ? parsed : 0;
};
