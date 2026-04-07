"use client";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "../ui/input";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, UserPlus, X } from "lucide-react";
import { StudentAPI as API } from "@/api/Student/StudentsAPI";
import { CreateStudent } from "@/models/students/Student";
import { Select, SelectOption as SelectComponentOption } from "../Select";
import { ClassNameAPI as API1 } from "@/api/Classname/ClassNameAPI";

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputCls =
  "h-10 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 focus:border-indigo-400 focus:ring-indigo-300 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-sm transition-colors";

const selectCls =
  "h-10 w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 rounded-xl px-3 text-sm text-slate-800 dark:text-slate-100 transition-colors";

// ─── Field wrapper ────────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}
const Field = ({ label, required, error, children }: FieldProps) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    {children}
    {error && <p className="text-rose-500 text-xs">{error}</p>}
  </div>
);

// ─── AddNewStudent (CreateStudent form) ───────────────────────────────────────

const AddNewStudent = ({ onClassAdded }: { onClassAdded: () => void }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateStudent>();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [classNameList, setClassNameList] = useState<SelectComponentOption[]>([]);

  interface ClassNameResponse {
    class_name_id: number;
    class_name: string;
  }

  const handleFormSubmit = async (data: CreateStudent) => {
    setLoading(true);
    if (data.student_date_of_birth.length === 10) {
      data.student_date_of_birth += "T00:00:00Z";
    }
    try {
      const response = await CreateStudentAPI(data);
      if (response) {
        setOpen(false);
        reset();
        toast.success("Student added successfully!");
        onClassAdded();
      }
    } catch (error) {
      console.error("Error creating student:", error);
      toast.error("Failed to add student. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const GetClassName = React.useCallback(async () => {
    try {
      const response = (await API1.Get()) as { data: ClassNameResponse[] };
      if (response.data) {
        setClassNameList(
          response.data.map((item) => ({
            id: item.class_name_id,
            title: item.class_name,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching class names:", error);
    }
  }, []);

  useEffect(() => {
    GetClassName();
  }, [GetClassName]);

  const CreateStudentAPI = async (data: CreateStudent) => {
    try {
      const response = await API.Create(data);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error && "response" in error) {
        console.error("API Error:", (error as { response: { data: unknown } }).response.data);
      } else {
        console.error("API Error:", error);
      }
      throw error;
    }
  };

  const handleClose = () => {
    if (!loading) { setOpen(false); reset(); }
  };

  return (
    <div>
      {/* Trigger Button */}
      <div className="flex justify-end mb-5">
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
        >
          <UserPlus className="w-4 h-4" />
          Add New Student
        </button>
      </div>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-h-[92vh] overflow-y-auto max-w-lg sm:max-w-2xl p-0 gap-0 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl bg-white dark:bg-slate-900">
          {/* Indigo accent bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500 rounded-t-2xl" />

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  Add New Student
                </DialogTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Fill in all required fields to enroll a student</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg p-1.5 transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Body */}
          <DialogDescription asChild>
            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className="px-6 py-5 space-y-5"
            >
              {/* Class */}
              <Field label="Class Name" required error={errors.class_name?.message}>
                <Select
                  options={classNameList}
                  {...register("class_name", { required: "Class is required" })}
                  onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                    register("class_name").onChange({ target: { value: event.target.value } });
                  }}
                  DisplayItem="title"
                  className={selectCls}
                />
              </Field>

              {/* Student Info */}
              <div>
                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-1.5 mb-3">
                  Student Information
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Student Name" required error={errors.student_name?.message}>
                    <Input className={inputCls} placeholder="Full name" {...register("student_name", { required: "Required" })} />
                  </Field>
                  <Field label="Date of Birth" required error={errors.student_date_of_birth?.message}>
                    <Input type="date" className={inputCls} {...register("student_date_of_birth", { required: "Required" })} />
                  </Field>
                  <Field label="Age" required error={errors.student_age?.message}>
                    <Input type="number" className={inputCls} placeholder="Age" {...register("student_age", { required: "Required" })} />
                  </Field>
                  <Field label="Gender" required error={errors.student_gender?.message}>
                    <select className={selectCls} {...register("student_gender", { required: "Required" })} defaultValue="">
                      <option value="" disabled>Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </Field>
                  <Field label="Education" required error={errors.student_education?.message}>
                    <Input className={inputCls} placeholder="Education level" {...register("student_education", { required: "Required" })} />
                  </Field>
                  <Field label="City" required error={errors.student_city?.message}>
                    <Input className={inputCls} placeholder="City" {...register("student_city", { required: "Required" })} />
                  </Field>
                  <Field label="Address" required error={errors.student_address?.message}>
                    <Input className={inputCls} placeholder="Full address" {...register("student_address", { required: "Required" })} />
                  </Field>
                </div>
              </div>

              {/* Father Info */}
              <div>
                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-1.5 mb-3">
                  Father / Guardian Information
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Father Name" required error={errors.father_name?.message}>
                    <Input className={inputCls} placeholder="Father's full name" {...register("father_name", { required: "Required" })} />
                  </Field>
                  <Field label="Father Contact" required error={errors.father_contact?.message}>
                    <Input type="number" className={inputCls} placeholder="Contact number" {...register("father_contact", { required: "Required" })} />
                  </Field>
                  <Field label="Father's CNIC" required error={errors.father_cnic?.message}>
                    <Input className={inputCls} placeholder="CNIC number" {...register("father_cnic", { required: "Required" })} />
                  </Field>
                  <Field label="Father Caste" required error={errors.father_cast_name?.message}>
                    <Input className={inputCls} placeholder="Caste / tribe" {...register("father_cast_name", { required: "Required" })} />
                  </Field>
                  <Field label="Father Occupation" required error={errors.father_occupation?.message}>
                    <Input className={inputCls} placeholder="Occupation" {...register("father_occupation", { required: "Required" })} />
                  </Field>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                  ) : "Save Student"}
                </button>
              </div>
            </form>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddNewStudent;
