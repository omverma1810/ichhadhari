"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductCard } from "@/components/cards/ProductCard";
import { ProductForm } from "@/components/forms/ProductForm";
import { BatchForm } from "@/components/forms/BatchForm";
import { useProducts } from "@/lib/hooks/api/useProduction";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import { Recipe } from "@/components/icons";
import { staggerContainer, staggerItem } from "@/lib/utils/animations";
import type { Product } from "@/lib/services/production.service";

export default function ProductsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data: productsData, isLoading } = useProducts();

  const handleCreateBatch = (product: Product) => {
    setSelectedProduct(product);
    setIsBatchModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <LoadingSpinner size="lg" withText text="Loading products..." />
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
          <h1 className="text-3xl font-bold text-dairy-charcoal flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Recipe className="w-8 h-8 text-dairy-blue" />
            </motion.div>
            Products & Recipes
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your product recipes and specifications
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-to-r from-dairy-blue to-dairy-darkBlue hover:from-dairy-darkBlue hover:to-dairy-blue h-11"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Product
          </Button>
        </motion.div>
      </motion.div>

      {productsData && productsData.results.length > 0 ? (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {productsData.results.map((product: Product) => (
            <motion.div key={product.id} variants={staggerItem}>
              <ProductCard
                product={product as any}
                onCreateBatch={handleCreateBatch as any}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <EmptyState
          icon={Package}
          title="No products yet"
          description="Create your first product recipe to start production"
          action={
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Product
            </Button>
          }
        />
      )}

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Recipe className="w-6 h-6 text-dairy-blue" />
              Create New Product
            </DialogTitle>
          </DialogHeader>
          <ProductForm
            onSuccess={() => {
              setIsCreateModalOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isBatchModalOpen} onOpenChange={setIsBatchModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Package className="w-6 h-6 text-dairy-green" />
              Create Production Batch
              {selectedProduct && (
                <span className="text-base font-normal text-gray-600">
                  for {selectedProduct.name}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <BatchForm
            initialData={undefined}
            onSuccess={() => {
              setIsBatchModalOpen(false);
              setSelectedProduct(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
