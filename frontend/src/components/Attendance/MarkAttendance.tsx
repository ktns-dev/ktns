"use client";
import { AxiosResponse } from "axios";
import { MarkAttInput } from "@/models/markattendace/markattendance";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ClassNameAPI as API } from "@/api/Classname/ClassNameAPI";
import { AttendanceTimeAPI as API1 } from "@/api/AttendaceTime/attendanceTimeAPI";
import { TeacherNameAPI as API2 } from "@/api/Teacher/TeachetAPI";
import { StudentAPI as API3 } from "@/api/Student/StudentsAPI";
import { Select, SelectOption as SelectComponentOption } from "../Select";
import { Checkbox } from "@/components/ui/checkbox";
import { AttendanceAPI } from "@/api/Attendance/AttendanceAPI";
import { toast } from "sonner";
import { Loader2, Users, CalendarCheck, RefreshCw, CheckCircle2, XCircle, Clock, LogOut } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type AttendanceStatus = "present" | "absent" | "late" | "leave" | "";

type AttendanceRow = {
  id: number;
  name: string;
  status: AttendanceStatus;
};

interface ClassNameResponse   { class_name_id: number; class_name: string; }
interface AttendanceTimeResponse { attendance_time_id: number; attendance_time: string; }
interface TeacherResponse    { teacher_name_id: number; teacher_name: string; }
interface StudentResponse    { student_id: number; student_name: string; }

