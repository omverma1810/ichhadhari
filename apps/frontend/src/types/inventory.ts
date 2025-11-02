export interface Location {
  id: string;
  name: string;
  type: "warehouse" | "cold_storage" | "packaging" | "shop" | "in_transit";
  address?: string;
  capacity?: number;
  currentOccupancy?: number;
  temperature?: number;
  isActive: boolean;
}

export interface StockItem {
  id: string;
  productId: string;
  productName: string;
  productCategory: string;
  batchNumber: string;
  locationId: string;
  locationName: string;
  quantity: number;
  unit: string;
  status: "available" | "reserved" | "hold" | "damaged" | "expired";
  manufactureDate: string;
  expiryDate: string;
  daysToExpiry: number;
  expiryStatus: "fresh" | "expiring_soon" | "critical" | "expired";
  costPerUnit?: number;
  totalValue?: number;
  lastUpdated: string;
}

export interface StockMovement {
  id: string;
  movementType: "in" | "out" | "transfer" | "adjustment" | "return";
  productId: string;
  productName: string;
  batchNumber: string;
  fromLocationId?: string;
  fromLocationName?: string;
  toLocationId?: string;
  toLocationName?: string;
  quantity: number;
  unit: string;
  reason: string;
  notes?: string;
  performedBy: {
    id: string;
    name: string;
  };
  approvedBy?: {
    id: string;
    name: string;
  };
  timestamp: string;
  status: "pending" | "approved" | "rejected" | "completed";
}

export interface StockAdjustment {
  id: string;
  productId: string;
  productName: string;
  locationId: string;
  locationName: string;
  batchNumber: string;
  currentQuantity: number;
  adjustmentQuantity: number;
  newQuantity: number;
  adjustmentType: "increase" | "decrease" | "correction";
  reason: string;
  notes?: string;
  requestedBy: {
    id: string;
    name: string;
  };
  approvedBy?: {
    id: string;
    name: string;
  };
  timestamp: string;
  status: "pending" | "approved" | "rejected";
}

export interface ColdStorageZone {
  id: string;
  name: string;
  zoneNumber: string;
  temperature: number;
  targetTemperature: number;
  humidity?: number;
  capacity: number;
  currentOccupancy: number;
  occupancyPercentage: number;
  status: "active" | "maintenance" | "offline";
  productsStored: number;
  alerts: Array<{
    type: "temperature" | "humidity" | "capacity";
    message: string;
    severity: "low" | "medium" | "high";
  }>;
  lastChecked: string;
}

export interface InventoryStats {
  totalStockValue: number;
  totalItems: number;
  totalLocations: number;
  lowStockItems: number;
  expiringItems: number;
  expiredItems: number;
  stockByLocation: Array<{
    locationId: string;
    locationName: string;
    totalItems: number;
    totalValue: number;
  }>;
  stockByCategory: Array<{
    category: string;
    totalItems: number;
    totalValue: number;
  }>;
}

export interface StockTransferRequest {
  fromLocationId: string;
  toLocationId: string;
  items: Array<{
    productId: string;
    batchNumber: string;
    quantity: number;
  }>;
  reason: string;
  notes?: string;
  requestedDate: Date;
}

export interface ExpiryAlert {
  id: string;
  productId: string;
  productName: string;
  batchNumber: string;
  locationName: string;
  quantity: number;
  expiryDate: string;
  daysToExpiry: number;
  severity: "low" | "medium" | "high" | "critical";
  action: string;
}
