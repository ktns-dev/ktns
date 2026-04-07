"use client";
import React, { useState, useEffect } from "react";
import { useRole } from "@/context/RoleContext";
import { TeacherDashboard } from "@/components/dashboard/TeacherDashboard";
import { AccountantDashboard } from "@/components/dashboard/AccountantDashboard";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
} from "recharts";
import { DashboardAPI } from "@/api/Dashboard/dashboardAPI";
import {
  CardsSkeleton,
  ChartSkeleton,
  Skeleton,
} from "@/components/dashboard/Skeleton";
import { Header } from "@/components/dashboard/Header";
import { motion } from "framer-motion";

// ─── Type Definitions ────────────────────────────────────────────────────────

interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: number;
}

interface UserRolesData {
  summary: { Roll: string; Total: number }[];
  graph: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string[];
      borderColor: string;
      borderWidth: number;
    }[];
    title: string;
  };
}

interface StudentSummaryData {
  summary: {
    total_students: number;
    present: number;
    absent: number;
    late: number;
    leave: number;
  };
  graph: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string[];
      borderColor: string[];
      borderWidth: number;
    }[];
    title: string;
  };
}

interface AttendanceSummaryData {
  summary: {
    date: string;
    class_name: string;
    attendance_values: {
      Present: number;
      Absent: number;
      Late: number;
      Leave: number;
    };
  }[];
  graph: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string | null;
      borderWidth: number | null;
    }[];
    title: string;
  };
}

interface IncomeExpenseSummaryData {
  year: number;
  monthly_data: {
    [key: string]: { income: number; expense: number; profit: number };
  };
  month_names: string[];
  totals: { income: number; expense: number; profit: number };
  graph: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string | string[];
      borderColor: string | string[];
      borderWidth: number;
    }[];
    title: string;
  };
}

interface FeeSummaryData {
  year: number;
  monthly_data: { [key: string]: number };
  total: number;
  graph: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
      borderWidth: number;
    }[];
    title: string;
  };
}

interface IncomeSummaryData {
  summary: {
    year: number;
    month: number;
    category_summary: { [category: string]: number };
  }[];
  graph: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
      borderWidth: number;
    }[];
    title: string;
  };
  total: number;
}

interface ExpenseSummaryData {
  summary: {
    year: number;
    month: number;
    category_summary: { [category: string]: number };
  }[];
  graph: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
      borderWidth: number;
    }[];
    title: string;
  };
  total: number;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

const getTodayDate = () => new Date().toISOString().split("T")[0];

// ─── Design Tokens ────────────────────────────────────────────────────────────

const CARD_CLASS =
  "bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300";

const SECTION_TITLE_CLASS =
  "text-base sm:text-lg font-bold text-slate-800 tracking-tight";

const FILTER_LABEL_CLASS = "text-xs font-semibold text-slate-500 uppercase tracking-wide mr-2";

const FILTER_SELECT_CLASS =
  "bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 font-medium focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none shadow-sm hover:border-slate-300 transition-colors cursor-pointer";

const FILTER_INPUT_CLASS =
  "bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 font-medium focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none shadow-sm hover:border-slate-300 transition-colors";

// ─── Custom Chart Tooltip ─────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 text-sm min-w-[120px]">
        <p className="font-semibold text-slate-200 mb-1.5 border-b border-slate-600 pb-1.5">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mt-1">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: entry.color || entry.fill }}
            />
            <span className="text-slate-300">{entry.name}:</span>
            <span className="font-bold text-white ml-auto pl-2">
              {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Stat Badge Card ──────────────────────────────────────────────────────────

interface StatBadgeProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  colorClass: string;        // e.g. "from-blue-500 to-indigo-600"
  bgClass: string;           // e.g. "bg-blue-50"
  textClass: string;         // e.g. "text-blue-700"
}

