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
import { Search, ChevronLeft, ChevronRight, LoaderIcon, Calendar, GraduationCap } from "lucide-react";
import { TeacherNameAPI as API } from "@/api/Teacher/TeachetAPI";
import { TeacherModel } from "@/models/teacher/Teacher";
import { useEffect, useState } from "react";
import AddNewTeacher from "./CreateTeacher";
import DelConfirmMsg from "../DelConfMsg";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function TeacherTable() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [data, setData] = useState<TeacherModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    GetData();
  }, []);

  const GetData = async () => {
    setLoading(true);
    try {
      const response = await API.Get();
      setData(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (confirmed: boolean, row: TeacherModel) => {
    if (!confirmed) return;
    try {
      await API.Delete(row.teacher_name_id);
      toast.success("Teacher deleted successfully", { position: "bottom-center" });
      GetData();
    } catch (error: unknown) {
      const axiosError = error as { response?: { status: number; data?: { detail?: string } } };
      if (axiosError.response?.status === 409) {
        toast.error(
          "Please delete related attendance records first before deleting this teacher.",
          { position: "bottom-center" }
        );
      } else {
        toast.error(
          axiosError.response?.data?.detail || "Failed to delete teacher.",
          { position: "bottom-center" }
        );
      }
    }
  };

  const columns: ColumnDef<TeacherModel>[] = [
    {
      accessorKey: "teacher_name_id",
      header: "Sr. No",
      cell: ({ row }) => (
        <div className="font-semibold text-slate-500 dark:text-slate-400">
          #{row.getValue("teacher_name_id")}
        </div>
      ),
    },
    {
      accessorKey: "teacher_name",
      header: "Teacher Name",
      cell: ({ row }) => (
        <div className="text-slate-800 dark:text-slate-100 font-semibold">
          {row.getValue("teacher_name")}
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created Date",
      cell: ({ row }) => {
        const date = new Date(row.getValue("created_at"));
        const formattedDate = date.toLocaleDateString("en-GB");
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
            <Calendar className="w-3 h-3" />
            {formattedDate}
          </div>
        );
      },
    },
    {
      id: "delete",
      header: "Action",
      cell: ({ row }) => (
        <DelConfirmMsg
          rowId={row.original.teacher_name_id}
          OnDelete={(confirmed) => handleDelete(confirmed, row.original)}
        />
      ),
    },
  ];

  const table = useReactTable<TeacherModel>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div className="w-full space-y-5 px-4 sm:px-0 mt-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Header / Filter Toolbar */}
        <div className="px-5 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-0.5">Faculty Data</p>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Teacher Management</h2>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search Teachers..."
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-9 h-10 w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 dark:text-slate-100 transition-colors"
              />
            </div>
            <div className="w-full sm:w-auto flex justify-end">
              <AddNewTeacher onClassAdded={GetData} />
            </div>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="bg-slate-800 dark:bg-slate-950 hover:bg-slate-800 dark:hover:bg-slate-950">
                {table.getHeaderGroups().map((headerGroup) =>
                  headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="text-slate-100 text-xs font-semibold uppercase tracking-wider px-5 py-4"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </TableHead>
                  ))
                )}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-12">
                    <LoaderIcon className="animate-spin w-8 h-8 mx-auto text-indigo-500" />
                    <p className="mt-2 text-sm text-slate-500">Loading teachers...</p>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row, i) => (
                  <TableRow
                    key={row.id}
                    className={`transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40 ${
                      i % 2 === 0
                        ? "bg-white dark:bg-slate-900"
                        : "bg-slate-50/50 dark:bg-slate-800/20"
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-5 py-3.5 text-sm">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-center py-12 text-slate-500 dark:text-slate-400"
                  >
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
          {loading ? (
            <div className="flex justify-center py-8">
              <LoaderIcon className="animate-spin w-6 h-6 text-indigo-500" />
            </div>
          ) : table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <div
                key={row.id}
                className="p-4 space-y-3 bg-white dark:bg-slate-900"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-slate-400 font-medium tracking-wide">#{row.original.teacher_name_id}</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                      {row.original.teacher_name}
                    </p>
                  </div>
                  <DelConfirmMsg
                    rowId={row.original.teacher_name_id}
                    OnDelete={(confirmed) => handleDelete(confirmed, row.original)}
                  />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Created Date</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5 flex items-center gap-1.5 ">
                    <Calendar className="w-3 h-3"/>
                    {new Date(row.original.created_at).toLocaleDateString("en-GB")}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500">No results found.</div>
          )}
        </div>

        {/* Pagination */}
        <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Showing{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {table.getRowModel().rows.length > 0 
                ? table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1 
                : 0}
            </span>
            {" - "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {table.getFilteredRowModel().rows.length}
            </span> teachers
          </span>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8 px-3 rounded-lg border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-8 px-3 rounded-lg border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
