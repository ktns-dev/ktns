"use client";

import React, { useState } from "react";
import { Header } from "@/components/dashboard/Header";
import { motion } from "framer-motion";

const CARD_CLASS =
  "bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300";

interface KPICardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  iconBg: string;
  valueCls: string;
  borderCls: string;
  delay?: number;
}

const KPICard = ({ label, value, icon, iconBg, valueCls, borderCls, delay = 0 }: KPICardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className={`${CARD_CLASS} border-l-4 ${borderCls} p-5 flex items-center gap-4`}
  >
    <div className={`${iconBg} w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm`}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide truncate">{label}</p>
      <p className={`text-2xl font-bold ${valueCls} mt-0.5 tracking-tight`}>{value}</p>
    </div>
  </motion.div>
);

export function AccountantDashboard() {
  const [financialData] = useState({
    totalIncome: 0,
    totalExpense: 0,
    totalFees: 0,
    balance: 0,
  });

  const incomeIcon = (
    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
  const expenseIcon = (
    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );
  const feesIcon = (
    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
  const balanceIcon = (
    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Header value="Accountant Dashboard" subtitle="Financial Overview" />

      <main className="px-4 py-6 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto space-y-6">

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <KPICard
            label="Total Income"
            value={`Rs.${financialData.totalIncome.toLocaleString()}`}
            icon={incomeIcon}
            iconBg="bg-emerald-500"
            valueCls="text-emerald-700"
            borderCls="border-emerald-400"
            delay={0}
          />
          <KPICard
            label="Total Expenses"
            value={`Rs.${financialData.totalExpense.toLocaleString()}`}
            icon={expenseIcon}
            iconBg="bg-rose-500"
            valueCls="text-rose-700"
            borderCls="border-rose-400"
            delay={0.08}
          />
          <KPICard
            label="Total Fees Collected"
            value={`Rs.${financialData.totalFees.toLocaleString()}`}
            icon={feesIcon}
            iconBg="bg-indigo-500"
            valueCls="text-indigo-700"
            borderCls="border-indigo-400"
            delay={0.16}
          />
          <KPICard
            label="Net Balance"
            value={`Rs.${financialData.balance.toLocaleString()}`}
            icon={balanceIcon}
            iconBg={financialData.balance >= 0 ? "bg-blue-500" : "bg-orange-500"}
            valueCls={financialData.balance >= 0 ? "text-blue-700" : "text-orange-700"}
            borderCls={financialData.balance >= 0 ? "border-blue-400" : "border-orange-400"}
            delay={0.24}
          />
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.32 }}
          className={`${CARD_CLASS} p-5`}
        >
          <div className="border-b border-slate-100 pb-4 mb-5">
            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-0.5">Actions</p>
            <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white py-2.5 px-4 rounded-xl transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow-md active:scale-[0.98]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Income
            </button>
            <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white py-2.5 px-4 rounded-xl transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow-md active:scale-[0.98]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
              </svg>
              Add Expense
            </button>
            <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white py-2.5 px-4 rounded-xl transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow-md active:scale-[0.98]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Manage Fees
            </button>
          </div>
        </motion.div>

      </main>
    </div>
  );
}
