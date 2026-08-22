import React from 'react';

export function SkeletonCard() {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm animate-pulse space-y-3">
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 bg-gray-200 rounded-xl shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-3 bg-gray-100 rounded w-1/3" />
        </div>
      </div>
      <div className="h-12 bg-gray-100 rounded-xl" />
    </div>
  );
}

export function SkeletonTable({ rows = 4 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6 space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 animate-pulse">
          <div className="h-8 w-8 bg-gray-200 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-3 bg-gray-100 rounded w-1/4" />
          </div>
          <div className="h-6 w-16 bg-gray-200 rounded-lg shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonBadge() {
  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 animate-pulse text-center space-y-3">
      <div className="h-14 w-14 bg-gray-200 rounded-2xl mx-auto" />
      <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto" />
      <div className="h-3 bg-gray-100 rounded w-4/5 mx-auto" />
    </div>
  );
}
