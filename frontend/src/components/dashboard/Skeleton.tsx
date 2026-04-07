import React from "react";

export const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
    return (
        <div
            className={`animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-lg ${className}`}
            style={{ backgroundSize: "200% 100%", animation: "pulse 1.5s ease-in-out infinite" }}
            {...props}
        />
    );
};

export const ChartSkeleton = ({ height = "h-64" }: { height?: string }) => {
    return (
        <div className={`w-full ${height} flex flex-col gap-3 p-2`}>
            {/* Fake Y-axis labels */}
            <div className="flex gap-3 h-full">
                <div className="flex flex-col justify-between py-2 shrink-0">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-3 w-8" />
                    ))}
                </div>
                {/* Chart bars */}
                <div className="flex-1 flex items-end gap-2 pb-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton
                            key={i}
                            className="flex-1 rounded-t-md"
                            style={{ height: `${30 + Math.random() * 60}%` }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => {
    return (
        <div className="w-full mt-4">
            <div className="flex gap-4 mb-3">
                <Skeleton className="h-9 w-1/4" />
                <Skeleton className="h-9 w-1/4" />
                <Skeleton className="h-9 w-1/4" />
                <Skeleton className="h-9 w-1/4" />
            </div>
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex gap-4 mb-2.5">
                    <Skeleton className="h-7 w-1/4" />
                    <Skeleton className="h-7 w-1/4" />
                    <Skeleton className="h-7 w-1/4" />
                    <Skeleton className="h-7 w-1/4" />
                </div>
            ))}
        </div>
    );
};

export const CardsSkeleton = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-slate-100 p-5 shadow-sm">
                    <Skeleton className="h-4 w-24 mb-3" />
                    <Skeleton className="h-8 w-32 mb-2" />
                    <Skeleton className="h-3 w-20" />
                </div>
            ))}
        </div>
    );
};

export const StatCardSkeleton = () => {
    return (
        <div className="rounded-2xl border border-slate-100 p-5 shadow-sm bg-white">
            <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-10 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-28 mb-2" />
            <Skeleton className="h-3 w-20" />
        </div>
    );
};