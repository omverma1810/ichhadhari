import type { MilkIntake, SegregationStats, MilkTrendData } from "@/types/milk";
import type {
  Product,
  ProductionBatch,
  ProductionStats,
  Worker,
} from "@/types/production";
import type {
  Location,
  StockItem,
  ColdStorageZone,
  InventoryStats,
  ExpiryAlert,
} from "@/types/inventory";
import type { Vendor, VendorPerformance } from "@/types/vendor";
import type {
  PurchaseOrder,
  PurchaseRequisition,
  GoodsReceiptNote,
  ReturnOrder,
} from "@/types/purchase-order";
import type { Employee } from "@/types/employee";
import type {
  Payment,
  OutstandingBalance,
  PaymentReminder,
} from "@/types/payment";
import type { Invoice } from "@/types/invoice";
import type {
  VendorListReportRow,
  OutstandingBalanceReportRow,
  PaymentHistoryReportRow,
  ReportPayload,
} from "@/types/reports";

export const mockEmployees: Employee[] = [
  {
    id: "emp-1",
    employee_id: "EMP-001",
    first_name: "Rajinder",
    last_name: "Singh",
    date_of_birth: "1990-05-15",
    gender: "M",
    blood_type: "O+",
    profile_picture: undefined,
    personal_phone: "9876543210",
    personal_email: "rajinder.singh@ichhadhari.com",
    emergency_contact_name: "Priya Singh",
    emergency_contact_phone: "9876543211",
    alternate_contact_phone: "9786543210",
    residential_address: {
      street: "123 Milk Street",
      city: "Ludhiana",
      state: "Punjab",
      postal_code: "141001",
      country: "India",
    },
    permanent_address: {
      street: "123 Milk Street",
      city: "Ludhiana",
      state: "Punjab",
      postal_code: "141001",
      country: "India",
    },
    aadhar_number: "123456789012",
    pan_number: "AJFPA1234A",
    driving_license: "PB142011002233",
    passport_number: undefined,
    bank_account_number: "1234567890123456",
    ifsc_code: "PUNB0012345",
    department: "Milk Collection",
    position: "Regional Manager",
    role: "manager",
    reporting_manager_id: undefined,
    salary_grade: 8,
    employment_type: "full_time",
    date_of_joining: "2015-01-10",
    status: "active",
    system_roles: ["manager", "viewer"],
    performance_rating: 4.6,
    last_review_date: "2024-09-15",
    attendance_score: 94,
    productivity_score: 89,
    behavioral_score: 92,
    created_at: "2015-01-10T08:00:00Z",
    updated_at: "2024-10-15T10:00:00Z",
    documents: [
      {
        id: "emp-1-doc-1",
        file_name: "Employment-Contract.pdf",
        file_url: "https://example.com/docs/employment-contract.pdf",
        document_type: "agreement",
        upload_date: "2015-01-05T08:15:00Z",
      },
    ],
  },
  {
    id: "emp-2",
    employee_id: "EMP-002",
    first_name: "Simran",
    last_name: "Kaur",
    date_of_birth: "1993-02-20",
    gender: "F",
    blood_type: "A+",
    profile_picture: undefined,
    personal_phone: "9876501234",
    personal_email: "simran.kaur@ichhadhari.com",
    emergency_contact_name: "Harpreet Kaur",
    emergency_contact_phone: "9876509898",
    residential_address: {
      street: "45 Guru Nanak Ave",
      city: "Amritsar",
      state: "Punjab",
      postal_code: "143001",
      country: "India",
    },
    permanent_address: {
      street: "45 Guru Nanak Ave",
      city: "Amritsar",
      state: "Punjab",
      postal_code: "143001",
      country: "India",
    },
    aadhar_number: "123498765432",
    pan_number: "BDJPK4321L",
    driving_license: "PB022013990123",
    passport_number: "P1234567",
    bank_account_number: "6543210987654321",
    ifsc_code: "HDFC0001234",
    department: "Human Resources",
    position: "HR Business Partner",
    role: "manager",
    reporting_manager_id: "emp-6",
    salary_grade: 7,
    employment_type: "full_time",
    date_of_joining: "2017-06-01",
    date_of_resignation: undefined,
    status: "on_leave",
    system_roles: ["hr", "viewer"],
    performance_rating: 4.4,
    last_review_date: "2024-07-20",
    attendance_score: 91,
    productivity_score: 86,
    behavioral_score: 94,
    created_at: "2017-06-01T08:00:00Z",
    updated_at: "2024-10-12T14:00:00Z",
    documents: [
      {
        id: "emp-2-doc-1",
        file_name: "HR-Certification.pdf",
        file_url: "https://example.com/docs/hr-certification.pdf",
        document_type: "certificate",
        upload_date: "2023-02-11T09:40:00Z",
      },
    ],
  },
  {
    id: "emp-3",
    employee_id: "EMP-003",
    first_name: "Ajay",
    last_name: "Kumar",
    date_of_birth: "1988-12-04",
    gender: "M",
    profile_picture: undefined,
    personal_phone: "9823456789",
    personal_email: "ajay.kumar@ichhadhari.com",
    emergency_contact_name: "Sonal Kumar",
    emergency_contact_phone: "9823451234",
    residential_address: {
      street: "88 Industrial Park",
      city: "Ludhiana",
      state: "Punjab",
      postal_code: "141002",
      country: "India",
    },
    aadhar_number: "432112349876",
    pan_number: "AJKPQ4567F",
    bank_account_number: "2233445566778899",
    ifsc_code: "ICIC0001122",
    department: "Production",
    position: "Shift Supervisor",
    role: "supervisor",
    reporting_manager_id: "emp-1",
    salary_grade: 6,
    employment_type: "full_time",
    date_of_joining: "2018-04-12",
    status: "active",
    system_roles: ["supervisor", "operator"],
    performance_rating: 4.2,
    last_review_date: "2024-08-05",
    attendance_score: 96,
    productivity_score: 90,
    behavioral_score: 88,
    created_at: "2018-04-12T08:00:00Z",
    updated_at: "2024-10-08T11:30:00Z",
    documents: [],
  },
  {
    id: "emp-4",
    employee_id: "EMP-004",
    first_name: "Meena",
    last_name: "Sharma",
    date_of_birth: "1995-09-10",
    gender: "F",
    blood_type: "B+",
    personal_phone: "9797971234",
    personal_email: "meena.sharma@ichhadhari.com",
    emergency_contact_name: "Ravi Sharma",
    emergency_contact_phone: "9797975678",
    residential_address: {
      street: "12 Quality Lane",
      city: "Patiala",
      state: "Punjab",
      postal_code: "147001",
      country: "India",
    },
    aadhar_number: "567856785678",
    pan_number: "BNZPS4321K",
    bank_account_number: "8877665544332211",
    ifsc_code: "SBIN0003456",
    department: "Quality Control",
    position: "Quality Analyst",
    role: "staff",
    reporting_manager_id: "emp-7",
    salary_grade: 5,
    employment_type: "full_time",
    date_of_joining: "2020-09-21",
    status: "active",
    system_roles: ["quality", "viewer"],
    performance_rating: 4.8,
    last_review_date: "2024-09-01",
    attendance_score: 98,
    productivity_score: 93,
    behavioral_score: 95,
    created_at: "2020-09-21T08:00:00Z",
    updated_at: "2024-10-17T16:20:00Z",
    documents: [
      {
        id: "emp-4-doc-1",
        file_name: "SixSigma-GreenBelt.pdf",
        file_url: "https://example.com/docs/sixsigma-greenbelt.pdf",
        document_type: "certificate",
        upload_date: "2022-07-15T09:15:00Z",
      },
    ],
  },
  {
    id: "emp-5",
    employee_id: "EMP-005",
    first_name: "Harjit",
    last_name: "Singh",
    date_of_birth: "1992-03-18",
    gender: "M",
    personal_phone: "9810011223",
    personal_email: "harjit.singh@ichhadhari.com",
    emergency_contact_name: "Kuldeep Singh",
    emergency_contact_phone: "9810011244",
    residential_address: {
      street: "54 Storage Road",
      city: "Chandigarh",
      state: "Chandigarh",
      postal_code: "160036",
      country: "India",
    },
    department: "Inventory & Storage",
    position: "Store Keeper",
    role: "staff",
    salary_grade: 4,
    employment_type: "full_time",
    date_of_joining: "2019-11-05",
    status: "active",
    system_roles: ["inventory", "viewer"],
    performance_rating: 3.9,
    last_review_date: "2024-07-18",
    attendance_score: 88,
    productivity_score: 82,
    behavioral_score: 85,
    created_at: "2019-11-05T08:00:00Z",
    updated_at: "2024-10-09T13:45:00Z",
    documents: [],
  },
  {
    id: "emp-6",
    employee_id: "EMP-006",
    first_name: "Arjun",
    last_name: "Mehta",
    date_of_birth: "1985-07-02",
    gender: "M",
    personal_phone: "9876200000",
    personal_email: "arjun.mehta@ichhadhari.com",
    emergency_contact_name: "Anita Mehta",
    emergency_contact_phone: "9876200001",
    residential_address: {
      street: "21 Corporate Plaza",
      city: "Chandigarh",
      state: "Chandigarh",
      postal_code: "160017",
      country: "India",
    },
    department: "Administration",
    position: "Head of Operations",
    role: "admin",
    salary_grade: 9,
    employment_type: "full_time",
    date_of_joining: "2012-03-12",
    status: "active",
    system_roles: ["admin"],
    performance_rating: 4.7,
    last_review_date: "2024-08-28",
    attendance_score: 95,
    productivity_score: 92,
    behavioral_score: 94,
    created_at: "2012-03-12T08:00:00Z",
    updated_at: "2024-10-02T15:10:00Z",
    documents: [],
  },
  {
    id: "emp-7",
    employee_id: "EMP-007",
    first_name: "Gurpreet",
    last_name: "Kaur",
    date_of_birth: "1991-10-11",
    gender: "F",
    personal_phone: "9855512345",
    personal_email: "gurpreet.kaur@ichhadhari.com",
    emergency_contact_name: "Baljeet Kaur",
    emergency_contact_phone: "9855598765",
    residential_address: {
      street: "90 Testing Blvd",
      city: "Mohali",
      state: "Punjab",
      postal_code: "160062",
      country: "India",
    },
    department: "Quality Control",
    position: "Quality Lead",
    role: "supervisor",
    salary_grade: 6,
    employment_type: "full_time",
    date_of_joining: "2016-08-30",
    status: "active",
    system_roles: ["quality", "manager"],
    performance_rating: 4.5,
    last_review_date: "2024-09-05",
    attendance_score: 93,
    productivity_score: 90,
    behavioral_score: 91,
    created_at: "2016-08-30T08:00:00Z",
    updated_at: "2024-10-13T09:25:00Z",
    documents: [],
  },
  {
    id: "emp-8",
    employee_id: "EMP-008",
    first_name: "Neha",
    last_name: "Verma",
    date_of_birth: "1994-11-22",
    gender: "F",
    personal_phone: "9812345678",
    personal_email: "neha.verma@ichhadhari.com",
    emergency_contact_name: "Rohit Verma",
    emergency_contact_phone: "9812345600",
    residential_address: {
      street: "17 Finance Lane",
      city: "Chandigarh",
      state: "Chandigarh",
      postal_code: "160022",
      country: "India",
    },
    department: "Finance & Accounts",
    position: "Finance Analyst",
    role: "staff",
    salary_grade: 5,
    employment_type: "full_time",
    date_of_joining: "2021-02-10",
    status: "active",
    system_roles: ["finance", "viewer"],
    performance_rating: 4.1,
    last_review_date: "2024-09-20",
    attendance_score: 90,
    productivity_score: 87,
    behavioral_score: 88,
    created_at: "2021-02-10T08:00:00Z",
    updated_at: "2024-10-11T08:00:00Z",
    documents: [],
  },
  {
    id: "emp-9",
    employee_id: "EMP-009",
    first_name: "Lakhwinder",
    last_name: "Singh",
    date_of_birth: "1982-04-05",
    gender: "M",
    personal_phone: "9800001111",
    personal_email: "lakhwinder.singh@ichhadhari.com",
    emergency_contact_name: "Navjot Kaur",
    emergency_contact_phone: "9800002222",
    residential_address: {
      street: "200 Distribution Hub",
      city: "Jalandhar",
      state: "Punjab",
      postal_code: "144001",
      country: "India",
    },
    department: "Distribution & Sales",
    position: "Logistics Coordinator",
    role: "operator",
    salary_grade: 4,
    employment_type: "contract",
    date_of_joining: "2022-05-18",
    status: "suspended",
    system_roles: ["distribution"],
    performance_rating: 3.2,
    last_review_date: "2024-06-30",
    attendance_score: 72,
    productivity_score: 68,
    behavioral_score: 70,
    created_at: "2022-05-18T08:00:00Z",
    updated_at: "2024-10-05T10:10:00Z",
    documents: [],
  },
  {
    id: "emp-10",
    employee_id: "EMP-010",
    first_name: "Priya",
    last_name: "Malhotra",
    date_of_birth: "1987-01-28",
    gender: "F",
    personal_phone: "9822003344",
    personal_email: "priya.malhotra@ichhadhari.com",
    emergency_contact_name: "Vikas Malhotra",
    emergency_contact_phone: "9822003399",
    residential_address: {
      street: "9 Operations Enclave",
      city: "Chandigarh",
      state: "Chandigarh",
      postal_code: "160030",
      country: "India",
    },
    department: "Human Resources",
    position: "HR Director",
    role: "manager",
    salary_grade: 9,
    employment_type: "full_time",
    date_of_joining: "2010-11-01",
    status: "resigned",
    date_of_resignation: "2024-08-31",
    system_roles: ["hr", "viewer"],
    performance_rating: 4.3,
    last_review_date: "2024-05-18",
    attendance_score: 88,
    productivity_score: 84,
    behavioral_score: 90,
    created_at: "2010-11-01T08:00:00Z",
    updated_at: "2024-09-01T10:45:00Z",
    documents: [],
  },
];

