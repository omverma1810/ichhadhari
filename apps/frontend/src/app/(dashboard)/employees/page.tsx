"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  BellRing,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Download,
  Filter,
  Mail,
  MoreHorizontal,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { formatDate, formatNumber } from "@/lib/utils/formatters";
import { useEmployees, useDeleteEmployee, useUpdateEmployee } from "@/hooks/api/useVendorsEmployees";
import type { Employee, EmployeeStatus } from "@/types/employee";

const PAGE_SIZE = 8;

type SortOption =
  | "name-asc"
  | "name-desc"
  | "department-asc"
  | "join-date-desc"
  | "performance-desc";

type FocusView = "all" | "top-performers" | "attendance-risk" | "new-joiners";

type DialogConfig =
  | {
      type: "status";
      employee: Employee;
      nextStatus: EmployeeStatus;
    }
  | {
      type: "delete";
      employee: Employee;
    };

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "join-date-desc", label: "Join Date (Recent)" },
  { value: "name-asc", label: "Name (A-Z)" },
  { value: "name-desc", label: "Name (Z-A)" },
  { value: "department-asc", label: "Department" },
  { value: "performance-desc", label: "Performance" },
];

const statusMeta: Record<
  EmployeeStatus,
  { label: string; className: string; description: string }
> = {
  active: {
    label: "Active",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    description: "Employee is active and available",
  },
  on_leave: {
    label: "On Leave",
    className:
      "bg-amber-50 text-amber-700 border-amber-200 animate-[pulse_2.5s_ease-in-out_infinite]",
    description: "Employee is currently on leave",
  },
  suspended: {
    label: "Suspended",
    className: "bg-red-50 text-red-700 border-red-200",
    description: "Access is temporarily suspended",
  },
  resigned: {
    label: "Resigned",
    className: "bg-slate-100 text-slate-500 border-slate-200",
    description: "Employee has resigned",
  },
};

const roleBadgeMap: Record<Employee["role"], string> = {
  admin: "bg-[#F4A920]/10 text-[#8A5100] border-[#F4A920]/40",
  manager: "bg-blue-50 text-blue-700 border-blue-200",
  supervisor: "bg-purple-50 text-purple-700 border-purple-200",
  staff: "bg-slate-50 text-slate-700 border-slate-200",
  operator: "bg-lime-50 text-lime-700 border-lime-200",
};

const employmentTypeLabel: Record<Employee["employment_type"], string> = {
  full_time: "Full-Time",
  part_time: "Part-Time",
  contract: "Contract",
  temporary: "Temporary",
};

const departmentPalette = [
  "bg-[#FFF4E5] text-[#8A5100] border-[#FFD19A]/70",
  "bg-[#E6F4EA] text-[#1D6D3C] border-[#BDE9CC]/70",
  "bg-[#E8F1FF] text-[#1E4B91] border-[#BBD4FF]/70",
  "bg-[#F5E8FF] text-[#5A2F91] border-[#DCC7FF]/70",
  "bg-[#FFF1F5] text-[#924058] border-[#FFC4D7]/70",
];

function getDepartmentBadgeClass(department: string) {
  if (!department) return departmentPalette[0];
  const hash = department
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return departmentPalette[hash % departmentPalette.length];
}

function getInitials(employee: Employee) {
  const first = employee.first_name?.[0] ?? "";
  const last = employee.last_name?.[0] ?? "";
  return `${first}${last}`.toUpperCase();
}

function formatRoleLabel(role: Employee["role"]) {
  switch (role) {
    case "admin":
      return "Administrator";
    case "manager":
      return "Manager";
    case "supervisor":
      return "Supervisor";
    case "operator":
      return "Operator";
    default:
      return "Staff";
  }
}

function getFocusDescription(focus: FocusView) {
  switch (focus) {
    case "top-performers":
      return "Highlighting employees rated 4.5 or above.";
    case "attendance-risk":
      return "Focusing on employees under the attendance threshold or on leave.";
    case "new-joiners":
      return "Showing team members who joined within the last 6 months.";
    default:
      return "Displaying the full workforce.";
  }
}

