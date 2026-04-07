"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/dashboard/Header";
import { toast } from "sonner";
import { IncomeAPI as API } from "@/api/Income/IncomeAPI";
import { IncomeCategory, AddIncomeModel } from "@/models/income/income";
import { AxiosResponse } from "axios";
import { Loader2, Save, Wallet } from "lucide-react";

const inputCls =
  "h-10 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-3 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 hover:border-slate-300 dark:hover:border-slate-600 transition-colors";

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5 block">
    {children}
  </label>
);

const AddIncome = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddIncomeModel>();

  const [isLoading, setIsLoading] = useState(false);
  const [incomeCategory, setIncomeCategory] = useState<IncomeCategory[]>([]);

  useEffect(() => {
    getCategories();
  }, []);

  const getCategories = async () => {
    try {
      const res: AxiosResponse<IncomeCategory[]> = await API.GetIncomeCategory();
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

  const onSubmit = async (data: AddIncomeModel) => {
    setIsLoading(true);
    try {
      const response = await API.AddIncome(data);
      if (response.status === 201) {
        toast.success("Income record added successfully", { position: "bottom-center" });
        reset();
      } else {
        toast.error("Failed to add income record", { position: "bottom-center" });
      }
    } catch (error) {
      console.error("Error adding income:", error);
      toast.error("Failed to add income record", { position: "bottom-center" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-5">
      <Header value="Add Income Record" />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mt-4">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-500 uppercase tracking-widest mb-0.5">Finance</p>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Log New Income</h2>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              
              {/* Receipt Number */}
              <div className="space-y-1">
                <FieldLabel>Receipt Number <span className="text-rose-500">*</span></FieldLabel>
                <Input
                  type="number"
                  {...register("recipt_number", { valueAsNumber: true, required: "Required" })}
                  placeholder="e.g. 100234"
                  className={inputCls}
                />
                {errors.recipt_number && <p className="text-rose-500 text-xs mt-1 absolute">{errors.recipt_number.message}</p>}
              </div>

              {/* Date */}
              <div className="space-y-1">
                <FieldLabel>Date <span className="text-rose-500">*</span></FieldLabel>
                <Input
                  type="date"
                  {...register("date", { required: "Required" })}
                  className={inputCls}
                />
                {errors.date && <p className="text-rose-500 text-xs mt-1 absolute">{errors.date.message}</p>}
              </div>

              {/* Category */}
              <div className="space-y-1">
                <FieldLabel>Category <span className="text-rose-500">*</span></FieldLabel>
                <select
                  {...register("category_id", { valueAsNumber: true, required: "Required" })}
                  className={inputCls}
                >
                  <option disabled value="">Select Category</option>
                  {incomeCategory.map((category) => (
                    <option key={category.income_cat_name_id} value={category.income_cat_name_id}>
                      {category.income_cat_name}
                    </option>
                  ))}
                </select>
                {errors.category_id && <p className="text-rose-500 text-xs mt-1 absolute">{errors.category_id.message}</p>}
              </div>

              {/* Amount */}
              <div className="space-y-1">
                <FieldLabel>Amount (PKR) <span className="text-rose-500">*</span></FieldLabel>
                <Input
                  type="number"
                  {...register("amount", {
                    valueAsNumber: true,
                    required: "Required",
                    min: { value: 1, message: "Must be > 0" },
                  })}
                  placeholder="e.g. 10000"
                  className={inputCls}
                />
                {errors.amount && <p className="text-rose-500 text-xs mt-1 absolute">{errors.amount.message}</p>}
              </div>

              {/* Source */}
              <div className="space-y-1">
                <FieldLabel>Source <span className="text-rose-500">*</span></FieldLabel>
                <Input
                  {...register("source", { required: "Required" })}
                  placeholder="e.g. Grant, Event"
                  className={inputCls}
                />
                {errors.source && <p className="text-rose-500 text-xs mt-1 absolute">{errors.source.message}</p>}
              </div>
              
              {/* Contact */}
              <div className="space-y-1">
                <FieldLabel>Contact</FieldLabel>
                <Input
                  {...register("contact")}
                  placeholder="e.g. 0300-1234567"
                  className={inputCls}
                />
              </div>

              {/* Description (Full width for larger text) */}
              <div className="space-y-1 sm:col-span-2 lg:col-span-3 xl:col-span-4">
                <FieldLabel>Description <span className="text-rose-500">*</span></FieldLabel>
                <Input
                  {...register("description", { required: "Required" })}
                  placeholder="Detail the source of the income..."
                  className={inputCls}
                />
                {errors.description && <p className="text-rose-500 text-xs mt-1 absolute">{errors.description.message}</p>}
              </div>

            </div>

            {/* Action Bar */}
            <div className="mt-8 flex justify-end pt-5 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                ) : (
                  <><Save className="w-4 h-4" /> Save Income</>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddIncome;