export const mockEmployeeStatusSummary = {
  total: mockEmployees.length,
  active: mockEmployees.filter((employee) => employee.status === "active")
    .length,
  onLeave: mockEmployees.filter((employee) => employee.status === "on_leave")
    .length,
  suspended: mockEmployees.filter((employee) => employee.status === "suspended")
    .length,
  resigned: mockEmployees.filter((employee) => employee.status === "resigned")
    .length,
};

export const mockEmployeeAttendanceSnapshot = {
  date: new Date().toISOString(),
  present: 42,
  onLeave: mockEmployeeStatusSummary.onLeave,
  absent: 3,
  wfh: 2,
};

export const mockMilkIntakes: MilkIntake[] = Array.from(
  { length: 25 },
  (_, i) => {
    const fatPercentage = Math.random() * 11 + 2;
    const category =
      fatPercentage >= 8 && fatPercentage <= 9
        ? "premium"
        : fatPercentage >= 4 && fatPercentage <= 5
        ? "standard"
        : "other";

    return {
      id: `intake-${i + 1}`,
      batchId: `B${String(i + 1).padStart(4, "0")}`,
      quantity: Math.floor(Math.random() * 500) + 100,
      fatPercentage,
      snfPercentage: Math.random() * 3 + 7,
      temperature: Math.random() * 10 + 20,
      category: category as "premium" | "standard" | "other",
      source: ["Farm A", "Farm B", "Route 1", "Route 2"][
        Math.floor(Math.random() * 4)
      ],
      supplierName: [
        "Rajesh Kumar",
        "Suresh Patil",
        "Ramesh Sharma",
        "Vijay Singh",
      ][Math.floor(Math.random() * 4)],
      notes: i % 3 === 0 ? "Good quality milk" : undefined,
      recordedAt: new Date(
        Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)
      ).toISOString(),
      recordedBy: {
        id: "user-1",
        name: "Admin User",
      },
      status: (["approved", "pending", "rejected"] as const)[
        Math.floor(Math.random() * 3)
      ],
    };
  }
);

