export interface ProductStep {
  id?: string;
  stepNumber: number;
  name: string;
  description: string;
  estimatedTimeHours: number;
  temperature?: number;
  temperatureUnit?: "celsius" | "fahrenheit";
  instructions?: string;
  requiresApproval?: boolean;
}

export type StepParameters = Record<
  string,
  number | string | boolean | undefined
>;

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  imageUrl?: string;
  steps?: ProductStep[];
  milkRequirementPerUnit: number;
  expectedYield: number;
  yieldUnit: string;
  storageRequirements: string;
  shelfLifeDays: number;
  currentStock: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  name: string;
  category: string;
  description: string;
  steps: ProductStep[];
  milkRequirementPerUnit: number;
  expectedYield: number;
  yieldUnit: string;
  storageRequirements: string;
  shelfLifeDays: number;
}

export interface ProductionBatch {
  id: string;
  batchId: string;
  productId: string;
  productName: string;
  quantity: number;
  milkAllocated: number;
  status: "not_started" | "in_progress" | "on_hold" | "completed" | "cancelled";
  currentStep: number;
  totalSteps: number;
  progressPercentage: number;
  assignedWorkers: Worker[];
  startDate: string;
  estimatedEndDate?: string;
  actualEndDate?: string;
  priority: "low" | "medium" | "high";
  notes?: string;
  createdBy: {
    id: string;
    name: string;
  };
  stepProgress: BatchStepProgress[];
}

export interface Worker {
  id: string;
  name: string;
  role: string;
}

export interface BatchStepProgress {
  stepNumber: number;
  stepName: string;
  status: "not_started" | "in_progress" | "completed" | "skipped";
  assignedWorker?: Worker;
  startTime?: string;
  endTime?: string;
  parameters?: {
    temperature?: number;
    pH?: number;
    duration?: number;
  } & StepParameters;
  notes?: string;
  recordedBy?: {
    id: string;
    name: string;
  };
}

export interface BatchFormData {
  productId: string;
  quantity: number;
  assignedWorkerIds: string[];
  scheduledStartDate: Date;
  priority: "low" | "medium" | "high";
  notes?: string;
}

export interface StepUpdateData {
  status: "in_progress" | "completed" | "skipped";
  assignedWorkerId?: string;
  parameters?: {
    temperature?: number;
    pH?: number;
    duration?: number;
  } & StepParameters;
  notes?: string;
}

export interface ProductionStats {
  activeBatches: number;
  completedToday: number;
  pendingBatches: number;
  totalMilkUsed: number;
  averageYield: number;
  onHoldBatches: number;
}
