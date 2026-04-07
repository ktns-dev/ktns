"use client";
import type React from "react";
import { useState, useEffect } from "react";
import {
  AlertCircle, Check, CheckCircle2, XCircle, Clock, LogOut,
  ChevronLeft, ChevronRight, Printer, Search, SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectOption as SelectComponentOption } from "../Select";
import { useForm } from "react-hook-form";
import { AttendanceAPI as API } from "@/api/Attendance/AttendanceAPI";
import { ClassNameAPI as API2 } from "@/api/Classname/ClassNameAPI";
import { AttendanceTimeAPI as API13 } from "@/api/AttendaceTime/attendanceTimeAPI";
import { TeacherNameAPI as API4 } from "@/api/Teacher/TeachetAPI";
import { StudentAPI as API5 } from "@/api/Student/StudentsAPI";
import { usePrint } from "@/components/print/usePrint";
import { toast } from "sonner";
import { ChevronsUpDown } from "lucide-react";
import { cn } from "@/libs/utils";
import EditAttendance from "./EditAttendance";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  flexRender, getCoreRowModel, getPaginationRowModel, useReactTable, type ColumnDef,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import DelConfirmMsg from "../DelConfMsg";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AttendanceRecord {
  attendance_id: number;
  attendance_date: string;
  attendance_time: string;
  attendance_class: string;
  attendance_teacher: string;
  attendance_student: string;
  attendance_std_fname: string;
  attendance_value: string;
}

interface FilteredAttendance {
  attendance_date: string;
  attendance_time_id: number;
  class_name_id: number;
  teacher_name_id: number;
  student_id: number;
  father_name: string;
  attendance_value_id: number;
}

interface ClassNameResponse      { class_name_id: number; class_name: string; }
interface AttendanceTimeResponse { attendance_time_id: number; attendance_time: string; }
interface TeacherResponse        { teacher_name_id: number; teacher_name: string; }
interface StudentResponse        { student_id: number; student_name: string; }
interface APIError               { response: { data: { message: string } } }

// ─── Status badge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ value }: { value: string }) => {
  const v = value.toLowerCase();
  if (v === "present") return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
      <CheckCircle2 className="w-3 h-3" /> Present
    </span>
  );
  if (v === "absent") return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400">
      <XCircle className="w-3 h-3" /> Absent
    </span>
  );
  if (v === "late") return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
      <Clock className="w-3 h-3" /> Late
    </span>
  );
  if (v === "leave") return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
      <LogOut className="w-3 h-3" /> Leave
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
      <Clock className="w-3 h-3" /> {value}
    </span>
  );
};