export const mockSegregationStats: SegregationStats = {
  premium: {
    totalLiters: 3450,
    batches: 12,
    averageFat: 8.5,
    percentage: 35,
  },
  standard: {
    totalLiters: 5200,
    batches: 18,
    averageFat: 4.5,
    percentage: 52,
  },
  other: {
    totalLiters: 1350,
    batches: 5,
    averageFat: 6.2,
    percentage: 13,
  },
  totalLiters: 10_000,
  totalBatches: 35,
  lastUpdated: new Date().toISOString(),
};

export const mockMilkTrends: MilkTrendData[] = Array.from(
  { length: 7 },
  (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const premium = Math.floor(Math.random() * 500) + 300;
    const standard = Math.floor(Math.random() * 700) + 400;
    const other = Math.floor(Math.random() * 300) + 100;
    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      premium,
      standard,
      other,
      total: premium + standard + other,
    };
  }
);

export const mockProducts: Product[] = [
  {
    id: "prod-1",
    name: "Premium Paneer",
    category: "Paneer",
    description: "High-quality paneer made from premium milk",
    steps: [
      {
        stepNumber: 1,
        name: "Heat Milk",
        description: "Heat milk to 85°C",
        estimatedTimeHours: 0.5,
        temperature: 85,
        temperatureUnit: "celsius",
        instructions: "Use medium heat and stir continuously",
      },
      {
        stepNumber: 2,
        name: "Add Culture",
        description: "Add citric acid and stir",
        estimatedTimeHours: 0.25,
        instructions: "Add slowly while stirring",
      },
      {
        stepNumber: 3,
        name: "Separate Curds",
        description: "Strain and press curds",
        estimatedTimeHours: 1,
        instructions: "Apply consistent pressure",
      },
      {
        stepNumber: 4,
        name: "Cool and Pack",
        description: "Cool to 4°C and pack",
        estimatedTimeHours: 2,
        temperature: 4,
        temperatureUnit: "celsius",
      },
    ],
    milkRequirementPerUnit: 5,
    expectedYield: 1,
    yieldUnit: "kg",
    storageRequirements: "Refrigerate at 4°C",
    shelfLifeDays: 5,
    currentStock: 45,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-2",
    name: "Fresh Curd",
    category: "Curd",
    description: "Creamy and fresh curd",
    steps: [
      {
        stepNumber: 1,
        name: "Boil Milk",
        description: "Boil milk and cool to 45°C",
        estimatedTimeHours: 0.5,
        temperature: 45,
        temperatureUnit: "celsius",
      },
      {
        stepNumber: 2,
        name: "Add Culture",
        description: "Add starter culture",
        estimatedTimeHours: 0.1,
      },
      {
        stepNumber: 3,
        name: "Incubate",
        description: "Keep at warm temperature for 6 hours",
        estimatedTimeHours: 6,
        temperature: 40,
        temperatureUnit: "celsius",
      },
      {
        stepNumber: 4,
        name: "Refrigerate",
        description: "Cool to 4°C",
        estimatedTimeHours: 2,
        temperature: 4,
        temperatureUnit: "celsius",
      },
    ],
    milkRequirementPerUnit: 1,
    expectedYield: 1,
    yieldUnit: "kg",
    storageRequirements: "Refrigerate at 4°C",
    shelfLifeDays: 3,
    currentStock: 120,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-3",
    name: "White Butter",
    category: "Butter",
    description: "Fresh white butter from cream",
    steps: [
      {
        stepNumber: 1,
        name: "Separate Cream",
        description: "Separate cream from milk",
        estimatedTimeHours: 1,
      },
      {
        stepNumber: 2,
        name: "Churn Cream",
        description: "Churn cream to separate butterfat",
        estimatedTimeHours: 0.5,
      },
      {
        stepNumber: 3,
        name: "Wash and Pack",
        description: "Wash butter and pack",
        estimatedTimeHours: 0.5,
      },
    ],
    milkRequirementPerUnit: 20,
    expectedYield: 1,
    yieldUnit: "kg",
    storageRequirements: "Refrigerate at 4°C",
    shelfLifeDays: 15,
    currentStock: 30,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockWorkers: Worker[] = [
  { id: "w-1", name: "Rajesh Kumar", role: "Production Supervisor" },
  { id: "w-2", name: "Suresh Patil", role: "Production Operator" },
  { id: "w-3", name: "Ramesh Sharma", role: "Quality Inspector" },
  { id: "w-4", name: "Vijay Singh", role: "Production Operator" },
  { id: "w-5", name: "Amit Verma", role: "Packaging Operator" },
];

export const mockBatches: ProductionBatch[] = [
  {
    id: "batch-1",
    batchId: "B2024001",
    productId: "prod-1",
    productName: "Premium Paneer",
    quantity: 50,
    milkAllocated: 250,
    status: "in_progress",
    currentStep: 2,
    totalSteps: 4,
    progressPercentage: 50,
    assignedWorkers: [mockWorkers[0], mockWorkers[1]],
    startDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    estimatedEndDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    priority: "high",
    createdBy: { id: "user-1", name: "Admin User" },
    stepProgress: [
      {
        stepNumber: 1,
        stepName: "Heat Milk",
        status: "completed",
        assignedWorker: mockWorkers[1],
        startTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
        parameters: { temperature: 85, duration: 30 },
      },
      {
        stepNumber: 2,
        stepName: "Add Culture",
        status: "in_progress",
        assignedWorker: mockWorkers[1],
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        stepNumber: 3,
        stepName: "Separate Curds",
        status: "not_started",
      },
      {
        stepNumber: 4,
        stepName: "Cool and Pack",
        status: "not_started",
      },
    ],
  },
  {
    id: "batch-2",
    batchId: "B2024002",
    productId: "prod-2",
    productName: "Fresh Curd",
    quantity: 100,
    milkAllocated: 100,
    status: "not_started",
    currentStep: 0,
    totalSteps: 4,
    progressPercentage: 0,
    assignedWorkers: [mockWorkers[2], mockWorkers[3]],
    startDate: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    priority: "medium",
    createdBy: { id: "user-1", name: "Admin User" },
    stepProgress: [],
  },
  {
    id: "batch-3",
    batchId: "B2024003",
    productId: "prod-1",
    productName: "Premium Paneer",
    quantity: 30,
    milkAllocated: 150,
    status: "completed",
    currentStep: 4,
    totalSteps: 4,
    progressPercentage: 100,
    assignedWorkers: [mockWorkers[0]],
    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    actualEndDate: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    priority: "low",
    createdBy: { id: "user-1", name: "Admin User" },
    stepProgress: [],
  },
];

export const mockProductionStats: ProductionStats = {
  activeBatches: 8,
  completedToday: 3,
  pendingBatches: 5,
  totalMilkUsed: 1250,
  averageYield: 87.5,
  onHoldBatches: 1,
};

export const mockLocations: Location[] = [
  {
    id: "loc-1",
    name: "Main Warehouse",
    type: "warehouse",
    address: "Plot No. 123, Industrial Area",
    capacity: 10_000,
    currentOccupancy: 6_500,
    isActive: true,
  },
  {
    id: "loc-2",
    name: "Cold Storage Unit 1",
    type: "cold_storage",
    capacity: 5_000,
    currentOccupancy: 4_200,
    temperature: 4,
    isActive: true,
  },
  {
    id: "loc-3",
    name: "Packaging Area",
    type: "packaging",
    capacity: 2_000,
    currentOccupancy: 800,
    isActive: true,
  },
  {
    id: "loc-4",
    name: "Retail Shop - Main",
    type: "shop",
    address: "Shop No. 45, Market Street",
    capacity: 500,
    currentOccupancy: 320,
    isActive: true,
  },
];

export const mockStockItems: StockItem[] = Array.from(
  { length: 30 },
  (_, index) => {
    const products = [
      "Premium Paneer",
      "Fresh Curd",
      "White Butter",
      "Cheese Blocks",
      "Ghee",
    ];
    const categories = ["Paneer", "Curd", "Butter", "Cheese", "Ghee"] as const;
    const statuses: StockItem["status"][] = [
      "available",
      "reserved",
      "hold",
      "damaged",
      "expired",
    ];

    const productIndex = index % products.length;
    const manufactureDate = new Date(
      Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1_000
    );
    const daysToExpiry = Math.floor(Math.random() * 30) - 5;
    const expiryDate = new Date(
      Date.now() + daysToExpiry * 24 * 60 * 60 * 1_000
    );

    const expiryStatus: StockItem["expiryStatus"] =
      daysToExpiry < 0
        ? "expired"
        : daysToExpiry <= 3
        ? "critical"
        : daysToExpiry <= 7
        ? "expiring_soon"
        : "fresh";

    const location = mockLocations[index % mockLocations.length];
    const quantity = Math.floor(Math.random() * 500) + 50;
    const costPerUnit = Math.floor(Math.random() * 100) + 50;

    return {
      id: `stock-${index + 1}`,
      productId: `prod-${productIndex + 1}`,
      productName: products[productIndex],
      productCategory: categories[productIndex],
      batchNumber: `B${String(index + 1).padStart(4, "0")}`,
      locationId: location.id,
      locationName: location.name,
      quantity,
      unit: "kg",
      status: statuses[Math.floor(Math.random() * statuses.length)],
      manufactureDate: manufactureDate.toISOString(),
      expiryDate: expiryDate.toISOString(),
      daysToExpiry: Math.max(daysToExpiry, -10),
      expiryStatus,
      costPerUnit,
      totalValue: quantity * costPerUnit,
      lastUpdated: new Date().toISOString(),
    } satisfies StockItem;
  }
);

export const mockColdStorageZones: ColdStorageZone[] = [
  {
    id: "zone-1",
    name: "Cold Storage Unit 1",
    zoneNumber: "CS-01",
    temperature: 4.2,
    targetTemperature: 4,
    humidity: 85,
    capacity: 2_000,
    currentOccupancy: 1_650,
    occupancyPercentage: 82.5,
    status: "active",
    productsStored: 45,
    alerts: [],
    lastChecked: new Date().toISOString(),
  },
  {
    id: "zone-2",
    name: "Cold Storage Unit 2",
    zoneNumber: "CS-02",
    temperature: 3.8,
    targetTemperature: 4,
    humidity: 88,
    capacity: 2_000,
    currentOccupancy: 1_800,
    occupancyPercentage: 90,
    status: "active",
    productsStored: 52,
    alerts: [
      {
        type: "capacity",
        message: "Capacity is above 85%. Consider redistributing stock.",
        severity: "medium",
      },
    ],
    lastChecked: new Date().toISOString(),
  },
  {
    id: "zone-3",
    name: "Cold Storage Unit 3",
    zoneNumber: "CS-03",
    temperature: 6.5,
    targetTemperature: 4,
    humidity: 82,
    capacity: 1_000,
    currentOccupancy: 750,
    occupancyPercentage: 75,
    status: "active",
    productsStored: 28,
    alerts: [
      {
        type: "temperature",
        message: "Temperature is 2.5°C above target. Check cooling system.",
        severity: "high",
      },
    ],
    lastChecked: new Date().toISOString(),
  },
  {
    id: "zone-4",
    name: "Freezer Unit",
    zoneNumber: "FZ-01",
    temperature: -18,
    targetTemperature: -18,
    humidity: 70,
    capacity: 500,
    currentOccupancy: 200,
    occupancyPercentage: 40,
    status: "active",
    productsStored: 15,
    alerts: [],
    lastChecked: new Date().toISOString(),
  },
];

export const mockInventoryStats: InventoryStats = {
  totalStockValue: 1_250_000,
  totalItems: mockStockItems.length,
  totalLocations: mockLocations.length,
  lowStockItems: 5,
  expiringItems: mockStockItems.filter(
    (item) => item.expiryStatus === "expiring_soon"
  ).length,
  expiredItems: mockStockItems.filter((item) => item.expiryStatus === "expired")
    .length,
  stockByLocation: mockLocations.map((location) => ({
    locationId: location.id,
    locationName: location.name,
    totalItems: mockStockItems.filter((item) => item.locationId === location.id)
      .length,
    totalValue: mockStockItems
      .filter((item) => item.locationId === location.id)
      .reduce((sum, item) => sum + (item.totalValue ?? 0), 0),
  })),
  stockByCategory: ["Paneer", "Curd", "Butter", "Cheese", "Ghee"].map(
    (category) => ({
      category,
      totalItems: mockStockItems.filter(
        (item) => item.productCategory === category
      ).length,
      totalValue: mockStockItems
        .filter((item) => item.productCategory === category)
        .reduce((sum, item) => sum + (item.totalValue ?? 0), 0),
    })
  ),
};

export const mockExpiryAlerts: ExpiryAlert[] = mockStockItems
  .filter(
    (item) =>
      item.expiryStatus === "critical" || item.expiryStatus === "expiring_soon"
  )
  .slice(0, 5)
  .map((item) => ({
    id: `alert-${item.id}`,
    productId: item.productId,
    productName: item.productName,
    batchNumber: item.batchNumber,
    locationName: item.locationName,
    quantity: item.quantity,
    expiryDate: item.expiryDate,
    daysToExpiry: item.daysToExpiry,
    severity: item.expiryStatus === "critical" ? "critical" : "high",
    action:
      item.daysToExpiry <= 1 ? "Remove immediately" : "Plan clearance sale",
  }));

export const mockVendors: Vendor[] = [
  {
    id: "vendor-1",
    vendor_id: "VEN-001",
    company_name: "Punjab Milk Cooperative",
    vendor_type: "milk_supplier",
    status: "active",
    contact_persons: [
      {
        id: "contact-1",
        name: "Rajinder Singh",
        phone: "+91-98765-43210",
        email: "rajinder@pumilkcoop.com",
        designation: "Operations Manager",
      },
    ],
    phone: "+91-161-2345678",
    email: "contact@pumilkcoop.com",
    gst_number: "03AABCA5055K1Z0",
    pan_number: "AAAPA1234A",
    registration_number: "REG-PUJ-2020-001",
    billing_address: {
      street: "123 Milk Market",
      city: "Chandigarh",
      state: "Punjab",
      postal_code: "160001",
      country: "India",
    },
    shipping_address: {
      street: "123 Milk Market",
      city: "Chandigarh",
      state: "Punjab",
      postal_code: "160001",
      country: "India",
    },
    warehouse_address: {
      street: "19 Industrial Area",
      city: "Ludhiana",
      state: "Punjab",
      postal_code: "141001",
      country: "India",
    },
    bank_details: {
      bank_name: "Punjab National Bank",
      account_number: "0123456789",
      ifsc_code: "PUNB0012345",
      account_holder: "Punjab Milk Cooperative",
      account_type: "current",
    },
    credit_period_days: 30,
    credit_limit: 500_000,
    payment_methods: ["cheque", "neft", "bank_transfer"],
    preferred_payment_method: "bank_transfer",
    discount_percentage: 2,
    rating: 4.6,
    total_purchases: 2_750_000,
    total_payments: 2_680_000,
    outstanding_balance: 70_000,
    documents: [
      {
        id: "doc-1",
        file_name: "GST-Certificate.pdf",
        file_url: "https://example.com/docs/gst-v1.pdf",
        document_type: "gst",
        upload_date: "2024-01-10T10:00:00Z",
      },
    ],
    created_at: "2024-01-05T10:00:00Z",
    updated_at: new Date().toISOString(),
    created_by: "admin@ichhadhari.com",
  },
  {
    id: "vendor-2",
    vendor_id: "VEN-002",
    company_name: "Amritsar Packaging Solutions",
    vendor_type: "packaging",
    status: "active",
    contact_persons: [
      {
        id: "contact-2",
        name: "Simran Kaur",
        phone: "+91-98888-76543",
        email: "simran@amritpack.com",
        designation: "Sales Head",
      },
      {
        id: "contact-3",
        name: "Gurpreet Singh",
        phone: "+91-97777-65432",
        email: "gurpreet@amritpack.com",
        designation: "Account Manager",
      },
    ],
    phone: "+91-183-2233445",
    email: "support@amritpack.com",
    gst_number: "03BBCCA1234H1Z3",
    pan_number: "BBBPA4321B",
    billing_address: {
      street: "Plot 45, Industrial Area",
      city: "Amritsar",
      state: "Punjab",
      postal_code: "143001",
      country: "India",
    },
    shipping_address: {
      street: "Plot 45, Industrial Area",
      city: "Amritsar",
      state: "Punjab",
      postal_code: "143001",
      country: "India",
    },
    credit_period_days: 45,
    credit_limit: 300_000,
    payment_methods: ["neft", "bank_transfer", "cheque"],
    preferred_payment_method: "neft",
    discount_percentage: 3,
    rating: 4.2,
    total_purchases: 960_000,
    total_payments: 830_000,
    outstanding_balance: 130_000,
    documents: [],
    created_at: "2024-02-18T08:00:00Z",
    updated_at: new Date().toISOString(),
    created_by: "admin@ichhadhari.com",
  },
  {
    id: "vendor-3",
    vendor_id: "VEN-003",
    company_name: "Ludhiana Equipment Rentals",
    vendor_type: "equipment",
    status: "suspended",
    contact_persons: [
      {
        id: "contact-4",
        name: "Harmeet Oberoi",
        phone: "+91-91234-56789",
        email: "harmeet@lequiprent.com",
        designation: "Director",
      },
    ],
    phone: "+91-161-4455667",
    email: "info@lequiprent.com",
    gst_number: "03CCCAA9999Z5Z7",
    billing_address: {
      street: "22 Industrial Park",
      city: "Ludhiana",
      state: "Punjab",
      postal_code: "141002",
      country: "India",
    },
    shipping_address: {
      street: "22 Industrial Park",
      city: "Ludhiana",
      state: "Punjab",
      postal_code: "141002",
      country: "India",
    },
    credit_period_days: 15,
    credit_limit: 150_000,
    payment_methods: ["cash", "bank_transfer"],
    discount_percentage: 0,
    rating: 3.4,
    total_purchases: 420_000,
    total_payments: 395_000,
    outstanding_balance: 25_000,
    documents: [],
    created_at: "2023-11-12T09:30:00Z",
    updated_at: new Date().toISOString(),
    created_by: "manager@ichhadhari.com",
  },
];

export const mockVendorPerformance: VendorPerformance[] = [
  {
    vendor_id: "vendor-1",
    quality_score: 4.8,
    delivery_punctuality: 4.6,
    order_accuracy: 4.7,
    payment_reliability: 4.5,
    overall_rating: 4.7,
    total_orders: 52,
    on_time_deliveries: 48,
    defective_items_count: 3,
    performance_level: "excellent",
    recommendation: "continue",
    last_updated: new Date().toISOString(),
  },
  {
    vendor_id: "vendor-2",
    quality_score: 4.2,
    delivery_punctuality: 4.0,
    order_accuracy: 4.4,
    payment_reliability: 4.3,
    overall_rating: 4.2,
    total_orders: 34,
    on_time_deliveries: 30,
    defective_items_count: 5,
    performance_level: "good",
    recommendation: "continue",
    last_updated: new Date().toISOString(),
  },
  {
    vendor_id: "vendor-3",
    quality_score: 3.1,
    delivery_punctuality: 2.8,
    order_accuracy: 3.4,
    payment_reliability: 3.0,
    overall_rating: 3.1,
    total_orders: 18,
    on_time_deliveries: 11,
    defective_items_count: 7,
    performance_level: "average",
    recommendation: "review",
    last_updated: new Date().toISOString(),
  },
];

export const mockVendorSummary = {
  total_vendors: mockVendors.length,
  active_vendors: mockVendors.filter((vendor) => vendor.status === "active")
    .length,
  outstanding_balance: mockVendors.reduce(
    (sum, vendor) => sum + vendor.outstanding_balance,
    0
  ),
  average_payment_days: 36,
  top_vendors: mockVendors.map((vendor) => ({
    vendor_id: vendor.id,
    company_name: vendor.company_name,
    total_purchases: vendor.total_purchases,
  })),
};

export const mockPurchaseRequisitions: PurchaseRequisition[] = [
  {
    id: "req-1",
    requisition_id: "REQ-2024-001",
    vendor_id: "vendor-1",
    status: "approved",
    items: [
      {
        id: "req-1-item-1",
        product_id: "MILK-001",
        product_name: "Fresh Cow Milk",
        quantity: 500,
        unit_price: 45,
        total: 22_500,
      },
    ],
    total_amount: 22_500,
    delivery_location: "cold_storage",
    delivery_date_preferred: new Date().toISOString(),
    special_instructions: "Deliver before 6 AM",
    requested_by: "ops@ichhadhari.com",
    approved_by: "manager@ichhadhari.com",
    created_at: "2024-10-10T08:00:00Z",
    updated_at: "2024-10-10T10:00:00Z",
  },
  {
    id: "req-2",
    requisition_id: "REQ-2024-002",
    vendor_id: "vendor-2",
    status: "pending_approval",
    items: [
      {
        id: "req-2-item-1",
        product_id: "PACK-001",
        product_name: "Paneer Packaging Box",
        quantity: 200,
        unit_price: 12,
        total: 2_400,
      },
      {
        id: "req-2-item-2",
        product_id: "LABEL-001",
        product_name: "Product Labels",
        quantity: 500,
        unit_price: 2,
        total: 1_000,
      },
    ],
    total_amount: 3_400,
    delivery_location: "warehouse",
    delivery_date_preferred: new Date(
      Date.now() + 3 * 24 * 60 * 60 * 1000
    ).toISOString(),
    requested_by: "packaging@ichhadhari.com",
    created_at: "2024-10-12T09:30:00Z",
    updated_at: "2024-10-12T09:30:00Z",
  },
];

export const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: "po-1",
    po_number: "PO-2024-001",
    vendor_id: "vendor-1",
    vendor: mockVendors[0],
    status: "confirmed",
    order_date: "2024-10-10T00:00:00Z",
    expected_delivery_date: "2024-10-15T00:00:00Z",
    items: [
      {
        id: "po-1-item-1",
        product_id: "MILK-001",
        product_name: "Fresh Cow Milk (Pasteurized)",
        quantity: 500,
        unit_price: 45,
        discount: 0,
        tax_rate: 5,
        tax_amount: 1_125,
        total: 23_625,
        hsn_code: "0401",
      },
    ],
    subtotal: 22_500,
    tax_amount: 1_125,
    total_amount: 23_625,
    delivery_location: "cold_storage",
    is_recurring: true,
    recurring_frequency: "weekly",
    next_recurring_date: "2024-10-22T00:00:00Z",
    po_qr_code: "data:image/png;base64,placeholder",
    special_instructions: "Maintain temperature below 5°C",
    created_by: "manager@ichhadhari.com",
    created_at: "2024-10-10T08:00:00Z",
    updated_at: "2024-10-11T06:00:00Z",
  },
  {
    id: "po-2",
    po_number: "PO-2024-002",
    vendor_id: "vendor-2",
    vendor: mockVendors[1],
    status: "partially_received",
    order_date: "2024-09-25T00:00:00Z",
    expected_delivery_date: "2024-10-02T00:00:00Z",
    actual_delivery_date: "2024-10-03T00:00:00Z",
    items: [
      {
        id: "po-2-item-1",
        product_id: "PACK-001",
        product_name: "Paneer Packaging Box",
        quantity: 300,
        unit_price: 12,
        discount: 5,
        tax_rate: 12,
        tax_amount: 432,
        total: 3_240,
        hsn_code: "4819",
      },
      {
        id: "po-2-item-2",
        product_id: "LABEL-001",
        product_name: "Product Labels",
        quantity: 800,
        unit_price: 2,
        discount: 0,
        tax_rate: 18,
        tax_amount: 288,
        total: 1_888,
        hsn_code: "4821",
      },
    ],
    subtotal: 4_700,
    tax_amount: 720,
    total_amount: 5_420,
    delivery_location: "warehouse",
    is_recurring: false,
    po_qr_code: "data:image/png;base64,placeholder",
    created_by: "procurement@ichhadhari.com",
    created_at: "2024-09-25T07:00:00Z",
    updated_at: "2024-10-03T15:00:00Z",
  },
  {
    id: "po-3",
    po_number: "PO-2024-003",
    vendor_id: "vendor-3",
    vendor: mockVendors[2],
    status: "draft",
    order_date: "2024-10-14T00:00:00Z",
    expected_delivery_date: "2024-10-28T00:00:00Z",
    items: [
      {
        id: "po-3-item-1",
        product_id: "EQUIP-001",
        product_name: "Stainless Steel Milk Can",
        quantity: 25,
        unit_price: 2_500,
        discount: 0,
        tax_rate: 18,
        tax_amount: 11_250,
        total: 73_750,
        hsn_code: "7323",
      },
    ],
    subtotal: 62_500,
    tax_amount: 11_250,
    total_amount: 73_750,
    delivery_location: "warehouse",
    is_recurring: false,
    created_by: "admin@ichhadhari.com",
    created_at: "2024-10-14T11:00:00Z",
    updated_at: "2024-10-14T11:00:00Z",
  },
];

