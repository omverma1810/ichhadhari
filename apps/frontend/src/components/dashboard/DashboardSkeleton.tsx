"use client";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6 animate-pulse">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`dashboard-skeleton-card-${index}`}
            className="h-32 rounded-xl bg-gray-200"
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-80 rounded-xl bg-gray-200" />
        <div className="h-80 rounded-xl bg-gray-200" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 rounded-xl bg-gray-200 p-6 lg:col-span-2">
          <div className="h-6 w-40 rounded bg-gray-300" />
          <div className="space-y-3 pt-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`dashboard-skeleton-activity-${index}`}
                className="h-16 rounded bg-gray-300"
              />
            ))}
          </div>
        </div>
        <div className="space-y-3 rounded-xl bg-gray-200 p-6">
          <div className="h-6 w-32 rounded bg-gray-300" />
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`dashboard-skeleton-alert-${index}`}
              className="h-12 rounded bg-gray-300"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
