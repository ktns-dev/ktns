"use client";
import React, { useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "../ui/input";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, Plus, BookOpen } from "lucide-react";
import { ClassNameAPI as API } from "@/api/Classname/ClassNameAPI";
import { CreateClassModel } from "@/models/className/className";

const AddNewClass = ({ onClassAdded }: { onClassAdded: () => void }) => {
  const {  
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateClassModel>();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFormSubmit = async (data: CreateClassModel) => {
    setLoading(true);
    try {
      const response = await API.Create(data);
      if (response) {
        setOpen(false);
        reset();
        toast.success("Class Name Added Successfully!", { position: "bottom-center" });
        onClassAdded();
      }
    } catch (error) {
      console.error("Error creating class:", error);
      toast.error("Failed to add class name", { position: "bottom-center" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all whitespace-nowrap"
      >
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">Add Class</span>
      </button>

      {/* Dialog overlay and box */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md p-0 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900 gap-0 overflow-hidden">
          {/* Accent bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500" />
          
          <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-800 dark:text-slate-100 text-left">
                  New Class
                </DialogTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 text-left">
                  Create a new class for the academic year
                </p>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6">
            <div className="space-y-4 mb-6">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Class Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  className="h-10 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-colors"
                  placeholder="e.g. Grade 10 - Section A"
                  {...register("class_name", { required: "Class name is required" })}
                />
                {errors.class_name && (
                  <p className="text-rose-500 text-xs mt-1 absolute">{errors.class_name.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-50"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                ) : (
                  "Save Class"
                )}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddNewClass;