const StatBadge = ({ icon, label, value, colorClass, bgClass, textClass }: StatBadgeProps) => (
  <div className={`${bgClass} rounded-xl p-4 flex flex-col items-center gap-2 border border-white shadow-sm`}>
    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-white shadow-sm shrink-0`}>
      {icon}
    </div>
    <div className="text-center">
      <p className="text-xs text-slate-500 font-medium">{label}</p>
      <p className={`text-xl font-bold ${textClass} mt-0.5`}>{value}</p>
    </div>
  </div>
);

// ─── Financial KPI Card ───────────────────────────────────────────────────────

interface FinancialKPIProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  iconBg: string;
  valueCls: string;
  border?: string;
}

const FinancialKPI = ({ icon, label, value, iconBg, valueCls, border }: FinancialKPIProps) => (
  <div className={`bg-white rounded-2xl p-5 shadow-sm border ${border || "border-slate-100"} flex items-center gap-4`}>
    <div className={`${iconBg} w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm`}>
      {icon}
    </div>
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">{label}</p>
      <p className={`text-2xl font-bold ${valueCls} tracking-tight`}>{value}</p>
    </div>
  </div>
);

// ─── Section Card Wrapper ─────────────────────────────────────────────────────

const SectionCard = ({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, delay }}
    className={`${CARD_CLASS} ${className}`}
  >
    {children}
  </motion.div>
);

// ─── Icons (inline SVG helpers) ────────────────────────────────────────────────

const icons = {
  users: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  check: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  x: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  clock: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  calendar: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  currency: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  trendUp: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  trendDown: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
    </svg>
  ),
  creditCard: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
};

// ─── DashboardRouter ──────────────────────────────────────────────────────────

export default function DashboardRouter() {
  const { role, isLoading } = useRole();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-slate-500 text-sm font-medium">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  switch (role) {
    case "ADMIN":
    case "PRINCIPAL":
      return <AdminDashboardView />;
    case "TEACHER":
      return <TeacherDashboard />;
    case "ACCOUNTANT":
    case "FEE_MANAGER":
      return <AccountantDashboard />;
    case "USER":
      return <StudentDashboard />;
    default:
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center bg-white border border-slate-200 rounded-2xl p-8 shadow-sm max-w-sm">
            <p className="text-slate-600 font-medium">Unknown role. Please log in again.</p>
          </div>
        </div>
      );
  }
}

// ─── AdminDashboardView ────────────────────────────────────────────────────────

function AdminDashboardView() {
  const { role } = useRole();
  const [userRolesData, setUserRolesData] = useState<UserRolesData | null>(null);
  const [studentSummaryData, setStudentSummaryData] = useState<StudentSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [studentSummaryLoading, setStudentSummaryLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [attendanceSummaryData, setAttendanceSummaryData] = useState<AttendanceSummaryData | null>(null);
  const [attendanceSummaryLoading, setAttendanceSummaryLoading] = useState(true);
  const [incomeExpenseSummaryData, setIncomeExpenseSummaryData] = useState<IncomeExpenseSummaryData | null>(null);
  const [incomeExpenseLoading, setIncomeExpenseLoading] = useState(true);
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [feeSummaryData, setFeeSummaryData] = useState<FeeSummaryData | null>(null);
  const [feeSummaryLoading, setFeeSummaryLoading] = useState(true);
  const [incomeSummaryData, setIncomeSummaryData] = useState<IncomeSummaryData | null>(null);
  const [incomeSummaryLoading, setIncomeSummaryLoading] = useState(true);
  const [expenseSummaryData, setExpenseSummaryData] = useState<ExpenseSummaryData | null>(null);
  const [expenseSummaryLoading, setExpenseSummaryLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedExpenseMonth, setSelectedExpenseMonth] = useState<number | null>(null);

  const monthNames = [
    "All Months", "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const getAttVal = (values: Record<string, number>, key: string): number =>
    values[key] ??
    values[key.toLowerCase()] ??
    values[key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()] ??
    0;

  // ─── Data Fetching ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!role) return;
    DashboardAPI.GetUserRoles()
      .then((r: any) => { if (r?.data) setUserRolesData(r.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [role]);

  useEffect(() => {
    if (!role) return;
    setStudentSummaryLoading(true);
    DashboardAPI.GetStudentSummary(selectedDate)
      .then((r: any) => { if (r?.data) setStudentSummaryData(r.data); })
      .catch(console.error)
      .finally(() => setStudentSummaryLoading(false));
  }, [selectedDate, role]);

  useEffect(() => {
    if (!role) return;
    setAttendanceSummaryLoading(true);
    DashboardAPI.GetAttendanceSummary()
      .then((r: any) => {
        if (r?.data) setAttendanceSummaryData(r.data);
        else setAttendanceSummaryData(null);
      })
      .catch(() => setAttendanceSummaryData(null))
      .finally(() => setAttendanceSummaryLoading(false));
  }, [role]);

  useEffect(() => {
    if (!role) return;
    setIncomeExpenseLoading(true);
    DashboardAPI.GetIncomeExpenseSummary(selectedYear)
      .then((r: any) => { if (r?.data) setIncomeExpenseSummaryData(r.data); })
      .catch(console.error)
      .finally(() => setIncomeExpenseLoading(false));
  }, [selectedYear, role]);

  useEffect(() => {
    if (!role) return;
    setFeeSummaryLoading(true);
    DashboardAPI.GetFeeSummary(selectedYear)
      .then((r: any) => { if (r?.data) setFeeSummaryData(r.data); })
      .catch(console.error)
      .finally(() => setFeeSummaryLoading(false));
  }, [selectedYear, role]);

  useEffect(() => {
    if (!role) return;
    setIncomeSummaryLoading(true);
    DashboardAPI.GetIncomeSummary(selectedYear, selectedMonth === null ? undefined : selectedMonth)
      .then((r: any) => { if (r?.data) setIncomeSummaryData(r.data); })
      .catch(console.error)
      .finally(() => setIncomeSummaryLoading(false));
  }, [selectedYear, selectedMonth, role]);

  useEffect(() => {
    if (!role) return;
    setExpenseSummaryLoading(true);
    DashboardAPI.GetExpenseSummary(selectedYear, selectedExpenseMonth === null ? undefined : selectedExpenseMonth)
      .then((r: any) => { if (r?.data) setExpenseSummaryData(r.data); })
      .catch(console.error)
      .finally(() => setExpenseSummaryLoading(false));
  }, [selectedYear, selectedExpenseMonth, role]);

  // ─── Chart Data Transforms ─────────────────────────────────────────────────

  const transformedPieData =
    userRolesData?.graph.labels.map((label, i) => ({
      name: label,
      value: userRolesData.graph.datasets[0].data[i],
      color: userRolesData.graph.datasets[0].backgroundColor[i],
    })) || [];

  const transformedBarData =
    studentSummaryData?.graph.labels.map((label, i) => ({
      name: label,
      value: studentSummaryData.graph.datasets[0].data[i],
      color: studentSummaryData.graph.datasets[0].backgroundColor[i] || "#6366f1",
    })) || [];

  // ─── Year Selector ─────────────────────────────────────────────────────────

  const YearSelector = ({ id }: { id: string }) => (
    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
      <label htmlFor={id} className={FILTER_LABEL_CLASS}>Year</label>
      <select
        id={id}
        value={selectedYear}
        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
        className={FILTER_SELECT_CLASS}
      >
        {Array.from({ length: 7 }, (_, i) => currentYear - 4 + i).map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </div>
  );

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">
      <Header value="Dashboard" subtitle="Overview & Analytics" />

      <main className="px-4 py-6 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto">
        <div className="space-y-6">

          {/* ── 1. Student Attendance Summary ─────────────────────────────── */}
          <SectionCard delay={0}>
            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 pt-5 pb-4 border-b border-slate-100">
              <div>
                <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-0.5">Attendance</p>
                <h2 className={SECTION_TITLE_CLASS}>
                  {studentSummaryData?.graph.title || "Student Attendance Summary"}
                </h2>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl shrink-0">
                <label htmlFor="date-select" className={FILTER_LABEL_CLASS}>Date</label>
                <input
                  id="date-select"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className={FILTER_INPUT_CLASS}
                />
              </div>
            </div>

            {/* Stat Badges */}
            <div className="px-5 pt-5 pb-4">
              {studentSummaryLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-xl" />
                  ))}
                </div>
              ) : studentSummaryData ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
                  <StatBadge
                    icon={icons.users}
                    label="Total Students"
                    value={studentSummaryData.summary.total_students}
                    colorClass="from-indigo-500 to-blue-600"
                    bgClass="bg-indigo-50"
                    textClass="text-indigo-700"
                  />
                  <StatBadge
                    icon={icons.check}
                    label="Present"
                    value={studentSummaryData.summary.present}
                    colorClass="from-emerald-500 to-green-600"
                    bgClass="bg-emerald-50"
                    textClass="text-emerald-700"
                  />
                  <StatBadge
                    icon={icons.x}
                    label="Absent"
                    value={studentSummaryData.summary.absent}
                    colorClass="from-rose-500 to-red-600"
                    bgClass="bg-rose-50"
                    textClass="text-rose-700"
                  />
                  <StatBadge
                    icon={icons.clock}
                    label="Late"
                    value={studentSummaryData.summary.late}
                    colorClass="from-amber-500 to-yellow-600"
                    bgClass="bg-amber-50"
                    textClass="text-amber-700"
                  />
                  <StatBadge
                    icon={icons.calendar}
                    label="On Leave"
                    value={studentSummaryData.summary.leave}
                    colorClass="from-orange-500 to-amber-600"
                    bgClass="bg-orange-50"
                    textClass="text-orange-700"
                  />
                </div>
              ) : null}

              {/* Chart */}
              <div className="h-64">
                {studentSummaryLoading ? (
                  <ChartSkeleton height="h-64" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={transformedBarData} barSize={36}>
                      <defs>
                        {transformedBarData.map((entry, i) => (
                          <linearGradient key={`g-${i}`} id={`aGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={entry.color} stopOpacity={0.9} />
                            <stop offset="100%" stopColor={entry.color} stopOpacity={0.5} />
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="value" name="Count" radius={[6, 6, 0, 0]}>
                        {transformedBarData.map((_, i) => (
                          <Cell key={`c-${i}`} fill={`url(#aGrad${i})`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </SectionCard>

          {/* ── 2. Two-column: User Roles + Fee Collection ─────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* User Roles Pie */}
            {role !== "PRINCIPAL" && role !== "ACCOUNTANT" && (
              <SectionCard delay={0.08}>
                <div className="px-5 pt-5 pb-4 border-b border-slate-100">
                  <p className="text-xs font-semibold text-purple-500 uppercase tracking-widest mb-0.5">Team</p>
                  <h2 className={SECTION_TITLE_CLASS}>
                    {userRolesData?.graph.title || "User Roles Overview"}
                  </h2>
                </div>
                <div className="p-5 h-72">
                  {loading ? (
                    <ChartSkeleton height="h-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <defs>
                          {transformedPieData.map((entry, i) => (
                            <linearGradient key={`pg-${i}`} id={`pgGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                              <stop offset="100%" stopColor={entry.color} stopOpacity={0.7} />
                            </linearGradient>
                          ))}
                        </defs>
                        <Pie
                          data={transformedPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                          animationBegin={0}
                          animationDuration={1200}
                        >
                          {transformedPieData.map((_, i) => (
                            <Cell key={`pc-${i}`} fill={`url(#pgGrad${i})`} stroke="transparent" />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </SectionCard>
            )}

            {/* Fee Collection Trends */}
            <SectionCard delay={0.12}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 pt-5 pb-4 border-b border-slate-100">
                <div>
                  <p className="text-xs font-semibold text-blue-500 uppercase tracking-widest mb-0.5">Finance</p>
                  <h2 className={SECTION_TITLE_CLASS}>
                    {feeSummaryData?.graph.title || "Fee Collection Trends"}
                  </h2>
                </div>
                <YearSelector id="fee-year-select" />
              </div>

              <div className="px-5 py-4 space-y-4">
                {/* KPI chip */}
                {!feeSummaryLoading && feeSummaryData && (
                  <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center text-white shrink-0">
                      {icons.currency}
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Total Fee Collection</p>
                      <p className="text-lg font-bold text-blue-700">
                        Rs.{feeSummaryData.total.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                <div className="h-52">
                  {feeSummaryLoading ? (
                    <ChartSkeleton height="h-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={
                          feeSummaryData?.graph.labels.map((month, i) => ({
                            name: month,
                            amount: feeSummaryData.graph.datasets[0].data[i],
                          })) || []
                        }
                        margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                      >
                        <defs>
                          <linearGradient id="feeGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                        <Area type="monotone" dataKey="amount" stroke="none" fillOpacity={1} fill="url(#feeGrad)" />
                        <Line
                          type="monotone"
                          dataKey="amount"
                          name={feeSummaryData?.graph.datasets[0].label || "Fee Collection"}
                          stroke="#6366f1"
                          strokeWidth={2.5}
                          activeDot={{ r: 6, strokeWidth: 0, fill: "#4f46e5" }}
                          dot={{ r: 3.5, strokeWidth: 2, fill: "#fff", stroke: "#6366f1" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </SectionCard>
          </div>

          {/* ── 3. Class Attendance Summary ───────────────────────────────── */}
          <SectionCard delay={0.16}>
            <div className="px-5 pt-5 pb-4 border-b border-slate-100">
              <p className="text-xs font-semibold text-teal-500 uppercase tracking-widest mb-0.5">By Class</p>
              <h2 className={SECTION_TITLE_CLASS}>
                {attendanceSummaryData?.graph.title || "Class Attendance Summary"}
              </h2>
            </div>

            <div className="p-5 space-y-5">
              <div className="h-72">
                {attendanceSummaryLoading ? (
                  <ChartSkeleton height="h-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={
                        attendanceSummaryData?.graph.labels.map((label, i) => {
                          const pt: { name: string;[k: string]: string | number } = { name: label };
                          attendanceSummaryData.graph.datasets.forEach((ds) => {
                            pt[ds.label] = ds.data[i];
                          });
                          return pt;
                        }) || []
                      }
                      margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
                      barSize={14}
                    >
                      <defs>
                        {attendanceSummaryData?.graph.datasets.map((ds, i) => (
                          <linearGradient key={`ag-${i}`} id={`attGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={ds.backgroundColor} stopOpacity={0.9} />
                            <stop offset="100%" stopColor={ds.backgroundColor} stopOpacity={0.5} />
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                      {attendanceSummaryData?.graph.datasets.map((ds, i) => (
                        <Bar key={ds.label} dataKey={ds.label} stackId="a" fill={`url(#attGrad${i})`} radius={i === (attendanceSummaryData?.graph.datasets.length - 1) ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Attendance Table */}
              {!attendanceSummaryLoading && attendanceSummaryData && (
                <div className="overflow-x-auto rounded-xl border border-slate-100">
                  <table className="min-w-full divide-y divide-slate-100 text-sm">
                    <thead>
                      <tr className="bg-slate-50">
                        {["Class", "Present", "Absent", "Late", "Leave"].map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 bg-white">
                      {attendanceSummaryData.summary && attendanceSummaryData.summary.length > 0 ? (
                        attendanceSummaryData.summary.map((item, i) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 font-semibold text-slate-700 whitespace-nowrap">{item.class_name}</td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                                {getAttVal(item.attendance_values, "present")}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">
                                {getAttVal(item.attendance_values, "absent")}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                                {getAttVal(item.attendance_values, "late")}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                                {getAttVal(item.attendance_values, "leave")}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-slate-400 text-sm">
                            No attendance data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </SectionCard>

          {/* ── 4. Financial Summary ──────────────────────────────────────── */}
          {role !== "PRINCIPAL" && (
            <SectionCard delay={0.2}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 pt-5 pb-4 border-b border-slate-100">
                <div>
                  <p className="text-xs font-semibold text-green-500 uppercase tracking-widest mb-0.5">Financials</p>
                  <h2 className={SECTION_TITLE_CLASS}>
                    {incomeExpenseSummaryData?.graph.title || "Financial Summary"}
                  </h2>
                </div>
                <YearSelector id="year-select" />
              </div>

              <div className="p-5 space-y-5">
                {/* KPI Row */}
                {!incomeExpenseLoading && incomeExpenseSummaryData && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FinancialKPI
                      icon={<span className="text-white">{icons.trendUp}</span>}
                      label="Total Income"
                      value={`Rs.${incomeExpenseSummaryData.totals.income.toLocaleString()}`}
                      iconBg="bg-emerald-500"
                      valueCls="text-emerald-700"
                      border="border-emerald-100"
                    />
                    <FinancialKPI
                      icon={<span className="text-white">{icons.creditCard}</span>}
                      label="Total Expense"
                      value={`Rs.${incomeExpenseSummaryData.totals.expense.toLocaleString()}`}
                      iconBg="bg-rose-500"
                      valueCls="text-rose-700"
                      border="border-rose-100"
                    />
                    <FinancialKPI
                      icon={
                        <span className="text-white">
                          {incomeExpenseSummaryData.totals.profit >= 0 ? icons.trendUp : icons.trendDown}
                        </span>
                      }
                      label="Net Profit / Loss"
                      value={`Rs.${incomeExpenseSummaryData.totals.profit.toLocaleString()}`}
                      iconBg={incomeExpenseSummaryData.totals.profit >= 0 ? "bg-indigo-500" : "bg-rose-500"}
                      valueCls={incomeExpenseSummaryData.totals.profit >= 0 ? "text-indigo-700" : "text-rose-700"}
                      border={incomeExpenseSummaryData.totals.profit >= 0 ? "border-indigo-100" : "border-rose-100"}
                    />
                  </div>
                )}

                <div className="h-80">
                  {incomeExpenseLoading ? (
                    <ChartSkeleton height="h-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={
                          incomeExpenseSummaryData?.graph.labels.map((month, i) => ({
                            name: month,
                            Income: incomeExpenseSummaryData.graph.datasets[0].data[i],
                            Expense: incomeExpenseSummaryData.graph.datasets[1].data[i],
                            Profit: incomeExpenseSummaryData.graph.datasets[2].data[i],
                          })) || []
                        }
                        margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
                        barSize={14}
                        barGap={4}
                      >
                        <defs>
                          <linearGradient id="incG" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#10b981" stopOpacity={0.4} />
                          </linearGradient>
                          <linearGradient id="expG" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.4} />
                          </linearGradient>
                          <linearGradient id="proG" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity={0.4} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                        <Bar dataKey="Income" fill="url(#incG)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Expense" fill="url(#expG)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Profit" fill="url(#proG)" radius={[4, 4, 0, 0]}
                          {...(Array.isArray(incomeExpenseSummaryData?.graph.datasets[2].backgroundColor) && {
                            fill: undefined,
                            children: incomeExpenseSummaryData?.graph.labels.map((_, i) => (
                              <Cell
                                key={`p-${i}`}
                                fill={
                                  Array.isArray(incomeExpenseSummaryData?.graph.datasets[2].backgroundColor)
                                    ? (incomeExpenseSummaryData?.graph.datasets[2].backgroundColor as string[])[i]
                                    : "#6366f1"
                                }
                              />
                            )),
                          })}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </SectionCard>
          )}

          {/* ── 5. Income & Expense Category Details (side by side on lg) ── */}
          {role !== "PRINCIPAL" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Income */}
              <SectionCard delay={0.24}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 pt-5 pb-4 border-b border-slate-100">
                  <div>
                    <p className="text-xs font-semibold text-emerald-500 uppercase tracking-widest mb-0.5">Income</p>
                    <h2 className={SECTION_TITLE_CLASS}>
                      {incomeSummaryData?.graph.title || "Income Category Details"}
                    </h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                      <label htmlFor="income-year-select" className={FILTER_LABEL_CLASS}>Year</label>
                      <select id="income-year-select" value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className={FILTER_SELECT_CLASS}>
                        {Array.from({ length: 7 }, (_, i) => currentYear - 4 + i).map((y) => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                      <label htmlFor="income-month-select" className={FILTER_LABEL_CLASS}>Month</label>
                      <select id="income-month-select" value={selectedMonth === null ? 0 : selectedMonth} onChange={(e) => { const v = parseInt(e.target.value); setSelectedMonth(v === 0 ? null : v); }} className={FILTER_SELECT_CLASS}>
                        {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="px-5 py-4 space-y-4">
                  {!incomeSummaryLoading && incomeSummaryData && (
                    <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center text-white shrink-0">{icons.currency}</div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">
                          Total Income {selectedMonth ? `for ${monthNames[selectedMonth]}` : ""} {selectedYear}
                        </p>
                        <p className="text-lg font-bold text-emerald-700">Rs.{incomeSummaryData.total.toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                  <div className="h-56">
                    {incomeSummaryLoading ? <ChartSkeleton height="h-full" /> : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={incomeSummaryData?.graph.labels.map((cat, i) => ({ name: cat, amount: incomeSummaryData.graph.datasets[0].data[i] })) || []} margin={{ top: 5, right: 10, left: 0, bottom: 5 }} barSize={32}>
                          <defs>
                            <linearGradient id="incAmtG" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                              <stop offset="100%" stopColor="#10b981" stopOpacity={0.4} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                          <Bar dataKey="amount" name={incomeSummaryData?.graph.datasets[0].label || "Income"} fill="url(#incAmtG)" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </SectionCard>

              {/* Expense */}
              <SectionCard delay={0.28}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 pt-5 pb-4 border-b border-slate-100">
                  <div>
                    <p className="text-xs font-semibold text-rose-500 uppercase tracking-widest mb-0.5">Expenses</p>
                    <h2 className={SECTION_TITLE_CLASS}>
                      {expenseSummaryData?.graph.title || "Expense Category Details"}
                    </h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                      <label htmlFor="expense-year-select" className={FILTER_LABEL_CLASS}>Year</label>
                      <select id="expense-year-select" value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className={FILTER_SELECT_CLASS}>
                        {Array.from({ length: 7 }, (_, i) => currentYear - 4 + i).map((y) => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                      <label htmlFor="expense-month-select" className={FILTER_LABEL_CLASS}>Month</label>
                      <select id="expense-month-select" value={selectedExpenseMonth === null ? 0 : selectedExpenseMonth} onChange={(e) => { const v = parseInt(e.target.value); setSelectedExpenseMonth(v === 0 ? null : v); }} className={FILTER_SELECT_CLASS}>
                        {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="px-5 py-4 space-y-4">
                  {!expenseSummaryLoading && expenseSummaryData && (
                    <div className="flex items-center gap-3 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
                      <div className="w-9 h-9 rounded-lg bg-rose-500 flex items-center justify-center text-white shrink-0">{icons.creditCard}</div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">
                          Total Expenses {selectedExpenseMonth ? `for ${monthNames[selectedExpenseMonth]}` : ""} {selectedYear}
                        </p>
                        <p className="text-lg font-bold text-rose-700">Rs.{expenseSummaryData.total.toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                  <div className="h-56">
                    {expenseSummaryLoading ? <ChartSkeleton height="h-full" /> : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={expenseSummaryData?.graph.labels.map((cat, i) => ({ name: cat, amount: expenseSummaryData.graph.datasets[0].data[i] })) || []} margin={{ top: 5, right: 10, left: 0, bottom: 5 }} barSize={32}>
                          <defs>
                            <linearGradient id="expAmtG" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.9} />
                              <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.4} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                          <Bar dataKey="amount" name={expenseSummaryData?.graph.datasets[0].label || "Expense"} fill="url(#expAmtG)" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </SectionCard>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