export const mockGoodsReceiptNotes: GoodsReceiptNote[] = [
  {
    id: "grn-1",
    grn_number: "GRN-2024-001",
    purchase_order_id: "po-2",
    received_date: "2024-10-03T00:00:00Z",
    received_by: "warehouse@ichhadhari.com",
    items_received: [
      {
        po_item_id: "po-2-item-1",
        quantity_received: 250,
        condition: "good",
        batch_number: "PACK-2024-09-01",
      },
      {
        po_item_id: "po-2-item-2",
        quantity_received: 800,
        condition: "good",
        batch_number: "LAB-2024-09-02",
      },
    ],
    quality_notes: "Packaging arrived in good condition",
    status: "partial",
    created_at: "2024-10-03T10:30:00Z",
    updated_at: "2024-10-03T10:30:00Z",
  },
];

export const mockReturnOrders: ReturnOrder[] = [
  {
    id: "ret-1",
    return_id: "RET-2024-001",
    grn_id: "grn-1",
    return_date: "2024-10-05T00:00:00Z",
    reason: "Damaged packaging boxes",
    authorization_number: "AUTH-RET-001",
    items_returned: [
      {
        po_item_id: "po-2-item-1",
        quantity: 20,
        condition: "damaged",
      },
    ],
    total_return_value: 2_400,
    status: "processed",
    credit_note_issued: true,
    credit_note_amount: 2_400,
    created_by: "quality@ichhadhari.com",
    created_at: "2024-10-05T12:00:00Z",
    updated_at: "2024-10-06T08:00:00Z",
  },
];

