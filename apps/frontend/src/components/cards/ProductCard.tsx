"use client";

import type { ComponentType } from "react";
import { motion } from "framer-motion";
import { Clock, Droplet, Package, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Recipe, Paneer, Cheese, Butter, Yogurt } from "@/components/icons";
import { formatNumber } from "@/lib/utils/formatters";
import type { Product } from "@/types/production";

interface ProductCardProps {
  product: Product;
  onView?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onCreateBatch?: (product: Product) => void;
}

type IconComponent = ComponentType<{ className?: string }>;

const categoryIcons: Record<string, IconComponent> = {
  Paneer,
  Cheese,
  Butter,
  Yogurt,
  Curd: Yogurt,
};

export function ProductCard({
  product,
  onView,
  onEdit,
  onDelete,
  onCreateBatch,
}: ProductCardProps) {
  const IconComponent = categoryIcons[product.category] ?? Recipe;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.12)" }}
      className="bg-white rounded-xl p-6 border border-gray-100 shadow-dairy relative overflow-hidden group"
    >
      <motion.div
        className="absolute -right-8 -top-8 w-32 h-32 bg-dairy-blue/5 rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-12 h-12 bg-gradient-to-br from-dairy-blue to-dairy-darkBlue rounded-xl flex items-center justify-center"
            whileHover={{ rotate: 5, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <IconComponent className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h3 className="font-semibold text-dairy-charcoal text-lg">
              {product.name}
            </h3>
            <Badge className="mt-1 bg-blue-100 text-blue-800 hover:bg-blue-100">
              {product.category}
            </Badge>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4 line-clamp-2 relative z-10">
        {product.description}
      </p>

      <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
          <Droplet className="w-4 h-4 text-blue-600" />
          <div>
            <p className="text-xs text-gray-600">Milk Required</p>
            <p className="text-sm font-semibold text-blue-900">
              {formatNumber(product.milkRequirementPerUnit)} L
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
          <Package className="w-4 h-4 text-green-600" />
          <div>
            <p className="text-xs text-gray-600">Yield</p>
            <p className="text-sm font-semibold text-green-900">
              {formatNumber(product.expectedYield)} {product.yieldUnit}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
          <Clock className="w-4 h-4 text-orange-600" />
          <div>
            <p className="text-xs text-gray-600">Steps</p>
            <p className="text-sm font-semibold text-orange-900">
              {product.steps?.length ?? 0} Steps
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
          <Package className="w-4 h-4 text-purple-600" />
          <div>
            <p className="text-xs text-gray-600">Stock</p>
            <p className="text-sm font-semibold text-purple-900">
              {formatNumber(product.currentStock)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 relative z-10">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1"
        >
          <Button
            onClick={() => onCreateBatch?.(product)}
            className="w-full bg-dairy-blue hover:bg-dairy-darkBlue"
            size="sm"
          >
            Create Batch
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button onClick={() => onView?.(product)} variant="outline" size="sm">
            <Eye className="w-4 h-4" />
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button onClick={() => onEdit?.(product)} variant="outline" size="sm">
            <Edit className="w-4 h-4" />
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            onClick={() => onDelete?.(product)}
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>

      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10"
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.6 }}
      />
    </motion.div>
  );
}
