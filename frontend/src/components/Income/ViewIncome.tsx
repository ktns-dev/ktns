"use client";
import { IncomeCategory } from "@/models/income/income";
import React, { useEffect, useState } from "react";
import { IncomeAPI as API } from "@/api/Income/IncomeAPI";
import { useForm } from "react-hook-form";
import { usePrint } from "@/components/print/usePrint";
import { Printer, Filter, PieChart, Calendar, Phone, Hash, List } from "lucide-react";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Header } from "../dashboard/Header";
import Loader from "../Loader";

interface IncomeFormValues { category_id: number; }
interface IncomeDataItem {
  id: number; date: string; category: string; source: string; description: string; contact: string; amount: number;
}
interface ApiResponse<T> { data: T; status: number; message?: string; }

const inputCls =
  "h-10 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-3 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 hover:border-slate-300 dark:hover:border-slate-600 transition-colors";

const ViewIncome = () => {
  const { register, formState: { errors } } = useForm<IncomeFormValues>();
  const { printRecords } = usePrint();

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [incomeCategory, setIncomeCategory] = useState<IncomeCategory[]>([]);
  const [incomeData, setIncomeData] = useState<IncomeDataItem[]>([]);

  useEffect(() => {
    getCategories();
    getAllIncome();
  }, []);

  const getCategories = async () => {
    try {
      const res = (await API.GetIncomeCategory()) as ApiResponse<IncomeCategory[]>;
      const data = res.data.map((item: IncomeCategory) => ({
        income_cat_name_id: item.income_cat_name_id,
        income_cat_name: item.income_cat_name,
        created_at: item.created_at,
      }));
      setIncomeCategory(data);
    } catch (error) {
      console.error("Error fetching income categories:", error);
      setIncomeCategory([]);
    }
  };

  const getAllIncome = async () => {
    setIsFetching(true);
    try {
      const res = (await API.GetIncomeData(0)) as ApiResponse<IncomeDataItem[]>;
      setIncomeData(res.data);
    } catch (error) {
      console.error("Error fetching all income data:", error);
      setIncomeData([]);
    } finally {
      setIsFetching(false);
    }
  };

  const getIncome = async (CategoryId: number) => {
    if (CategoryId === 0) {
      getAllIncome();
      return;
    }
    setIsFetching(true);
    try {
      const res = (await API.GetIncomeData(CategoryId)) as ApiResponse<IncomeDataItem[]>;
      setIncomeData(res.data);
    } catch (error) {
      console.error("Error fetching income data:", error);
      setIncomeData([]);
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="w-full space-y-5 px-4 sm:px-0">
      <Header value="View Income" />
      <Loader isActive={isLoading} />

      {/* ── Filter Card ──────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mt-4">
        <div className="px-5 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
            <Filter className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-emerald-500 uppercase tracking-widest mb-0.5">Filters</p>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Filter Income</h2>
          </div>
        </div>

        <form className="p-5">
          <div className="max-w-xs space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5 block">
              Income Category
            </label>
            <select
              {...register("category_id", { valueAsNumber: true })}
              className={inputCls}
              onChange={(e) => getIncome(Number(e.target.value))}
            >
              <option value={0}>All Categories</option>
              {incomeCategory.map((category) => (
                <option key={category.income_cat_name_id} value={category.income_cat_name_id}>
                  {category.income_cat_name}
                </option>
              ))}
            </select>
          </div>
        </form>
      </div>

      {/* ── Table Card ────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-teal-500 uppercase tracking-widest mb-0.5">Records</p>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Income Data
              {incomeData.length > 0 && <span className="ml-2 text-sm font-normal text-slate-400">({incomeData.length} records)</span>}
            </h2>
          </div>
          {incomeData.length > 0 && (
            <button
              onClick={() => {
                const meta = `Total records: ${incomeData.length} · Printed: ${new Date().toLocaleDateString()}`;
                printRecords('income-print-area', 'Income Report', meta);
              }}
              className="no-print inline-flex items-center gap-2 px-4 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
          )}
        </div>

        {isFetching ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Loading records…</p>
          </div>
        ) : incomeData.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div id="income-print-area" className="hidden sm:block overflow-x-auto">
              <Table className="min-w-full whitespace-nowrap">
                <TableHeader>
                  <TableRow className="bg-slate-800 dark:bg-slate-950 hover:bg-slate-800 dark:hover:bg-slate-950">
                    <TableHead className="text-slate-100 text-xs font-semibold uppercase tracking-wider px-4 py-3.5">ID</TableHead>
                    <TableHead className="text-slate-100 text-xs font-semibold uppercase tracking-wider px-4 py-3.5">Date</TableHead>
                    <TableHead className="text-slate-100 text-xs font-semibold uppercase tracking-wider px-4 py-3.5">Category</TableHead>
                    <TableHead className="text-slate-100 text-xs font-semibold uppercase tracking-wider px-4 py-3.5">Source</TableHead>
                    <TableHead className="text-slate-100 text-xs font-semibold uppercase tracking-wider px-4 py-3.5">Amount (PKR)</TableHead>
                    <TableHead className="text-slate-100 text-xs font-semibold uppercase tracking-wider px-4 py-3.5">Contact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {incomeData.map((item, i) => (
                    <TableRow key={item.id} className={`transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40 ${i % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50/50 dark:bg-slate-800/30"}`}>
                      <TableCell className="px-4 py-3 text-slate-500 dark:text-slate-400 font-medium">#{item.id}</TableCell>
                      <TableCell className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{item.date}</TableCell>
                      <TableCell className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-100 dark:border-emerald-800">
                          {item.category}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">{item.source}</TableCell>
                      <TableCell className="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400">+{item.amount.toLocaleString()}</TableCell>
                      <TableCell className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{item.contact}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {incomeData.map(item => (
                <div key={item.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{item.source}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3"/>{item.date}
                      </p>
                    </div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md text-sm border border-emerald-100 dark:border-emerald-800">
                      +PKR {item.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-slate-400 uppercase tracking-wide text-[10px] font-semibold"><List className="w-3 h-3 inline mr-1" />Category</p>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium border border-emerald-100 dark:border-emerald-800">
                        {item.category}
                      </span>
                    </div>
                    <div>
                      <p className="text-slate-400 uppercase tracking-wide text-[10px] font-semibold"><Hash className="w-3 h-3 inline mr-1" />ID / Contact</p>
                      <p className="text-slate-700 dark:text-slate-300 mt-0.5 font-medium">#{item.id} &bull; {item.contact}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-slate-400 uppercase tracking-wide text-[10px] font-semibold">Description</p>
                      <p className="text-slate-600 dark:text-slate-400 mt-0.5 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800 text-xs">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 py-16">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <PieChart className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-semibold">No records found</p>
            <p className="text-slate-400 dark:text-slate-500 text-sm">Select a different category</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewIncome;