export const mockPayments: Payment[] = [
  {
    id: "payment-1",
    payment_id: "PAY-2024-001",
    vendor_id: "vendor-1",
    payment_date: "2024-10-12T00:00:00Z",
    amount: 23_625,
    payment_method: "cheque",
    reference_number: "CHQ-789456",
    payment_type: "full",
    purchase_order_ids: ["po-1"],
    invoice_ids: ["invoice-1"],
    reconciled: true,
    reconciliation_date: "2024-10-13T00:00:00Z",
    remarks: "Payment for PO-2024-001",
    documents: [],
    created_by: "accounts@ichhadhari.com",
    created_at: "2024-10-12T10:00:00Z",
  },
  {
    id: "payment-2",
    payment_id: "PAY-2024-002",
    vendor_id: "vendor-2",
    payment_date: "2024-10-05T00:00:00Z",
    amount: 3_000,
    payment_method: "neft",
    reference_number: "NEFT-552311",
    payment_type: "partial",
    purchase_order_ids: ["po-2"],
    invoice_ids: ["invoice-2"],
    reconciled: false,
    remarks: "Partial payment due to shortage",
    documents: [],
    created_by: "accounts@ichhadhari.com",
    created_at: "2024-10-05T09:00:00Z",
  },
];

export const mockOutstandingBalances: OutstandingBalance[] = mockVendors.map(
  (vendor) => ({
    vendor_id: vendor.id,
    vendor_name: vendor.company_name,
    total_outstanding: vendor.outstanding_balance,
    age_0_30: Math.floor(vendor.outstanding_balance * 0.5),
    age_31_60: Math.floor(vendor.outstanding_balance * 0.3),
    age_61_90: Math.floor(vendor.outstanding_balance * 0.15),
    age_90_plus: Math.floor(vendor.outstanding_balance * 0.05),
    payment_status:
      vendor.outstanding_balance > vendor.credit_limit * 0.4
        ? "critical"
        : vendor.outstanding_balance > vendor.credit_limit * 0.2
        ? "overdue"
        : "on_time",
    days_overdue: vendor.outstanding_balance > 0 ? 12 : 0,
  })
);

