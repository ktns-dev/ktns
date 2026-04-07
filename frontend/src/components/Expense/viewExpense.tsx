"use client";
import { ExpenseCategory } from "@/models/expense/expense";
import React, { useEffect, useState } from "react";
import { ExpenseAPI as API } from "@/api/Expense/ExpenseAPI";
import { useForm } from "react-hook-form";
import { usePrint } from "@/components/print/usePrint";
import { Printer, Filter, PieChart, Tag, Calendar, User, AlignLeft, Hash } from "lucide-react";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Header } from "../dashboard/Header";
import AddExpenseCategory from "./CreateExpenseCat";

interface ExpenseFormValues { category_id: number; }
interface ApiResponse<T> { data: T; status: number; message?: string; }
interface ExpenseDataItem {
  id: number; date: string; category: string; to_whom: string; description: string; amount: number;
}

const inputCls =
  "h-10 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-3 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 hover:border-slate-300 dark:hover:border-slate-600 transition-colors";

const ViewExpense = () => {
  const { register, formState: { errors } } = useForm<ExpenseFormValues>();
  const { printRecords } = usePrint();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory[]>([]);
  const [expenseData, setExpenseData] = useState<ExpenseDataItem[]>([]);

  useEffect(() => {
    getCategories();
    getAllExpense();
  }, []);

  const getCategories = async () => {
    try {
      const res = (await API.GetExpenseCategory()) as ApiResponse<ExpenseCategory[]>;
      setExpenseCategory(res.data);
    } catch (error) {
      console.error("Error fetching Expense categories:", error);
      setExpenseCategory([]);
    }
  };

  const getAllExpense = async () => {
    setIsFetching(true);
    try {
      const res = (await API.GetExpenseData(0)) as ApiResponse<ExpenseDataItem[]>;
      if (res && Array.isArray(res.data) && res.data.length > 0) {
        setExpenseData(res.data);
        return;
      }
      const fallbackUrl = `/expenses/filter_expense?category_id=0`;
      const fallbackRes = await fetch(fallbackUrl, { credentials: "include" });
      if (!fallbackRes.ok) {
        setExpenseData([]);
        return;
      }
      const fallbackJson = await fallbackRes.json();
      setExpenseData(Array.isArray(fallbackJson) ? fallbackJson : []);
    } catch (error) {
      console.error(error);
      setExpenseData([]);
    } finally {
      setIsFetching(false);
    }
  };

  const getExpense = async (CategoryId: number) => {
    if (CategoryId === 0) {
      getAllExpense();
      return;
    }
    setIsFetching(true);
    try {
      const res = (await API.GetExpenseData(CategoryId)) as ApiResponse<ExpenseDataItem[]>;
      if (res && Array.isArray(res.data)) {
        setExpenseData(res.data);
        return;
      }
      const fallbackUrl = `/expenses/filter_expense?category_id=${CategoryId}`;
      const fallbackRes = await fetch(fallbackUrl, { credentials: "include" });
      if (!fallbackRes.ok) {
        setExpenseData([]);
        return;
      }
      const fallbackJson = await fallbackRes.json();
      setExpenseData(Array.isArray(fallbackJson) ? fallbackJson : []);
    } catch (error) {
      console.error(error);
      setExpenseData([]);
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="w-full space-y-5 px-4 sm:px-0">
      <Header value="View Expense" />
      
      {/* ── Toolbar & Filter Card ──────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mt-4">
        <div className="px-5 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
              <Filter className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-0.5">Filters</p>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Filter Expenses</h2>
            </div>
          </div>
          <div>
            <AddExpenseCategory onExpenseCatAdd={getCategories} />
          </div>
        </div>

        <form className="p-5">
          <div className="max-w-xs space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5 block">
              Expense Category
            </label>
            <select
              {...register("category_id", { valueAsNumber: true })}
              className={inputCls}
              onChange={(e) => getExpense(Number(e.target.value))}
            >
              <option value={0}>All Categories</option>
              {expenseCategory.map((category) => (
                <option key={category.expense_cat_name_id} value={category.expense_cat_name_id}>
                  {category.expense_cat_name}
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
              Expense Data
              {expenseData.length > 0 && <span className="ml-2 text-sm font-normal text-slate-400">({expenseData.length} records)</span>}
            </h2>
          </div>
          {expenseData.length > 0 && (
            <button
              onClick={() => {
                const meta = `Total records: ${expenseData.length} · Printed: ${new Date().toLocaleDateString()}`;
                printRecords('expense-print-area', 'Expense Report', meta);
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
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Loading records…</p>
          </div>
        ) : expenseData.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div id="expense-print-area" className="hidden sm:block overflow-x-auto">
              <Table className="min-w-full whitespace-nowrap">
                <TableHeader>
                  <TableRow className="bg-slate-800 dark:bg-slate-950 hover:bg-slate-800 dark:hover:bg-slate-950">
                    <TableHead className="text-slate-100 text-xs font-semibold uppercase tracking-wider px-4 py-3.5">ID</TableHead>
                    <TableHead className="text-slate-100 text-xs font-semibold uppercase tracking-wider px-4 py-3.5">Date</TableHead>
                    <TableHead className="text-slate-100 text-xs font-semibold uppercase tracking-wider px-4 py-3.5">Category</TableHead>
                    <TableHead className="text-slate-100 text-xs font-semibold uppercase tracking-wider px-4 py-3.5">To Whom</TableHead>
                    <TableHead className="text-slate-100 text-xs font-semibold uppercase tracking-wider px-4 py-3.5">Amount (PKR)</TableHead>
                    <TableHead className="text-slate-100 text-xs font-semibold uppercase tracking-wider px-4 py-3.5">Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {expenseData.map((item, i) => (
                    <TableRow key={item.id} className={`transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40 ${i % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50/50 dark:bg-slate-800/30"}`}>
                      <TableCell className="px-4 py-3 text-slate-500 dark:text-slate-400 font-medium">#{item.id}</TableCell>
                      <TableCell className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{item.date}</TableCell>
                      <TableCell className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-100 dark:border-indigo-800">
                          {item.category}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">{item.to_whom}</TableCell>
                      <TableCell className="px-4 py-3 font-semibold text-rose-600 dark:text-rose-400">-{item.amount.toLocaleString()}</TableCell>
                      <TableCell className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 max-w-xs truncate">{item.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {expenseData.map(item => (
                <div key={item.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{item.to_whom}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><Calendar className="w-3 h-3"/>{item.date}</p>
                    </div>
                    <span className="font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded-md text-sm">
                      -PKR {item.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-slate-400 uppercase tracking-wide text-[10px] font-semibold"><Tag className="w-3 h-3 inline mr-1" />Category</p>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium border border-indigo-100 dark:border-indigo-800">
                        {item.category}
                      </span>
                    </div>
                    <div>
                      <p className="text-slate-400 uppercase tracking-wide text-[10px] font-semibold"><Hash className="w-3 h-3 inline mr-1" />ID</p>
                      <p className="text-slate-700 dark:text-slate-300 mt-0.5 font-medium">#{item.id}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-slate-400 uppercase tracking-wide text-[10px] font-semibold"><AlignLeft className="w-3 h-3 inline mr-1" />Description</p>
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

export default ViewExpense;
