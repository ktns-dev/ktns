"use client";
import React, { useState, useEffect } from "react";
import { Select } from "../Select";
import { useForm } from "react-hook-form";
import { StudentAPI as API1 } from "@/api/Student/StudentsAPI";
import { ClassNameAPI as API2 } from "@/api/Classname/ClassNameAPI";
import { FeeAPI as API3 } from "@/api/Fees/AddFeeAPI";
import { GetFeeModel } from "@/models/Fees/Fee";
import { toast } from "sonner";
import { usePrint } from "@/components/print/usePrint";
import {
  Printer, Check, ChevronsUpDown, Search, User, Filter, CreditCard, RotateCcw, Building2, Calendar, FileText
} from "lucide-react";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/libs/utils";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface ClassNameResponse { class_name_id: number; class_name: string; }
interface StudentResponse { student_id: number; student_name: string; }
interface FeeData {
  fee_id: number;
  student_name: string;
  father_name: string;
  class_name: string;
  fee_amount: number;
  fee_month: string;
  fee_year: number;
  fee_status: string;
}

const inputCls =
  "h-10 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-3 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 hover:border-slate-300 dark:hover:border-slate-600 transition-colors";

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5 block">
    {children}
  </label>
);

const ViewFees: React.FC = () => {
  const { register, handleSubmit, setValue: setFormValue, formState: { errors } } = useForm<GetFeeModel>();
  const { printRecords } = usePrint();
  const [studentsList, setStudentsList] = useState<{ id: number; title: string }[]>([]);
  const [classNameList, setClassNameList] = useState<{ id: number; title: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [feesData, setFeesData] = useState<FeeData[]>([]);

  useEffect(() => {
    GetStudents();
    GetClassName();
  }, []);

  const GetStudents = async () => {
    try {
      const response = (await API1.Get()) as { data: StudentResponse[] };
      setStudentsList([{ id: 0, title: "All" }, ...response.data.map(s => ({ id: s.student_id, title: s.student_name }))]);
    } catch (error) { console.error(error); }
  };

  const GetClassName = async () => {
    try {
      const response = (await API2.Get()) as { data: ClassNameResponse[] };
      if (response.data && Array.isArray(response.data)) {
        setClassNameList([{ id: 0, title: "All" }, ...response.data.map(i => ({ id: i.class_name_id, title: i.class_name }))]);
      }
    } catch (error) { console.error(error); }
  };

  const handleGetFees = async (data: GetFeeModel) => {
    setIsFetching(true);
    setFeesData([]);
    try {
      const response = await API3.Filter({
        student_id: data.student_id && data.student_id !== 0 ? data.student_id : undefined,
        class_id: data.class_id && Number(data.class_id) !== 0 ? Number(data.class_id) : undefined,
        fee_month: data.fee_month && data.fee_month !== "all" ? data.fee_month : undefined,
        fee_year: data.fee_year && data.fee_year !== "all" ? data.fee_year : undefined,
        fee_status: data.fee_status && data.fee_status !== "all" ? data.fee_status : undefined,
      });

      if (Array.isArray(response.data) && response.data.length === 0) {
        toast.error("No data found");
      } else if (Array.isArray(response.data)) {
        setFeesData(response.data as FeeData[]);
      }
    } catch (error) {
      toast.error("Failed to fetch fees", { position: "bottom-center" });
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="w-full space-y-5">
      {/* ── Filter Card ──────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mt-4">
        <div className="px-5 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
            <Filter className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-0.5">Filters</p>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Search Fees Details</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit(handleGetFees)} className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-5">
            {/* Student */}
            <div className="space-y-1">
              <FieldLabel>Student</FieldLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={`${inputCls} justify-between font-normal hover:bg-transparent`}
                  >
                    <span className="truncate">
                      {selectedStudent
                        ? studentsList.find(s => s.id.toString() === selectedStudent)?.title
                        : "All Students"}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                  <Command>
                    <CommandInput placeholder="Search student..." className="h-9" />
                    <CommandList>
                      <CommandEmpty>No student found.</CommandEmpty>
                      <CommandGroup>
                        {studentsList.map(student => (
                          <CommandItem
                            key={student.id}
                            value={student.id.toString()}
                            onSelect={(currentValue: string) => {
                              setSelectedStudent(currentValue === selectedStudent ? "" : currentValue);
                              setOpen(false);
                              setFormValue("student_id", currentValue ? parseInt(currentValue, 10) : 0);
                            }}
                          >
                            {student.title}
                            <Check className={cn("ml-auto h-4 w-4", selectedStudent === student.id.toString() ? "opacity-100" : "opacity-0")} />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Class Name */}
            <div className="space-y-1">
              <FieldLabel>Class Name</FieldLabel>
              <div className="h-10 text-slate-800 dark:text-slate-100">
                <Select label="" options={classNameList} {...register("class_id")} className={`${inputCls} py-0 m-0`} />
              </div>
            </div>

            {/* Fee Month */}
            <div className="space-y-1">
              <FieldLabel>Fee Month</FieldLabel>
              <div className="h-10 text-slate-800 dark:text-slate-100">
                <Select
                  label=""
                  options={[
                    { id: "all", title: "All" }, { id: "January", title: "January" }, { id: "February", title: "February" },
                    { id: "March", title: "March" }, { id: "April", title: "April" }, { id: "May", title: "May" },
                    { id: "June", title: "June" }, { id: "July", title: "July" }, { id: "August", title: "August" },
                    { id: "September", title: "September" }, { id: "October", title: "October" },
                    { id: "November", title: "November" }, { id: "December", title: "December" },
                  ]}
                  {...register("fee_month")}
                  className={`${inputCls} py-0 m-0`}
                />
              </div>
            </div>

            {/* Fee Year */}
            <div className="space-y-1">
              <FieldLabel>Fee Year</FieldLabel>
              <div className="h-10 text-slate-800 dark:text-slate-100">
                <Select
                  label=""
                  options={[
                    { id: "all", title: "All" }, { id: "2023", title: "2023" }, { id: "2024", title: "2024" },
                    { id: "2025", title: "2025" }, { id: "2026", title: "2026" },
                  ]}
                  {...register("fee_year")}
                  className={`${inputCls} py-0 m-0`}
                />
              </div>
            </div>

            {/* Fee Status */}
            <div className="space-y-1">
              <FieldLabel>Fee Status</FieldLabel>
              <div className="h-10 text-slate-800 dark:text-slate-100">
                <Select
                  label=""
                  options={[{ id: "all", title: "All" }, { id: "Paid", title: "Paid" }, { id: "Unpaid", title: "Unpaid" }]}
                  {...register("fee_status")}
                  className={`${inputCls} py-0 m-0`}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              disabled={isFetching}
              className="inline-flex items-center justify-center gap-2 px-6 h-10 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-50 w-full sm:w-auto"
            >
              {isFetching ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Searching…</>
              ) : (
                <><Search className="w-4 h-4" /> Get Fees Data</>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── Table Card ────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-teal-500 uppercase tracking-widest mb-0.5">Records</p>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Fees Data
              {feesData.length > 0 && <span className="ml-2 text-sm font-normal text-slate-400">({feesData.length} records)</span>}
            </h2>
          </div>
          {feesData.length > 0 && (
            <button
              onClick={() => {
                const meta = `Total records: ${feesData.length} · Printed: ${new Date().toLocaleDateString()}`;
                printRecords("fees-print-area", "Fees Report", meta);
              }}
              className="no-print inline-flex items-center gap-2 px-4 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
          )}
        </div>

        {/* Loading state inside table */}
        {isFetching && feesData.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Loading records…</p>
          </div>
        ) : feesData.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div id="fees-print-area" className="hidden sm:block overflow-x-auto">
              <Table className="min-w-full whitespace-nowrap">
                <TableHeader>
                  <TableRow className="bg-slate-800 dark:bg-slate-950 hover:bg-slate-800 dark:hover:bg-slate-950">
                    <TableHead className="text-slate-100 text-xs font-semibold uppercase tracking-wider px-4 py-3.5">Student Name</TableHead>
                    <TableHead className="text-slate-100 text-xs font-semibold uppercase tracking-wider px-4 py-3.5">Father</TableHead>
                    <TableHead className="text-slate-100 text-xs font-semibold uppercase tracking-wider px-4 py-3.5">Class</TableHead>
                    <TableHead className="text-slate-100 text-xs font-semibold uppercase tracking-wider px-4 py-3.5">Month/Year</TableHead>
                    <TableHead className="text-slate-100 text-xs font-semibold uppercase tracking-wider px-4 py-3.5">Amount (PKR)</TableHead>
                    <TableHead className="text-slate-100 text-xs font-semibold uppercase tracking-wider px-4 py-3.5">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {feesData.map((fee, i) => (
                    <TableRow key={fee.fee_id} className={`transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40 ${i % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50/50 dark:bg-slate-800/30"}`}>
                      <TableCell className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-100">{fee.student_name}</TableCell>
                      <TableCell className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{fee.father_name}</TableCell>
                      <TableCell className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-100 dark:border-indigo-800">
                          {fee.class_name}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                        {fee.fee_month} {fee.fee_year}
                      </TableCell>
                      <TableCell className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">
                        {fee.fee_amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${fee.fee_status === "Paid" ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800"}`}>
                          {fee.fee_status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {feesData.map(fee => (
                <div key={fee.fee_id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{fee.student_name}</p>
                      <p className="text-xs text-slate-500">{fee.father_name}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${fee.fee_status === "Paid" ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800"}`}>
                      {fee.fee_status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-slate-400 uppercase tracking-wide text-[10px] font-semibold"><Building2 className="w-3 h-3 inline mr-1" />Class</p>
                      <p className="text-slate-700 dark:text-slate-300 mt-0.5 font-medium">{fee.class_name}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 uppercase tracking-wide text-[10px] font-semibold"><Calendar className="w-3 h-3 inline mr-1" />Month/Year</p>
                      <p className="text-slate-700 dark:text-slate-300 mt-0.5 font-medium">{fee.fee_month} {fee.fee_year}</p>
                    </div>
                    <div className="col-span-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                      <p className="text-slate-400 uppercase tracking-wide text-[10px] font-semibold">Amount</p>
                      <p className="text-base font-bold text-slate-800 dark:text-slate-100 mt-0.5">PKR {fee.fee_amount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 py-16">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Search className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-semibold">No records found</p>
            <p className="text-slate-400 dark:text-slate-500 text-sm">Use the filters above to search for fees</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewFees;
