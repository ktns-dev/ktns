import React from "react";

interface HeaderProps {
  value: string;
  subtitle?: string;
}

export const Header = ({ value, subtitle }: HeaderProps) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-900 px-6 py-5 shadow-lg border-b border-slate-600/30 dark:border-slate-700/50">
      {/* Decorative accent lines */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500" />
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "24px 24px"
        }}
      />
      <div className="relative flex items-center gap-3">
        <div className="flex flex-col">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">
            {value}
          </h1>
          {subtitle && (
            <p className="text-slate-400 dark:text-slate-500 text-xs sm:text-sm mt-0.5 font-medium">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};