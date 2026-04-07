"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { Search, Loader2, Eye, Trash2, Printer, Users } from "lucide-react";
import { StudentAPI as API } from "@/api/Student/StudentsAPI";
import { usePrint } from "@/components/print/usePrint";
export { format } from "date-fns";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StudentModel } from "@/models/students/Student";
import { useEffect, useState } from "react";
import AddNewStudent from "./CreateStudent";
import DeleteStudentModal from "./DeleteStudentModal";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { useRole } from "@/context/RoleContext";
import { Pagination } from "@/components/ui/pagination";

// ─── Detail Row ───────────────────────────────────────────────────────────────

const DetailRow = ({ label, value }: { label: string; value?: string | number }) => (
  <div>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{value ?? "—"}</p>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ModernStudentTable() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [data, setData] = useState<StudentModel[]>([]);
  const { printRecords } = usePrint();
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentModel | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [modalStudent, setModalStudent] = useState<{ id: number; name: string } | null>(null);
  const { role } = useRole();
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setCurrentUserId(user?.id || null);
  }, []);

  const formDeleteHandler = async (reason: string) => {
    if (!modalStudent || !currentUserId) return;
    try {
      const payload = { reason, deleted_by: currentUserId };
      const response = await API.Delete(modalStudent.id, payload);
      if (response && typeof response === "object" && "status" in response) {
        if (response.status === 200) {
          toast.success("Student deleted successfully", { position: "bottom-center" });
          GetData();
          setModalStudent(null);
        } else {
          toast.error("An error occurred", { position: "bottom-center" });
        }
      }
    } catch (error) {
      toast.error("Failed to delete student", { position: "bottom-center" });
    }
  };

  const canDelete = role === "ADMIN" || role === "PRINCIPAL";

  const columns: ColumnDef<StudentModel>[] = [
    {
      accessorKey: "student_id",
      header: "Sr. No",
      cell: ({ row }) => (
        <span className="font-semibold text-slate-600 dark:text-slate-400">{row.getValue("student_id")}</span>
      ),
    },
    {
      accessorKey: "student_name",
      header: "Student Name",
      cell: ({ row }) => (
        <span className="font-semibold text-slate-800 dark:text-slate-100">{row.getValue("student_name")}</span>
      ),
    },
    {
      accessorKey: "student_age",
      header: "Age",
    },
    {
      accessorKey: "student_gender",
      header: "Gender",
      cell: ({ row }) => {
        const gender = row.getValue("student_gender") as string;
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
            gender === "Male"   ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
            : gender === "Female" ? "bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800"
            : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
          }`}>
            {gender}
          </span>
        );
      },
    },
    {
      accessorKey: "class_name",
      header: "Class",
      cell: ({ row }) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-100 dark:border-indigo-800">
          {row.getValue("class_name")}
        </span>
      ),
    },
    {
      accessorKey: "student_city",
      header: "City",
      cell: ({ row }) => (
        <span className="text-slate-600 dark:text-slate-300">{row.getValue("student_city")}</span>
      ),
    },
    {
      accessorKey: "father_name",
      header: "Father Name",
      cell: ({ row }) => (
        <span className="text-slate-700 dark:text-slate-300">{row.getValue("father_name")}</span>
      ),
    },
    {
      accessorKey: "father_contact",
      header: "Contact",
      cell: ({ row }) => (
        <span className="text-slate-600 dark:text-slate-400 font-mono text-xs">{row.getValue("father_contact")}</span>
      ),
    },
    {
      id: "Action",
      accessorKey: "Action",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2 items-center no-print">
          <button
            onClick={() => { setSelectedStudent(row.original); setShowDetailsDialog(true); }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">View</span>
          </button>
          {canDelete && (
            <button
              onClick={() => setModalStudent({ id: Number(row.original.student_id), name: row.original.student_name })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-semibold rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/40 hover:border-rose-300 dark:hover:border-rose-700 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          )}
        </div>
      ),
    },
  ];

  const GetData = async () => {
    setLoading(true);
    try {
      const response = (await API.Get()) as { data: StudentModel[] };
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { GetData(); }, []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  const filteredCount = table.getFilteredRowModel().rows.length;

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">

      {/* ── Toolbar ──────────────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800 space-y-4">
        <AddNewStudent onClassAdded={GetData} />

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Search students by name, class, city…"
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full pl-10 pr-4 h-10 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
            />
          </div>

          {/* Stats chip */}
          <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shrink-0">
            <Users className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {filteredCount} <span className="text-slate-400 font-normal">students</span>
            </span>
          </div>

          {/* Print */}
          {data.length > 0 && (
            <button
              onClick={() => {
                const meta = `Total records: ${data.length} · Printed: ${new Date().toLocaleDateString()}`;
                printRecords("student-print-area", "Student Report", meta);
              }}
              className="inline-flex items-center gap-2 px-4 h-10 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white text-sm font-semibold rounded-xl transition-colors whitespace-nowrap"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          )}
        </div>
      </div>

      {/* ── Desktop Table ─────────────────────────────────────────────── */}
      <div className="hidden sm:block overflow-x-auto" id="student-print-area">
        <Table className="w-full whitespace-nowrap">
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="bg-slate-800 dark:bg-slate-950 hover:bg-slate-800 dark:hover:bg-slate-950">
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={`text-slate-100 text-xs font-semibold uppercase tracking-wider px-4 py-3.5 ${header.column.id === "Action" ? "no-print" : ""}`}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <p className="text-slate-400 text-sm font-medium">Loading students…</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length > 0 ? (
              table.getRowModel().rows.map((row, i) => (
                <TableRow
                  key={row.id}
                  className={`transition-colors hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10 ${i % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50/50 dark:bg-slate-800/30"}`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={`px-4 py-3 text-sm ${cell.column.id === "Action" ? "no-print" : ""}`}
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
                      <Users className="w-7 h-7 text-slate-400" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-semibold">No students found</p>
                    <p className="text-slate-400 dark:text-slate-500 text-sm">
                      {globalFilter ? "Try adjusting your search" : "Add your first student above"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Mobile Card View ──────────────────────────────────────────── */}
      <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin w-8 h-8 text-indigo-500" />
          </div>
        ) : data.length > 0 ? (
          table.getRowModel().rows.map((row) => (
            <div key={row.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-xs text-slate-400 font-medium">#{row.original.student_id}</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">{row.original.student_name}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setSelectedStudent(row.original); setShowDetailsDialog(true); }}
                    className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {canDelete && (
                    <button
                      onClick={() => setModalStudent({ id: Number(row.original.student_id), name: row.original.student_name })}
                      className="w-8 h-8 flex items-center justify-center bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-slate-400 uppercase tracking-wide text-[10px] font-semibold">Class</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 mt-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-100 dark:border-indigo-800">
                    {row.original.class_name}
                  </span>
                </div>
                <div>
                  <p className="text-slate-400 uppercase tracking-wide text-[10px] font-semibold">Gender</p>
                  <p className="text-slate-700 dark:text-slate-300 mt-0.5">{row.original.student_gender}</p>
                </div>
                <div>
                  <p className="text-slate-400 uppercase tracking-wide text-[10px] font-semibold">Age</p>
                  <p className="text-slate-700 dark:text-slate-300 mt-0.5">{row.original.student_age}</p>
                </div>
                <div>
                  <p className="text-slate-400 uppercase tracking-wide text-[10px] font-semibold">City</p>
                  <p className="text-slate-700 dark:text-slate-300 mt-0.5 truncate">{row.original.student_city}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-slate-400 uppercase tracking-wide text-[10px] font-semibold">Father</p>
                  <p className="text-slate-700 dark:text-slate-300 mt-0.5">{row.original.father_name} · {row.original.father_contact}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center py-12 text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
              <Users className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-semibold">No students found</p>
          </div>
        )}
      </div>

      {/* ── Pagination ────────────────────────────────────────────────── */}
      {!loading && data.length > 0 && (
        <div className="px-4 sm:px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Showing{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}–
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                filteredCount
              )}
            </span>{" "}
            of <span className="font-semibold text-slate-700 dark:text-slate-300">{filteredCount}</span> students
          </p>
          <Pagination
            className="flex"
            currentPage={table.getState().pagination.pageIndex + 1}
            totalPages={Math.ceil(filteredCount / table.getState().pagination.pageSize)}
            onPageChange={(page) => table.setPageIndex(page - 1)}
          />
        </div>
      )}

      {/* ── Student Details Dialog ────────────────────────────────────── */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl gap-0 bg-white dark:bg-slate-900">
          <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500 rounded-t-2xl" />
          <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                  <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">Student Details</DialogTitle>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{selectedStudent?.student_name}</p>
                </div>
              </div>
              <DialogClose asChild>
                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg p-1.5 transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
              </DialogClose>
            </div>
          </DialogHeader>

          {selectedStudent && (
            <div className="px-6 py-5 space-y-6">
              <div>
                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-1.5 mb-3">
                  Student Information
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <DetailRow label="Student ID" value={selectedStudent.student_id} />
                  <DetailRow label="Full Name" value={selectedStudent.student_name} />
                  <DetailRow label="Date of Birth" value={new Date(selectedStudent.student_date_of_birth).toLocaleDateString("en-GB")} />
                  <DetailRow label="Age" value={selectedStudent.student_age} />
                  <DetailRow label="Gender" value={selectedStudent.student_gender} />
                  <DetailRow label="Education" value={selectedStudent.student_education} />
                  <DetailRow label="Class" value={selectedStudent.class_name} />
                  <DetailRow label="City" value={selectedStudent.student_city} />
                  <DetailRow label="Address" value={selectedStudent.student_address} />
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-1.5 mb-3">
                  Father / Guardian Information
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <DetailRow label="Father Name" value={selectedStudent.father_name} />
                  <DetailRow label="Contact" value={selectedStudent.father_contact} />
                  <DetailRow label="Occupation" value={selectedStudent.father_occupation} />
                  <DetailRow label="CNIC" value={selectedStudent.father_cnic} />
                  <DetailRow label="Caste" value={selectedStudent.father_cast_name} />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete Modal ──────────────────────────────────────────────── */}
      {modalStudent && (
        <DeleteStudentModal
          studentId={modalStudent.id}
          studentName={modalStudent.name}
          onConfirm={formDeleteHandler}
          onClose={() => setModalStudent(null)}
        />
      )}
    </div>
  );
}