export const mockPaymentReminders: PaymentReminder[] = [
  {
    id: "reminder-1",
    vendor_id: "vendor-2",
    invoice_id: "invoice-2",
    reminder_date: new Date().toISOString(),
    reminder_type: "overdue_3days",
    sent: false,
  },
];

export const mockInvoices: Invoice[] = [
  {
    id: "invoice-1",
    invoice_number: "INV-2024-001",
    purchase_order_id: "po-1",
    vendor_id: "vendor-1",
    invoice_date: "2024-10-10T00:00:00Z",
    due_date: "2024-11-09T00:00:00Z",
    items: mockPurchaseOrders[0].items,
    subtotal: 22_500,
    tax_amount: 1_125,
    total_amount: 23_625,
    amount_paid: 23_625,
    amount_outstanding: 0,
    is_fully_paid: true,
    paid_on: "2024-10-12T00:00:00Z",
    gst_percentage: 5,
    remarks: "Milk delivery for October week 1",
    created_at: "2024-10-10T10:00:00Z",
  },
  {
    id: "invoice-2",
    invoice_number: "INV-2024-002",
    purchase_order_id: "po-2",
    vendor_id: "vendor-2",
    invoice_date: "2024-10-02T00:00:00Z",
    due_date: "2024-11-01T00:00:00Z",
    items: mockPurchaseOrders[1].items,
    subtotal: 4_700,
    tax_amount: 720,
    total_amount: 5_420,
    amount_paid: 3_000,
    amount_outstanding: 2_420,
    is_fully_paid: false,
    gst_percentage: 12,
    remarks: "Packaging supplies for paneer line",
    created_at: "2024-10-02T11:30:00Z",
  },
];