const selectCls =
  "h-10 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-3 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 hover:border-slate-300 dark:hover:border-slate-600 transition-colors";

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">{children}</p>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const AttendanceTable: React.FC = () => {
  const { register, setValue: setFormValue, formState: { errors }, handleSubmit } = useForm<FilteredAttendance>();
  const { printRecords } = usePrint();
  const [isLoading, setIsLoading]   = useState(false);
  const [classTimeList, setClassTimeList]     = useState<SelectComponentOption[]>([]);
  const [classNameList, setClassNameList]     = useState<SelectComponentOption[]>([]);
  const [teacherNameList, setTeacherNameList] = useState<SelectComponentOption[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [currentPage, setCurrentPage]   = useState(1);
  const recordsPerPage = 15;
  const [formRefresh, setFormRefresh]   = useState(true);
  const [studentsList, setStudentsList] = useState<SelectComponentOption[]>([]);
  const [open, setOpen]   = useState(false);
  const [value, setValue] = useState("");

  const handleAttendanceUpdate = async () => {
    setFormRefresh(prev => !prev);
    await HandleSubmitForStudentGet({
      attendance_date: "", attendance_time_id: 0, class_name_id: 0,
      teacher_name_id: 0, student_id: Number(value) || 0, father_name: "", attendance_value_id: 0,
    });
  };

  const columns: ColumnDef<AttendanceRecord>[] = [
    {
      accessorKey: "sr_no", header: "Sr.No",
      cell: ({ row }) => <span className="font-semibold text-slate-500 dark:text-slate-400">{row.index + 1}</span>,
    },
    {
      accessorKey: "attendance_id", header: "ID",
      cell: ({ row }) => <span className="font-mono text-xs text-slate-500 dark:text-slate-400">#{String(row.getValue("attendance_id")).padStart(4, "0")}</span>,
    },
    {
      accessorKey: "attendance_date", header: "Date",
      cell: ({ row }) => (
        <span className="text-slate-700 dark:text-slate-300">
          {new Date(row.getValue("attendance_date") as string).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
        </span>
      ),
    },
    { accessorKey: "attendance_time",    header: "Time",    cell: ({ row }) => <span className="text-slate-600 dark:text-slate-300">{row.getValue("attendance_time")}</span> },
    { accessorKey: "attendance_class",   header: "Class",   cell: ({ row }) => <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-100 dark:border-indigo-800">{row.getValue("attendance_class")}</span> },
    { accessorKey: "attendance_teacher", header: "Teacher", cell: ({ row }) => <span className="text-slate-700 dark:text-slate-300">{row.getValue("attendance_teacher")}</span> },
    { accessorKey: "attendance_student", header: "Student", cell: ({ row }) => <span className="font-semibold text-slate-800 dark:text-slate-100">{row.getValue("attendance_student")}</span> },
    { accessorKey: "attendance_std_fname", header: "Father", cell: ({ row }) => <span className="text-slate-600 dark:text-slate-300">{row.getValue("attendance_std_fname")}</span> },
    {
      accessorKey: "attendance_value", header: "Status",
      cell: ({ row }) => <StatusBadge value={row.getValue("attendance_value") as string} />,
    },
    {
      id: "actions", header: "Actions",
      cell: ({ row }) => (
        <div className="no-print flex items-center gap-2">
          <EditAttendance attendanceId={row.original.attendance_id} onUpdate={handleAttendanceUpdate} />
          <DelConfirmMsg
            rowId={row.original.attendance_id}
            OnDelete={(confirmed) => { if (confirmed) handleDeleteAttendance(row.original.attendance_id); }}
          />
        </div>
      ),
    },
  ];

  useEffect(() => {
    GetClassName(); GetClassTime(); GetTeacherName(); GetStudents();
  }, [formRefresh]);

  const handleDeleteAttendance = async (attendanceId: number) => {
    try {
      const response = await API.Delete(attendanceId);
      if (response.status === 200) {
        toast.success("Attendance deleted", { position: "bottom-center" });
        handleAttendanceUpdate();
      }
    } catch { toast.error("Failed to delete"); }
  };

  const GetStudents = async () => {
    try {
      const response = (await API5.Get()) as { data: StudentResponse[] };
      setStudentsList([
        { id: 0, title: "All Students" },
        ...response.data.map(s => ({ id: s.student_id, title: s.student_name })),
      ]);
    } catch (e) { console.error(e); }
  };

  const GetClassName = async () => {
    try {
      const response = (await API2.Get()) as { data: ClassNameResponse[] };
      setClassNameList([
        { id: 0, title: "All" },
        ...response.data.map(i => ({ id: i.class_name_id, title: i.class_name })),
      ]);
    } catch (e) { console.error(e); }
  };

  const GetClassTime = async () => {
    try {
      const response = (await API13.Get()) as { data: AttendanceTimeResponse[] };
      setClassTimeList([
        { id: 0, title: "All" },
        ...response.data.map(i => ({ id: i.attendance_time_id, title: i.attendance_time })),
      ]);
    } catch (e) { console.error(e); }
  };

  const GetTeacherName = async () => {
    try {
      const response = (await API4.Get()) as unknown as { data: TeacherResponse[] };
      setTeacherNameList([
        { id: 0, title: "All" },
        ...response.data.map(i => ({ id: i.teacher_name_id, title: i.teacher_name })),
      ]);
    } catch (e) { console.error(e); }
  };

  const HandleSubmitForStudentGet = async (formData: FilteredAttendance) => {
    setAttendanceRecords([]);
    setIsLoading(true);
    try {
      const filter: FilteredAttendance = {
        attendance_date: formData.attendance_date || "",
        attendance_time_id: Number(formData.attendance_time_id) || 0,
        class_name_id: Number(formData.class_name_id) || 0,
        teacher_name_id: Number(formData.teacher_name_id) || 0,
        student_id: Number(formData.student_id) || 0,
        father_name: formData.father_name || "",
        attendance_value_id: Number(formData.attendance_value_id) || 0,
      };
      const response = await API.GetbyFilter(filter);
      if (response.status === 200) {
        setAttendanceRecords(response.data as unknown as AttendanceRecord[]);
        setCurrentPage(1);
      }
    } catch (error: unknown) {
      if (error && typeof error === "object" && "response" in error) {
        toast.error((error as APIError).response?.data?.message || "No Records Found", { position: "bottom-center" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const table = useReactTable({
    data: attendanceRecords,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    pageCount: Math.ceil(attendanceRecords.length / recordsPerPage),
    state: { pagination: { pageIndex: currentPage - 1, pageSize: recordsPerPage } },
  });

  const totalPages = Math.ceil(attendanceRecords.length / recordsPerPage);

  // Summary counts
  const presentCount = attendanceRecords.filter(r => r.attendance_value.toLowerCase() === "present").length;
  const absentCount  = attendanceRecords.filter(r => r.attendance_value.toLowerCase() === "absent").length;
  const lateCount    = attendanceRecords.filter(r => r.attendance_value.toLowerCase() === "late").length;
  const leaveCount   = attendanceRecords.filter(r => r.attendance_value.toLowerCase() === "leave").length;

  return (
    <div className="w-full space-y-5">

      {/* ── Filter Card ──────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
            <SlidersHorizontal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-0.5">Filters</p>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Search Attendance Records</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit(data => HandleSubmitForStudentGet(data as FilteredAttendance))} className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-5">

            {/* Date */}
            <div>
              <FieldLabel>Date</FieldLabel>
              <input
                type="date"
                className={selectCls}
                {...register("attendance_date")}
              />
            </div>

            {/* Class Time */}
            <div>
              <FieldLabel>Class Time</FieldLabel>
              <Select
                options={classTimeList}
                {...register("attendance_time_id", { valueAsNumber: true })}
                DisplayItem="title"
                className={selectCls}
              />
            </div>

            {/* Class Name */}
            <div>
              <FieldLabel>Class Name</FieldLabel>
              <Select
                options={classNameList}
                {...register("class_name_id", { valueAsNumber: true })}
                DisplayItem="title"
                className={selectCls}
              />
            </div>

            {/* Teacher */}
            <div>
              <FieldLabel>Teacher</FieldLabel>
              <Select
                options={teacherNameList}
                {...register("teacher_name_id", { valueAsNumber: true })}
                DisplayItem="title"
                className={selectCls}
              />
            </div>

            {/* Student combobox */}
            <div>
              <FieldLabel>Student</FieldLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    role="combobox"
                    aria-expanded={open}
                    className={`${selectCls} flex items-center justify-between`}
                  >
                    <span className="truncate">
                      {value ? studentsList.find(s => s.id.toString() === value)?.title : "All Students"}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-0">
                  <Command>
                    <CommandInput placeholder="Search student…" className="h-9" />
                    <CommandList>
                      <CommandEmpty>No student found.</CommandEmpty>
                      <CommandGroup>
                        {studentsList.map(student => (
                          <CommandItem
                            key={student.id}
                            value={student.id.toString()}
                            onSelect={(currentValue: string) => {
                              setValue(currentValue === value ? "" : currentValue);
                              setOpen(false);
                              const sel = studentsList.find(s => s.id.toString() === currentValue);
                              if (sel) setFormValue("student_id", Number(sel.id));
                            }}
                          >
                            {student.title}
                            <Check className={cn("ml-auto h-4 w-4", value === student.id.toString() ? "opacity-100" : "opacity-0")} />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Search button */}
            <div className="flex items-end">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Searching…</>
                ) : (
                  <><Search className="w-4 h-4" /> Search Records</>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ── Summary KPI Row ────────────────────────────────────────────── */}
      {attendanceRecords.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Present", count: presentCount, icon: <CheckCircle2 className="w-5 h-5" />, bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-800" },
            { label: "Absent",  count: absentCount,  icon: <XCircle      className="w-5 h-5" />, bg: "bg-rose-50 dark:bg-rose-900/20",       text: "text-rose-700 dark:text-rose-400",       border: "border-rose-200 dark:border-rose-800" },
            { label: "Late",    count: lateCount,    icon: <Clock        className="w-5 h-5" />, bg: "bg-amber-50 dark:bg-amber-900/20",     text: "text-amber-700 dark:text-amber-400",     border: "border-amber-200 dark:border-amber-800" },
            { label: "Leave",   count: leaveCount,   icon: <LogOut       className="w-5 h-5" />, bg: "bg-blue-50 dark:bg-blue-900/20",       text: "text-blue-700 dark:text-blue-400",       border: "border-blue-200 dark:border-blue-800" },
          ].map(({ label, count, icon, bg, text, border }) => (
            <div key={label} className={`${bg} border ${border} rounded-2xl p-4 flex items-center gap-3`}>
              <div className={`${text} shrink-0`}>{icon}</div>
              <div>
                <p className={`text-2xl font-bold ${text}`}>{count}</p>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Table Card ────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">

        {/* Table header */}
        <div className="px-5 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-teal-500 uppercase tracking-widest mb-0.5">Records</p>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Attendance Data
              {attendanceRecords.length > 0 && (
                <span className="ml-2 text-sm font-normal text-slate-400">({attendanceRecords.length} records)</span>
              )}
            </h2>
          </div>
          {attendanceRecords.length > 0 && (
            <button
              onClick={() => {
                const meta = `Total records: ${attendanceRecords.length} · Printed: ${new Date().toLocaleDateString()}`;
                printRecords("attendance-print-area", "Attendance Report", meta);
              }}
              className="no-print inline-flex items-center gap-2 px-4 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          )}
        </div>

        {/* Table */}
        <div id="attendance-print-area" className="overflow-x-auto">
          <Table className="min-w-full whitespace-nowrap">
            <TableHeader>
              {table.getHeaderGroups().map(hg => (
                <TableRow key={hg.id} className="bg-slate-800 dark:bg-slate-950 hover:bg-slate-800 dark:hover:bg-slate-950">
                  {hg.headers.map(header => (
                    <TableHead
                      key={header.id}
                      className={`text-slate-100 text-xs font-semibold uppercase tracking-wider px-4 py-3.5 ${header.column.columnDef.id === "actions" ? "no-print" : ""}`}
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-slate-400 text-sm">Loading records…</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row, i) => (
                  <TableRow
                    key={row.id}
                    className={`transition-colors hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10 ${i % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50/50 dark:bg-slate-800/30"}`}
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell
                        key={cell.id}
                        className={`px-4 py-3 text-sm ${cell.column.columnDef.id === "actions" ? "no-print" : ""}`}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="py-16">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <AlertCircle className="w-7 h-7 text-slate-400" />
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 font-semibold">No attendance records found</p>
                      <p className="text-slate-400 dark:text-slate-500 text-sm">Use the filters above to search for records</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {attendanceRecords.length > 0 && (
          <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Showing{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {(currentPage - 1) * recordsPerPage + 1}–{Math.min(currentPage * recordsPerPage, attendanceRecords.length)}
              </span>{" "}
              of <span className="font-semibold text-slate-700 dark:text-slate-300">{attendanceRecords.length}</span> records
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0 rounded-lg border-slate-200 dark:border-slate-700"
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let page = i + 1;
                if (totalPages > 5) {
                  const start = Math.min(Math.max(currentPage - 2, 1), totalPages - 4);
                  page = start + i;
                }
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    className={`h-9 w-9 p-0 rounded-lg ${currentPage !== page ? "border-slate-200 dark:border-slate-700" : ""}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0 rounded-lg border-slate-200 dark:border-slate-700"
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceTable;