interface BulkAttendanceResponse {
  saved: { student_id: number; status: string }[];
  skipped: { student_id: number; reason: string }[];
  summary: { total: number; saved: number; skipped: number };
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  "present" | "absent" | "late" | "leave",
  { label: string; icon: React.ReactNode; ring: string; bg: string; text: string; value: string }
> = {
  present: { label: "Present", icon: <CheckCircle2 className="w-3.5 h-3.5" />, ring: "ring-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400", value: "1" },
  absent:  { label: "Absent",  icon: <XCircle       className="w-3.5 h-3.5" />, ring: "ring-rose-400",    bg: "bg-rose-50 dark:bg-rose-900/30",       text: "text-rose-700 dark:text-rose-400",       value: "2" },
  late:    { label: "Late",    icon: <Clock         className="w-3.5 h-3.5" />, ring: "ring-amber-400",   bg: "bg-amber-50 dark:bg-amber-900/30",     text: "text-amber-700 dark:text-amber-400",     value: "3" },
  leave:   { label: "Leave",   icon: <LogOut        className="w-3.5 h-3.5" />, ring: "ring-blue-400",    bg: "bg-blue-50 dark:bg-blue-900/30",        text: "text-blue-700 dark:text-blue-400",       value: "4" },
};

// ─── Shared input styles ──────────────────────────────────────────────────────

const selectCls =
  "h-10 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-3 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 hover:border-slate-300 dark:hover:border-slate-600 transition-colors";

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
    {children}
  </p>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const MarkAttendance = () => {
  const [classNameList, setClassNameList]   = useState<SelectComponentOption[]>([]);
  const [classTimeList, setClassTimeList]   = useState<SelectComponentOption[]>([]);
  const [teacherNameList, setTeacherNameList] = useState<SelectComponentOption[]>([]);
  const [rows, setRows]   = useState<AttendanceRow[]>([]);
  const [isLoading, setIsLoading]     = useState(false);
  const [isFetching, setIsFetching]   = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [markAll, setMarkAll] = useState<AttendanceStatus>("");

  const { register, handleSubmit, formState: { errors } } = useForm<MarkAttInput>();

  useEffect(() => {
    setIsLoading(true);
    Promise.all([GetClassName(), GetClassTime(), GetTeacherName()]).finally(() =>
      setIsLoading(false)
    );
  }, []);

  const GetClassName = async () => {
    try {
      const response = (await API.Get()) as { data: ClassNameResponse[] };
      if (response.data) setClassNameList(response.data.map(i => ({ id: i.class_name_id, title: i.class_name })));
    } catch (e) { console.error(e); }
  };

  const GetClassTime = async () => {
    try {
      const response = (await API1.Get()) as { data: AttendanceTimeResponse[] };
      if (response.data) setClassTimeList(response.data.map(i => ({ id: i.attendance_time_id, title: i.attendance_time })));
    } catch (e) { console.error(e); }
  };

  const GetTeacherName = async () => {
    try {
      const response = (await API2.Get()) as unknown as { data: TeacherResponse[] };
      if (response.data) setTeacherNameList(response.data.map(i => ({ id: i.teacher_name_id, title: i.teacher_name })));
    } catch (e) { console.error(e); }
  };

  const handleGetStudents = async (formData: MarkAttInput) => {
    setIsFetching(true);
    try {
      const response = (await API3.GetStudentbyFilter(formData.class_name_id)) as { data: StudentResponse[] };
      if (response.data) {
        setRows(response.data.map(s => ({ id: s.student_id, name: s.student_name, status: "" })));
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load students");
    } finally {
      setIsFetching(false);
    }
  };

  const setStudentStatus = (idx: number, status: AttendanceStatus) => {
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, status: r.status === status ? "" : status } : r));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const newStatus = markAll === status ? "" : status;
    setMarkAll(newStatus);
    setRows(prev => prev.map(r => ({ ...r, status: newStatus })));
  };

  const onSubmit = async (formData: MarkAttInput) => {
    const unmarked = rows.filter(r => !r.status);
    if (unmarked.length > 0) {
      toast.error(`${unmarked.length} student(s) have no attendance status set.`, { position: "bottom-center" });
      return;
    }

    setIsSubmitting(true);
    const attendances = rows.map(student => ({
      attendance_date: formData.attendance_date,
      attendance_time_id: String(formData.attendance_time_id),
      class_name_id: String(formData.class_name_id),
      teacher_name_id: String(formData.teacher_name_id),
      student_id: String(student.id),
      attendance_value_id: STATUS_CONFIG[student.status as keyof typeof STATUS_CONFIG]?.value || "1",
    }));

    try {
      const response = (await AttendanceAPI.Create({ ...formData, attendances })) as unknown as AxiosResponse<BulkAttendanceResponse>;
      if (response.status === 200 || response.status === 201) {
        const { summary } = response.data;
        toast.success(`✓ Saved ${summary.saved} · Skipped ${summary.skipped}`, { position: "bottom-center", duration: 5000 });
        setRows(prev => prev.map(r => ({ ...r, status: "" })));
        setMarkAll("");
      }
    } catch (e: any) {
      toast.error("Failed to submit attendance", { position: "bottom-center" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stats
  const presentCount = rows.filter(r => r.status === "present").length;
  const absentCount  = rows.filter(r => r.status === "absent").length;
  const lateCount    = rows.filter(r => r.status === "late").length;
  const leaveCount   = rows.filter(r => r.status === "leave").length;
  const unmarkedCount = rows.filter(r => !r.status).length;

  return (
    <div className="w-full space-y-5">

      {/* ── Filter Card ──────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-0.5">Step 1</p>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Select Session Details</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            {/* Date */}
            <div>
              <FieldLabel>Date <span className="text-rose-500">*</span></FieldLabel>
              <input
                type="date"
                className={selectCls}
                {...register("attendance_date", { required: "Date is required" })}
              />
              {errors.attendance_date && <p className="text-rose-500 text-xs mt-1">{errors.attendance_date.message}</p>}
            </div>

            {/* Class Time */}
            <div>
              <FieldLabel>Class Time <span className="text-rose-500">*</span></FieldLabel>
              <Select
                options={classTimeList}
                {...register("attendance_time_id", { required: "Time is required" })}
                DisplayItem="title"
                className={selectCls}
              />
              {errors.attendance_time_id && <p className="text-rose-500 text-xs mt-1">{errors.attendance_time_id.message}</p>}
            </div>

            {/* Class Name */}
            <div>
              <FieldLabel>Class Name <span className="text-rose-500">*</span></FieldLabel>
              <Select
                options={classNameList}
                {...register("class_name_id", { required: "Class is required" })}
                DisplayItem="title"
                className={selectCls}
              />
              {errors.class_name_id && <p className="text-rose-500 text-xs mt-1">{errors.class_name_id.message}</p>}
            </div>

            {/* Teacher */}
            <div>
              <FieldLabel>Teacher <span className="text-rose-500">*</span></FieldLabel>
              <Select
                options={teacherNameList}
                {...register("teacher_name_id", { required: "Teacher is required" })}
                DisplayItem="title"
                className={selectCls}
              />
              {errors.teacher_name_id && <p className="text-rose-500 text-xs mt-1">{errors.teacher_name_id.message}</p>}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => handleSubmit(handleGetStudents)()}
              disabled={isFetching || isLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
              {isFetching ? "Loading…" : "Load Students"}
            </button>

            {rows.length > 0 && (
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarCheck className="w-4 h-4" />}
                {isSubmitting ? "Submitting…" : "Submit Attendance"}
              </button>
            )}

            {rows.length > 0 && (
              <button
                type="button"
                onClick={() => { setRows([]); setMarkAll(""); }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ── Students Table ────────────────────────────────────────────────── */}
      {(rows.length > 0 || isFetching) && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">

          {/* Table header */}
          <div className="px-5 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-0.5">Step 2</p>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Mark Attendance <span className="text-slate-400 font-normal text-sm">({rows.length} students)</span>
              </h2>
            </div>

            {/* Stats chips */}
            {rows.length > 0 && (
              <div className="hidden sm:flex flex-wrap gap-2">
                {(["present", "absent", "late", "leave"] as const).map(s => (
                  <span key={s} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_CONFIG[s].bg} ${STATUS_CONFIG[s].text}`}>
                    {STATUS_CONFIG[s].icon}
                    {s === "present" ? presentCount : s === "absent" ? absentCount : s === "late" ? lateCount : leaveCount}
                    <span className="capitalize">{s}</span>
                  </span>
                ))}
                {unmarkedCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    {unmarkedCount} Unmarked
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Mark All bar */}
          {rows.length > 0 && (
            <div className="hidden sm:flex px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mr-1">Mark All:</span>
              {(["present", "absent", "late", "leave"] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleMarkAll(s)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    markAll === s
                      ? `${STATUS_CONFIG[s].bg} ${STATUS_CONFIG[s].text} border-current ring-1 ${STATUS_CONFIG[s].ring}`
                      : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  {STATUS_CONFIG[s].icon}
                  All {STATUS_CONFIG[s].label}
                </button>
              ))}
            </div>
          )}

          {/* Loading state */}
          {isFetching ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <p className="text-slate-400 text-sm">Loading students…</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-slate-800 dark:bg-slate-950 text-slate-100">
                      <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider w-12">#</th>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Student Name</th>
                      {(["present", "absent", "late", "leave"] as const).map(s => (
                        <th key={s} className="px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wider">
                          <span className={`inline-flex items-center gap-1 ${STATUS_CONFIG[s].text.replace("dark:", "")}`}>
                            {STATUS_CONFIG[s].icon}
                            {STATUS_CONFIG[s].label}
                          </span>
                        </th>
                      ))}
                      <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {rows.map((row, idx) => (
                      <tr
                        key={row.id}
                        className={`transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                          row.status ? STATUS_CONFIG[row.status as keyof typeof STATUS_CONFIG]?.bg + " dark:bg-opacity-10" : ""
                        }`}
                      >
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-medium">{idx + 1}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-100">{row.name}</td>
                        {(["present", "absent", "late", "leave"] as const).map(s => (
                          <td key={s} className="px-4 py-3 text-center">
                            <Checkbox
                              checked={row.status === s}
                              onCheckedChange={() => setStudentStatus(idx, s)}
                              className={`mx-auto ${row.status === s ? "border-current" : ""}`}
                            />
                          </td>
                        ))}
                        <td className="px-4 py-3">
                          {row.status ? (
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_CONFIG[row.status as keyof typeof STATUS_CONFIG].bg} ${STATUS_CONFIG[row.status as keyof typeof STATUS_CONFIG].text}`}>
                              {STATUS_CONFIG[row.status as keyof typeof STATUS_CONFIG].icon}
                              {STATUS_CONFIG[row.status as keyof typeof STATUS_CONFIG].label}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Not set</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile card view */}
              <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
                {rows.map((row, idx) => (
                  <div key={row.id} className="p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-slate-400 font-medium">#{idx + 1}</p>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{row.name}</p>
                      </div>
                      {row.status && (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_CONFIG[row.status as keyof typeof STATUS_CONFIG].bg} ${STATUS_CONFIG[row.status as keyof typeof STATUS_CONFIG].text}`}>
                          {STATUS_CONFIG[row.status as keyof typeof STATUS_CONFIG].icon}
                          {STATUS_CONFIG[row.status as keyof typeof STATUS_CONFIG].label}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {(["present", "absent", "late", "leave"] as const).map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setStudentStatus(idx, s)}
                          className={`flex flex-col items-center gap-1 py-2 rounded-xl border text-xs font-semibold transition-all ${
                            row.status === s
                              ? `${STATUS_CONFIG[s].bg} ${STATUS_CONFIG[s].text} border-current ring-1 ${STATUS_CONFIG[s].ring}`
                              : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          <span className="text-base">{s === "present" ? "✓" : s === "absent" ? "✗" : s === "late" ? "⏰" : "📤"}</span>
                          <span className="capitalize text-[10px]">{s}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MarkAttendance;