export const mockVendorListReport: ReportPayload<VendorListReportRow> = {
  data: mockVendors.map((vendor) => ({
    vendor_id: vendor.vendor_id,
    company_name: vendor.company_name,
    vendor_type: vendor.vendor_type,
    contact_person: vendor.contact_persons[0]?.name ?? "",
    phone: vendor.phone,
    email: vendor.email,
    rating: vendor.rating,
    outstanding_balance: vendor.outstanding_balance,
  })),
  generated_at: new Date().toISOString(),
  filters: {},
};

export const mockOutstandingReport: ReportPayload<OutstandingBalanceReportRow> =
  {
    data: mockOutstandingBalances.map((entry) => ({
      vendor_id: entry.vendor_id,
      company_name: entry.vendor_name,
      age_0_30: entry.age_0_30,
      age_31_60: entry.age_31_60,
      age_61_90: entry.age_61_90,
      age_90_plus: entry.age_90_plus,
      total_outstanding: entry.total_outstanding,
    })),
    generated_at: new Date().toISOString(),
    filters: {},
  };

export const mockPaymentHistoryReport: ReportPayload<PaymentHistoryReportRow> =
  {
    data: mockPayments.map((payment) => ({
      payment_id: payment.payment_id,
      vendor_name:
        mockVendors.find((vendor) => vendor.id === payment.vendor_id)
          ?.company_name ?? "",
      payment_date: payment.payment_date,
      amount: payment.amount,
      payment_method: payment.payment_method,
      payment_type: payment.payment_type,
      reconciled: payment.reconciled,
    })),
    generated_at: new Date().toISOString(),
    filters: {},
  };
