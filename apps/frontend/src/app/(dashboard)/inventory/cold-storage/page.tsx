"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle,
  Droplet,
  Package,
  RefreshCw,
  Wrench,
  Activity,
  ZapOff,
  Calendar,
  AlertTriangle,
  Edit,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useColdStorages,
  useUpdateTemperature,
  useMaintenanceAlerts,
} from "@/lib/hooks/api/useInventory";
import {
  ColdStorage as ColdStorageIcon,
  ThermometerIcon,
} from "@/components/icons";
import { staggerContainer, staggerItem } from "@/lib/utils/animations";
import { formatNumber, formatDate } from "@/lib/utils/formatters";
import type { ColdStorage } from "@/lib/services/inventory.service";
import { toast } from "sonner";

export default function ColdStoragePage() {
  const [selectedStorage, setSelectedStorage] = useState<ColdStorage | null>(
    null
  );
  const [temperatureDialog, setTemperatureDialog] = useState(false);
  const [newTemperature, setNewTemperature] = useState("");
  const [newHumidity, setNewHumidity] = useState("");

  const { data: storageData, isLoading } = useColdStorages();
  const { data: alertsData } = useMaintenanceAlerts();
  const updateTemperatureMutation = useUpdateTemperature();

  const storages = (storageData?.results || []) as ColdStorage[];
  const alerts = (alertsData?.results || []) as ColdStorage[];

  const handleUpdateTemperature = async () => {
    if (!selectedStorage || !newTemperature || !newHumidity) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      await updateTemperatureMutation.mutateAsync({
        id: selectedStorage.id,
        temperature: parseFloat(newTemperature),
        humidity: parseFloat(newHumidity),
      });

      setTemperatureDialog(false);
      setNewTemperature("");
      setNewHumidity("");
      setSelectedStorage(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const openTemperatureDialog = (storage: ColdStorage) => {
    setSelectedStorage(storage);
    setNewTemperature(storage.temperature_celsius.toString());
    setNewHumidity(storage.humidity_percentage.toString());
    setTemperatureDialog(true);
  };

  const getStatusColor = (status: ColdStorage["status"]) => {
    const colors: Record<ColdStorage["status"], string> = {
      operational: "bg-green-100 text-green-800",
      maintenance: "bg-orange-100 text-orange-800",
      offline: "bg-red-100 text-red-800",
    };
    return colors[status];
  };

  const getTemperatureStatus = (current: number, target = 4) => {
    const diff = Math.abs(current - target);
    if (diff <= 1) return { status: "good", color: "text-green-600" } as const;
    if (diff <= 2)
      return { status: "warning", color: "text-orange-600" } as const;
    return { status: "critical", color: "text-red-600" } as const;
  };

  const stats = {
    total: storages.length,
    operational: storages.filter((s: ColdStorage) => s.status === "operational")
      .length,
    alerts: alerts.length,
    totalCapacity: storages.reduce(
      (sum: number, s: ColdStorage) => sum + s.capacity_liters,
      0
    ),
    totalLoad: storages.reduce(
      (sum: number, s: ColdStorage) => sum + s.current_load_liters,
      0
    ),
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5A3C] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cold storage data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-[#5D4037] flex items-center gap-3">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <ColdStorageIcon className="w-8 h-8 text-blue-600" />
            </motion.div>
            Cold Storage Management
          </h1>
          <p className="text-gray-600 mt-1">
            Real-time temperature monitoring and capacity management
          </p>
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </motion.div>

      {alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-orange-800 flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Maintenance Alerts
              </CardTitle>
              <CardDescription className="text-orange-700">
                {alerts.length} cold storage unit(s) require maintenance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {alerts.slice(0, 3).map((storage: ColdStorage) => (
                  <div
                    key={storage.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        {storage.location}
                      </p>
                      <p className="text-sm text-gray-600">
                        ID: {storage.unit_id} • Next maintenance due:{" "}
                        {formatDate(storage.next_maintenance_due)}
                      </p>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800">
                      <Calendar className="w-3 h-3 mr-1" />
                      Overdue
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={staggerItem}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Units
              </CardTitle>
              <ColdStorageIcon className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#5D4037]">
                {stats.total}
              </div>
              <p className="text-xs text-gray-500 mt-1">Active storage units</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Operational
              </CardTitle>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.operational}
              </div>
              <p className="text-xs text-gray-500 mt-1">Working normally</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Maintenance
              </CardTitle>
              <Wrench className="w-4 h-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {alerts.length}
              </div>
              <p className="text-xs text-gray-500 mt-1">Require attention</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Capacity
              </CardTitle>
              <Package className="w-4 h-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#5D4037]">
                {formatNumber(stats.totalCapacity)}L
              </div>
              <p className="text-xs text-gray-500 mt-1">Combined capacity</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Current Load
              </CardTitle>
              <Activity className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatNumber(stats.totalLoad)}L
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round((stats.totalLoad / stats.totalCapacity) * 100)}%
                utilized
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {storages.map((storage: ColdStorage, index: number) => {
          const tempStatus = getTemperatureStatus(storage.temperature_celsius);
          const utilizationPercent = Math.round(
            (storage.current_load_liters / storage.capacity_liters) * 100
          );

          return (
            <motion.div
              key={storage.id}
              variants={staggerItem}
              whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(0,0,0,0.1)" }}
            >
              <Card className="bg-linear-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 relative overflow-hidden">
                <motion.div
                  className="absolute -right-8 -top-8 w-32 h-32 bg-blue-300/20 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.2,
                  }}
                />

                <CardHeader className="relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <ColdStorageIcon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-blue-900">
                          {storage.location}
                        </CardTitle>
                        <CardDescription className="text-blue-700">
                          ID: {storage.unit_id}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge className={getStatusColor(storage.status)}>
                        {storage.status}
                      </Badge>
                      {storage.power_backup && (
                        <Badge variant="outline" className="text-xs">
                          <ZapOff className="w-3 h-3 mr-1" />
                          Backup
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 relative z-10">
                  <div className="bg-white rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <ThermometerIcon
                          className={`w-5 h-5 ${tempStatus.color}`}
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Temperature
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openTemperatureDialog(storage)}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Update
                      </Button>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <motion.span
                        className={`text-4xl font-bold ${tempStatus.color}`}
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {storage.temperature_celsius}°C
                      </motion.span>
                      {tempStatus.status === "good" ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle
                          className={`w-5 h-5 ${
                            tempStatus.status === "warning"
                              ? "text-orange-600"
                              : "text-red-600"
                          }`}
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900">
                        Capacity Utilization
                      </span>
                      <span className="text-sm font-semibold text-blue-900">
                        {utilizationPercent}%
                      </span>
                    </div>
                    <Progress value={utilizationPercent} className="h-2" />
                    <p className="text-xs text-blue-700 mt-1">
                      {formatNumber(storage.current_load_liters)}L /{" "}
                      {formatNumber(storage.capacity_liters)}L
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/50 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Droplet className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-xs text-blue-700">Humidity</p>
                          <p className="text-lg font-bold text-blue-900">
                            {storage.humidity_percentage}%
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/50 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-xs text-blue-700">Next Service</p>
                          <p className="text-xs font-bold text-blue-900">
                            {formatDate(storage.next_maintenance_due)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {storage.assigned_technician && (
                    <div className="bg-white/50 rounded-lg p-3 flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">
                          {storage.assigned_technician.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-blue-700">
                          Assigned Technician
                        </p>
                        <p className="text-sm font-medium text-blue-900">
                          {storage.assigned_technician}
                        </p>
                      </div>
                    </div>
                  )}

                  {tempStatus.status !== "good" && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-3 rounded-lg flex items-start gap-2 ${
                        tempStatus.status === "critical"
                          ? "bg-red-100 border border-red-300"
                          : "bg-orange-100 border border-orange-300"
                      }`}
                    >
                      <AlertTriangle
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          tempStatus.status === "critical"
                            ? "text-red-600"
                            : "text-orange-600"
                        }`}
                      />
                      <div>
                        <p
                          className={`text-xs font-medium ${
                            tempStatus.status === "critical"
                              ? "text-red-900"
                              : "text-orange-900"
                          }`}
                        >
                          {tempStatus.status === "critical"
                            ? "Critical Temperature Alert"
                            : "Temperature Warning"}
                        </p>
                        <p
                          className={`text-xs ${
                            tempStatus.status === "critical"
                              ? "text-red-700"
                              : "text-orange-700"
                          }`}
                        >
                          Temperature deviation detected. Please check
                          immediately.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {storages.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <ColdStorageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Cold Storage Units
          </h3>
          <p className="text-gray-600">
            Add your first cold storage unit to start monitoring
          </p>
        </div>
      )}

      <Dialog open={temperatureDialog} onOpenChange={setTemperatureDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Temperature and Humidity</DialogTitle>
            <DialogDescription>
              Update the current readings for {selectedStorage?.location}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="temperature">Temperature (°C)</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                value={newTemperature}
                onChange={(e) => setNewTemperature(e.target.value)}
                placeholder="Enter temperature"
              />
            </div>
            <div>
              <Label htmlFor="humidity">Humidity (%)</Label>
              <Input
                id="humidity"
                type="number"
                step="0.1"
                value={newHumidity}
                onChange={(e) => setNewHumidity(e.target.value)}
                placeholder="Enter humidity"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setTemperatureDialog(false);
                setNewTemperature("");
                setNewHumidity("");
                setSelectedStorage(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateTemperature}
              disabled={updateTemperatureMutation.isPending}
            >
              {updateTemperatureMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
