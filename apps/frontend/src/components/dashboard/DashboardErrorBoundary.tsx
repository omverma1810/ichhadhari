"use client";

import { Component, type ReactNode } from "react";

import { Button } from "@/components/ui/button";

interface DashboardErrorBoundaryProps {
  children: ReactNode;
}

interface DashboardErrorBoundaryState {
  hasError: boolean;
}

export class DashboardErrorBoundary extends Component<
  DashboardErrorBoundaryProps,
  DashboardErrorBoundaryState
> {
  state: DashboardErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): DashboardErrorBoundaryState {
    return { hasError: true };
  }

  handleRetry = () => {
    this.setState({ hasError: false });
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4 rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            Dashboard temporarily unavailable
          </h2>
          <p className="max-w-lg text-sm text-gray-600">
            We ran into an unexpected issue while loading the dashboard. Please
            try again in a moment.
          </p>
          <Button onClick={this.handleRetry} className="gap-2">
            Retry
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
