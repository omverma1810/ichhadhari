export interface MilkIntake {
  id: string;
  batchId: string;
  quantity: number;
  fatPercentage: number;
  snfPercentage?: number;
  temperature?: number;
  category: "premium" | "standard" | "other";
  source?: string;
  supplierName?: string;
  notes?: string;
  recordedAt: string;
  recordedBy: {
    id: string;
    name: string;
  };
  status: "approved" | "pending" | "rejected";
}

export interface MilkIntakeFormData {
  quantity: number;
  fatPercentage: number;
  snfPercentage?: number;
  temperature?: number;
  source?: string;
  supplierName?: string;
  notes?: string;
  recordedAt: Date;
}

export interface SegregationStats {
  premium: {
    totalLiters: number;
    batches: number;
    averageFat: number;
    percentage: number;
  };
  standard: {
    totalLiters: number;
    batches: number;
    averageFat: number;
    percentage: number;
  };
  other: {
    totalLiters: number;
    batches: number;
    averageFat: number;
    percentage: number;
  };
  totalLiters: number;
  totalBatches: number;
  lastUpdated: string;
}

export interface MilkTrendData {
  date: string;
  premium: number;
  standard: number;
  other: number;
  total: number;
}
