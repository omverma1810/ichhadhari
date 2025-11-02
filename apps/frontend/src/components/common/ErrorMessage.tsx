"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 rounded-xl border border-red-100 bg-red-50 p-8 text-center">
      <div className="flex items-center gap-2 text-red-600">
        <AlertTriangle className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Something went wrong</h2>
      </div>
      <p className="max-w-md text-sm text-red-700">{message}</p>
      {onRetry ? (
        <Button variant="outline" onClick={onRetry} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      ) : null}
    </div>
  );
}