function exportEmployeesToCsv(employeesToExport: Employee[]) {
  if (employeesToExport.length === 0) {
    toast.error("Nothing to export for the current selection.");
    return;
  }

  const header = [
    "Employee ID",
    "Name",
    "Department",
    "Position",
    "Employment Type",
    "Status",
    "Join Date",
    "Email",
    "Phone",
    "Roles",
  ].join(",");

  const rows = employeesToExport.map((employee) => {
    const values = [
      employee.employee_id,
      `${employee.first_name} ${employee.last_name}`.trim(),
      employee.department,
      employee.position,
      employmentTypeLabel[employee.employment_type],
      statusMeta[employee.status].label,
      formatDate(employee.date_of_joining),
      employee.personal_email,
      employee.personal_phone,
      (employee.system_roles || []).join(" | "),
    ];

    return values.map((value) => `"${value.replace(/"/g, '""')}"`).join(",");
  });

  const csvContent = [header, ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `employees-export-${Date.now()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  toast.success("Employee data exported successfully.");
}

export default function EmployeesPage() {
  // Fetch employees from API
  const { data: employeesData, isLoading: employeesLoading, error: employeesError } = useEmployees();
  const deleteEmployeeMutation = useDeleteEmployee();
  const updateEmployeeMutation = useUpdateEmployee();

  const employees = useMemo(() => employeesData?.results || [], [employeesData]);
  const isLoading = employeesLoading;

  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [employmentFilter, setEmploymentFilter] = useState("all");
  const [sortOption, setSortOption] = useState<SortOption>("join-date-desc");
  const [focusView, setFocusView] = useState<FocusView>("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [dialogConfig, setDialogConfig] = useState<DialogConfig | null>(null);

  const departments = useMemo(
    () =>
      Array.from(
        new Set(employees.map((employee) => employee.department))
      ).sort(),
    [employees]
  );

  const roles = useMemo(
    () =>
      Array.from(new Set(employees.map((employee) => employee.role))).sort(),
    [employees]
  );

  const employmentTypes = useMemo(
    () =>
      Array.from(
        new Set(employees.map((employee) => employee.employment_type))
      ).sort(),
    [employees]
  );

  const liveStatusSummary = useMemo(() => {
    const summary: Record<EmployeeStatus | "total", number> = {
      total: 0,
      active: 0,
      on_leave: 0,
      suspended: 0,
      resigned: 0,
    };

    employees.forEach((employee) => {
      summary.total += 1;
      summary[employee.status] += 1;
    });

    return summary;
  }, [employees]);

  const attendanceSnapshot = useMemo(() => {
    return {
      date: new Date().toISOString(),
      present: employees.filter(e => e.status === 'active').length,
      onLeave: liveStatusSummary.on_leave,
      absent: Math.max(0, liveStatusSummary.total - liveStatusSummary.active - liveStatusSummary.on_leave),
      wfh: 0,
    };
  }, [liveStatusSummary, employees]);

  const averageAttendance = useMemo(() => {
    if (employees.length === 0) {
      return 0;
    }
    const totalAttendance = employees.reduce(
      (acc, employee) => acc + (employee.attendance_score ?? 0),
      0
    );
    return Math.round(totalAttendance / employees.length);
  }, [employees]);

  const upcomingReviews = useMemo(() => {
    const daysThreshold = 270;
    const now = Date.now();
    return employees.filter((employee) => {
      if (!employee.last_review_date) return false;
      const lastReview = new Date(employee.last_review_date).getTime();
      const daysSince = (now - lastReview) / (1000 * 60 * 60 * 24);
      return daysSince >= daysThreshold;
    }).length;
  }, [employees]);

  useEffect(() => {
    setPage(1);
  }, [
    searchTerm,
    departmentFilter,
    roleFilter,
    statusFilter,
    employmentFilter,
    focusView,
  ]);

  const filteredEmployees = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    let workingSet = [...employees];

    if (query) {
      workingSet = workingSet.filter((employee) => {
        const haystack = [
          employee.first_name,
          employee.last_name,
          employee.employee_id,
          employee.department,
          employee.position,
          employee.personal_email,
          employee.personal_phone,
          (employee.system_roles || []).join(" "),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(query);
      });
    }

    if (departmentFilter !== "all") {
      workingSet = workingSet.filter(
        (employee) => employee.department === departmentFilter
      );
    }

    if (roleFilter !== "all") {
      workingSet = workingSet.filter(
        (employee) => employee.role === roleFilter
      );
    }

    if (statusFilter !== "all") {
      workingSet = workingSet.filter(
        (employee) => employee.status === statusFilter
      );
    }

    if (employmentFilter !== "all") {
      workingSet = workingSet.filter(
        (employee) => employee.employment_type === employmentFilter
      );
    }

    if (focusView !== "all") {
      workingSet = workingSet.filter((employee) => {
        switch (focusView) {
          case "top-performers":
            return (employee.performance_rating ?? 0) >= 4.5;
          case "attendance-risk":
            return (
              (employee.attendance_score ?? 0) < 85 || employee.status === "on_leave"
            );
          case "new-joiners": {
            const joined = new Date(employee.date_of_joining).getTime();
            const daysSinceJoining =
              (Date.now() - joined) / (1000 * 60 * 60 * 24);
            return daysSinceJoining <= 180;
          }
          default:
            return true;
        }
      });
    }

    const sorted = workingSet.sort((a, b) => {
      switch (sortOption) {
        case "name-asc":
          return `${a.first_name} ${a.last_name}`
            .toLowerCase()
            .localeCompare(`${b.first_name} ${b.last_name}`.toLowerCase());
        case "name-desc":
          return `${b.first_name} ${b.last_name}`
            .toLowerCase()
            .localeCompare(`${a.first_name} ${a.last_name}`.toLowerCase());
        case "department-asc":
          return a.department.localeCompare(b.department);
        case "performance-desc":
          return (b.performance_rating ?? 0) - (a.performance_rating ?? 0);
        case "join-date-desc":
        default:
          return (
            new Date(b.date_of_joining).getTime() -
            new Date(a.date_of_joining).getTime()
          );
      }
    });

    return sorted;
  }, [
    employees,
    searchTerm,
    departmentFilter,
    roleFilter,
    statusFilter,
    employmentFilter,
    sortOption,
    focusView,
  ]);

  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil(filteredEmployees.length / PAGE_SIZE)
    );
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [filteredEmployees, page]);

  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredEmployees.length / PAGE_SIZE)
  );
  const hasResults = filteredEmployees.length > 0;

  const selectedCount = selectedRowIds.size;
  const isAllPageSelected =
    paginatedEmployees.length > 0 &&
    paginatedEmployees.every((employee) => selectedRowIds.has(employee.id));

  const focusDescription = getFocusDescription(focusView);

  const statCards = [
    {
      title: "Active workforce",
      value: formatNumber(liveStatusSummary.active),
      caption: `${formatNumber(liveStatusSummary.total)} total team members`,
      icon: Users,
      accent: "bg-[#FFF4E5] text-[#8A5100]",
    },
    {
      title: "On leave today",
      value: formatNumber(attendanceSnapshot.onLeave),
      caption: `${formatNumber(
        attendanceSnapshot.present
      )} present / ${formatNumber(attendanceSnapshot.absent)} absent`,
      icon: UserMinus,
      accent: "bg-[#FEF3C7] text-[#7C4A00]",
    },
    {
      title: "Attendance health",
      value: `${averageAttendance}%`,
      caption: "Rolling 30-day average attendance",
      icon: CheckCircle2,
      accent: "bg-[#E6F4EA] text-[#1D6D3C]",
    },
    {
      title: "Reviews due soon",
      value: formatNumber(upcomingReviews),
      caption: "Past 9 months since last review",
      icon: BellRing,
      accent: "bg-[#F5E8FF] text-[#5A2F91]",
    },
  ];

  const handleRowSelection = (employeeId: string, selected: boolean) => {
    setSelectedRowIds((previous) => {
      const next = new Set(previous);
      if (selected) {
        next.add(employeeId);
      } else {
        next.delete(employeeId);
      }
      return next;
    });
  };

  const handleSelectAllOnPage = (selected: boolean) => {
    setSelectedRowIds((previous) => {
      const next = new Set(previous);
      paginatedEmployees.forEach((employee) => {
        if (selected) {
          next.add(employee.id);
        } else {
          next.delete(employee.id);
        }
      });
      return next;
    });
  };

  const handleBulkAction = (action: "present" | "reminder" | "export") => {
    const selectedEmployees = employees.filter((employee) =>
      selectedRowIds.has(employee.id)
    );

    if (selectedEmployees.length === 0) {
      toast.error("Select at least one employee to continue.");
      return;
    }

    switch (action) {
      case "present":
        toast.success(
          `${selectedEmployees.length} employees marked present for today.`
        );
        break;
      case "reminder":
        toast.info(
          `Reminder queued for ${selectedEmployees.length} employees.`
        );
        break;
      case "export":
        exportEmployeesToCsv(selectedEmployees);
        break;
    }
  };

  const handleStatusToggleRequest = (
    employee: Employee,
    nextStatus: EmployeeStatus
  ) => {
    if (employee.status === nextStatus) {
      return;
    }
    setDialogConfig({ type: "status", employee, nextStatus });
  };

  const handleDeleteRequest = (employee: Employee) => {
    setDialogConfig({ type: "delete", employee });
  };

  const handleDialogClose = () => {
    setDialogConfig(null);
  };

  const confirmDialog = () => {
    if (!dialogConfig) return;

    if (dialogConfig.type === "status") {
      const { employee, nextStatus } = dialogConfig;
      // Convert string ID to number if needed
      const employeeId = typeof employee.id === 'string' ? parseInt(employee.id, 10) : employee.id;
      updateEmployeeMutation.mutate({
        id: employeeId,
        data: { status: nextStatus },
      });
    } else {
      const { employee } = dialogConfig;
      // Convert string ID to number if needed
      const employeeId = typeof employee.id === 'string' ? parseInt(employee.id, 10) : employee.id;
      deleteEmployeeMutation.mutate(employeeId);
      setSelectedRowIds((previous) => {
        const next = new Set(previous);
        next.delete(employee.id);
        return next;
      });
    }

    setDialogConfig(null);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setDepartmentFilter("all");
    setRoleFilter("all");
    setStatusFilter("all");
    setEmploymentFilter("all");
    setSortOption("join-date-desc");
    setFocusView("all");
    setShowAdvancedFilters(false);
    setSelectedRowIds(new Set());
  };

  const focusIndicator = (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <Sparkles className="size-3 text-[#F4A920]" />
      <span>{focusDescription}</span>
    </div>
  );

  return (
    <section className="space-y-8">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-[#8A5100]">
                Home
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-[#8A5100]">Employees</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-semibold text-dairy-charcoal">
                Workforce Directory
              </h1>
              <Badge className="bg-[#F4A920]/15 text-[#8A5100] border-[#F4A920]/30">
                {formatNumber(liveStatusSummary.total)} on roster
              </Badge>
            </div>
            <p className="text-sm text-gray-600">
              Monitor attendance, performance, and access at a glance.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              className="border-dashed border-[#F4A920]/40 text-[#8A5100] hover:bg-[#FFF4E5]"
              onClick={() => toast.info("Import wizard will open soon.")}
            >
              <Download className="size-4" /> Import roster
            </Button>
            <Button
              className="bg-[#F4A920] text-[#5B3A1A] hover:bg-[#ec9f15]"
              asChild
            >
              <Link href="/employees/create">
                <UserPlus className="size-4" /> Add employee
              </Link>
            </Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <Card
              key={card.title}
              className={cn(
                "border border-white/60 bg-white/80 backdrop-blur transition hover:shadow-md",
                "hover:border-[#F4A920]/40"
              )}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-sm text-gray-500">
                    {card.title}
                  </CardTitle>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-semibold text-dairy-charcoal">
                      {card.value}
                    </span>
                    <ArrowUpRight className="size-4 text-[#F4A920]" />
                  </div>
                  <CardDescription className="mt-3 text-xs text-gray-500">
                    {card.caption}
                  </CardDescription>
                </div>
                <span
                  className={cn(
                    "rounded-full p-2 text-sm shadow-sm",
                    card.accent
                  )}
                >
                  <card.icon className="size-5" />
                </span>
              </CardHeader>
            </Card>
          ))}
        </div>
      </header>

      <div className="space-y-5">
        <motion.div
          layout
          className="rounded-xl border border-[#F4A920]/20 bg-white/80 p-4 shadow-sm"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-3">
              <div className="relative min-w-[220px] flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by name, department, or ID"
                  className="pl-9"
                />
              </div>
              <Select
                value={departmentFilter}
                onValueChange={setDepartmentFilter}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All departments</SelectItem>
                  {departments.map((department) => (
                    <SelectItem key={department} value={department}>
                      {department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {formatRoleLabel(role)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {Object.entries(statusMeta).map(([key, meta]) => (
                    <SelectItem key={key} value={key}>
                      {meta.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={employmentFilter}
                onValueChange={setEmploymentFilter}
              >
                <SelectTrigger className="w-[170px]">
                  <SelectValue placeholder="Employment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {employmentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {employmentTypeLabel[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={sortOption}
                onValueChange={(value) => setSortOption(value as SortOption)}
              >
                <SelectTrigger className="w-[190px]">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                className={cn(
                  "text-sm",
                  showAdvancedFilters
                    ? "text-[#8A5100]"
                    : "text-muted-foreground"
                )}
                onClick={() => {
                  setShowAdvancedFilters((previous) => {
                    const next = !previous;
                    if (!next) {
                      setFocusView("all");
                    }
                    return next;
                  });
                }}
              >
                <Filter className="size-4" /> Advanced
              </Button>
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-dairy-charcoal"
                onClick={handleResetFilters}
              >
                <RefreshCw className="size-4" /> Reset
              </Button>
            </div>
          </div>
          {showAdvancedFilters && (
            <div className="mt-4 space-y-3 rounded-lg border border-dashed border-[#F4A920]/30 bg-[#FFF9F0] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Tabs
                  value={focusView}
                  onValueChange={(value) => setFocusView(value as FocusView)}
                  className="w-full md:w-auto"
                >
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="top-performers">
                      <BadgeCheck className="size-4" /> Top performers
                    </TabsTrigger>
                    <TabsTrigger value="attendance-risk">
                      <AlertTriangle className="size-4" /> Attendance alerts
                    </TabsTrigger>
                    <TabsTrigger value="new-joiners">
                      <CalendarDays className="size-4" /> New joiners
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="all" className="pt-3">
                    {focusIndicator}
                  </TabsContent>
                  <TabsContent value="top-performers" className="pt-3">
                    {focusIndicator}
                  </TabsContent>
                  <TabsContent value="attendance-risk" className="pt-3">
                    {focusIndicator}
                  </TabsContent>
                  <TabsContent value="new-joiners" className="pt-3">
                    {focusIndicator}
                  </TabsContent>
                </Tabs>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <Badge className="bg-white text-[#8A5100] border-[#F4A920]/30">
                  <ShieldCheck className="size-3" />
                  {formatNumber(liveStatusSummary.active)} active
                </Badge>
                <Badge className="bg-white text-[#844B00] border-[#F4A920]/30">
                  <UserCheck className="size-3" />
                  {formatNumber(liveStatusSummary.on_leave)} on leave
                </Badge>
                <Badge className="bg-white text-[#A11C33] border-[#F87171]/30">
                  <AlertTriangle className="size-3" />
                  {formatNumber(liveStatusSummary.suspended)} suspended
                </Badge>
              </div>
            </div>
          )}
        </motion.div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-[#F4A920]/30 bg-[#FFF8ED] px-4 py-3">
            <div className="flex items-center gap-3 text-sm text-[#8A5100]">
              <ShieldCheck className="size-4" />
              <span>
                {selectedCount === 0
                  ? "No employees selected"
                  : `${formatNumber(selectedCount)} employee${
                      selectedCount > 1 ? "s" : ""
                    } selected`}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="border-[#F4A920]/30 text-[#8A5100] hover:bg-[#FFF4E5]"
                disabled={selectedCount === 0}
                onClick={() => handleBulkAction("present")}
                title="Mark selected employees as present"
              >
                <UserCheck className="size-4" /> Mark present
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-[#F4A920]/30 text-[#8A5100] hover:bg-[#FFF4E5]"
                disabled={selectedCount === 0}
                onClick={() => handleBulkAction("reminder")}
                title="Send reminder to selected employees"
              >
                <BellRing className="size-4" /> Send reminder
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-[#F4A920]/30 text-[#8A5100] hover:bg-[#FFF4E5]"
                disabled={selectedCount === 0}
                onClick={() => handleBulkAction("export")}
                title="Export selected employees to CSV"
              >
                <Download className="size-4" /> Export selection
              </Button>
              <Button
                size="sm"
                className="bg-[#F4A920] text-[#5B3A1A] hover:bg-[#ec9f15]"
                onClick={() => exportEmployeesToCsv(filteredEmployees)}
                title="Export current view"
              >
                <Download className="size-4" /> Export view
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-[#F4A920]/15 bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#FFF4E5]/50">
                  <TableHead className="w-10">
                    <input
                      type="checkbox"
                      className="size-4 rounded border-gray-300 accent-[#F4A920]"
                      checked={isAllPageSelected}
                      onChange={(event) =>
                        handleSelectAllOnPage(event.target.checked)
                      }
                      aria-label="Select all employees on this page"
                    />
                  </TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Team & contact</TableHead>
                  <TableHead>Employment</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading &&
                  Array.from({ length: PAGE_SIZE }).map((_, index) => (
                    <tr
                      key={`skeleton-${index}`}
                      className="animate-pulse border-b last:border-b-0"
                    >
                      {Array.from({ length: 7 }).map((__, cellIndex) => (
                        <TableCell key={`skeleton-${index}-${cellIndex}`}>
                          <div className="h-4 w-full rounded bg-gray-100" />
                        </TableCell>
                      ))}
                    </tr>
                  ))}
                {!isLoading && hasResults && (
                  <AnimatePresence initial={false}>
                    {paginatedEmployees.map((employee) => {
                      const status = statusMeta[employee.status];
                      const isSelected = selectedRowIds.has(employee.id);
                      const roleClasses = roleBadgeMap[employee.role];
                      const employmentLabel =
                        employmentTypeLabel[employee.employment_type];
                      const statusToggleDisabled =
                        employee.status === "resigned";
                      const supervisorBadge =
                        (employee.performance_rating ?? 0) >= 4.5;

                      return (
                        <motion.tr
                          key={employee.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.18, ease: "easeOut" }}
                          className={cn(
                            "group border-b last:border-b-0",
                            isSelected && "bg-[#FFF4E5]/60"
                          )}
                        >
                          <TableCell>
                            <input
                              type="checkbox"
                              className="size-4 rounded border-gray-300 accent-[#F4A920]"
                              checked={isSelected}
                              onChange={(event) =>
                                handleRowSelection(
                                  employee.id,
                                  event.target.checked
                                )
                              }
                              aria-label={`Select ${employee.first_name} ${employee.last_name}`}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="ring-2 ring-white shadow-sm">
                                <AvatarImage
                                  src={employee.profile_picture ?? ""}
                                  alt={`${employee.first_name} ${employee.last_name}`}
                                />
                                <AvatarFallback className="bg-[#F4A920]/20 text-[#8A5100]">
                                  {getInitials(employee)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-medium text-sm text-dairy-charcoal">
                                    {employee.first_name} {employee.last_name}
                                  </span>
                                  {supervisorBadge && (
                                    <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200">
                                      <BadgeCheck className="size-3" /> Top
                                      rated
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                  <span>{employee.employee_id}</span>
                                  <span className="text-gray-300">|</span>
                                  <span>{employee.position}</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "border text-xs",
                                      roleClasses
                                    )}
                                  >
                                    {formatRoleLabel(employee.role)}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "border bg-white text-xs",
                                      getDepartmentBadgeClass(
                                        employee.department
                                      )
                                    )}
                                  >
                                    {employee.department}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1 text-sm">
                              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <Phone className="size-3 text-[#F4A920]" />
                                <a
                                  href={`tel:${employee.personal_phone}`}
                                  className="hover:text-[#8A5100]"
                                >
                                  {employee.personal_phone}
                                </a>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <Mail className="size-3 text-[#F4A920]" />
                                <a
                                  href={`mailto:${employee.personal_email}`}
                                  className="hover:text-[#8A5100]"
                                >
                                  {employee.personal_email}
                                </a>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Reports to:{" "}
                                {employee.reporting_manager_id ?? "-"}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1 text-xs text-muted-foreground">
                              <Badge
                                variant="outline"
                                className="border-[#F4A920]/40 bg-[#FFF4E5] text-[#8A5100]"
                              >
                                {employmentLabel}
                              </Badge>
                              <div className="flex items-center gap-2">
                                <CalendarDays className="size-3 text-[#F4A920]" />
                                <span>
                                  Joined {formatDate(employee.date_of_joining)}
                                </span>
                              </div>
                              {employee.date_of_resignation && (
                                <div className="flex items-center gap-2 text-red-500">
                                  <AlertTriangle className="size-3" />
                                  <span>
                                    Resigned{" "}
                                    {formatDate(employee.date_of_resignation)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-3 text-xs text-muted-foreground">
                              <div>
                                <div className="flex items-center justify-between text-xs">
                                  <span>Performance</span>
                                  <span className="font-medium text-dairy-charcoal">
                                    {(employee.performance_rating ?? 0).toFixed(1)} / 5
                                  </span>
                                </div>
                                <Progress
                                  value={(employee.performance_rating ?? 0) * 20}
                                />
                              </div>
                              <div>
                                <div className="flex items-center justify-between text-xs">
                                  <span>Attendance</span>
                                  <span className="font-medium text-dairy-charcoal">
                                    {employee.attendance_score ?? 0}%
                                  </span>
                                </div>
                                <Progress value={employee.attendance_score ?? 0} />
                              </div>
                              <div>
                                <div className="flex items-center justify-between text-xs">
                                  <span>Productivity</span>
                                  <span className="font-medium text-dairy-charcoal">
                                    {employee.productivity_score}%
                                  </span>
                                </div>
                                <Progress value={employee.productivity_score} />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "border text-xs",
                                  status.className
                                )}
                                title={status.description}
                              >
                                {status.label}
                              </Badge>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Switch
                                  checked={employee.status === "active"}
                                  disabled={statusToggleDisabled}
                                  onCheckedChange={(checked) =>
                                    handleStatusToggleRequest(
                                      employee,
                                      checked ? "active" : "suspended"
                                    )
                                  }
                                  title={
                                    statusToggleDisabled
                                      ? "Status locked for resigned employees"
                                      : "Toggle active status"
                                  }
                                />
                                <span>
                                  {employee.status === "active"
                                    ? "Active"
                                    : "Inactive"}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  className="ml-auto text-muted-foreground hover:bg-[#FFF4E5] hover:text-[#8A5100]"
                                  title="Quick actions"
                                >
                                  <MoreHorizontal className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>
                                  Employee actions
                                </DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                  <Link href={`/employees/${employee.id}`}>
                                    View full profile
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onSelect={(event) => {
                                    event.preventDefault();
                                    toast.info("Attendance log opens shortly.");
                                  }}
                                >
                                  <ClipboardList className="size-4" /> Log
                                  attendance
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onSelect={(event) => {
                                    event.preventDefault();
                                    toast.info("Reminder scheduled.");
                                  }}
                                >
                                  <BellRing className="size-4" /> Send reminder
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onSelect={async (event) => {
                                    event.preventDefault();
                                    try {
                                      await navigator.clipboard.writeText(
                                        employee.employee_id
                                      );
                                      toast.success(
                                        "Employee ID copied to clipboard."
                                      );
                                    } catch (error) {
                                      toast.error(
                                        "Unable to copy employee ID."
                                      );
                                    }
                                  }}
                                >
                                  <ShieldCheck className="size-4" /> Copy
                                  employee ID
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  data-variant="destructive"
                                  onSelect={(event) => {
                                    event.preventDefault();
                                    handleDeleteRequest(employee);
                                  }}
                                >
                                  <UserMinus className="size-4" /> Remove from
                                  roster
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                )}
                {!isLoading && !hasResults && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                        <Sparkles className="size-6 text-[#F4A920]" />
                        <div className="text-sm font-medium text-dairy-charcoal">
                          No employees match the current filters
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Try adjusting your filters or clearing the search
                          query.
                        </p>
                        <Button
                          variant="outline"
                          className="border-[#F4A920]/40 text-[#8A5100] hover:bg-[#FFF4E5]"
                          onClick={handleResetFilters}
                        >
                          <RefreshCw className="size-4" /> Clear filters
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
            <div>
              {hasResults ? (
                <span>
                  Showing {formatNumber(startIndex + 1)}-
                  {formatNumber(Math.min(endIndex, filteredEmployees.length))}{" "}
                  of {formatNumber(filteredEmployees.length)} employees
                </span>
              ) : (
                <span>Showing 0 employees</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-[#F4A920]/30 text-[#8A5100] hover:bg-[#FFF4E5]"
                disabled={page === 1}
                onClick={() => setPage((previous) => Math.max(1, previous - 1))}
              >
                Previous
              </Button>
              <span>
                Page {page} of {Math.max(totalPages, 1)}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="border-[#F4A920]/30 text-[#8A5100] hover:bg-[#FFF4E5]"
                disabled={page >= totalPages || !hasResults}
                onClick={() =>
                  setPage((previous) => Math.min(totalPages, previous + 1))
                }
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={Boolean(dialogConfig)} onOpenChange={handleDialogClose}>
        {dialogConfig && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {dialogConfig.type === "status"
                  ? "Confirm status update"
                  : "Remove employee"}
              </DialogTitle>
              <DialogDescription>
                {dialogConfig.type === "status"
                  ? `Are you sure you want to set ${
                      dialogConfig.employee.first_name
                    } ${dialogConfig.employee.last_name} as ${
                      statusMeta[dialogConfig.nextStatus].label
                    }?`
                  : `This action will remove ${dialogConfig.employee.first_name} ${dialogConfig.employee.last_name} from the active roster.`}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={handleDialogClose}>
                Cancel
              </Button>
              <Button
                className="bg-[#F4A920] text-[#5B3A1A] hover:bg-[#ec9f15]"
                onClick={confirmDialog}
              >
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </section>
  );
}
