"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/Select";
import { useForm } from "react-hook-form";
import { ClassNameAPI } from "@/api/Classname/ClassNameAPI";
import { StudentAPI } from "@/api/Student/StudentsAPI";
import { FeeAPI } from "@/api/Fees/AddFeeAPI";
import { toast } from "sonner";
import { ChevronsUpDown, Check, Loader2, Save } from "lucide-react";
import { cn } from "@/libs/utils";
import { AddFeeModel } from "@/models/Fees/Fee";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ClassNameResponse {
  class_name_id: number;
  class_name: string;
}

interface StudentResponse {
  student_id: number;
  student_name: string;
  class_name: string;
}

const inputCls =
  "h-10 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-3 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 hover:border-slate-300 dark:hover:border-slate-600 transition-colors";

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5 block">
    {children}
  </label>
);

const AddFees = () => {
  const {
    register,
    setValue: setFormValue,
    formState: { errors },
    handleSubmit,
    reset,
    watch,
  } = useForm<AddFeeModel>();

  const [isLoading, setIsLoading] = useState(false);
  const [classNameList, setClassNameList] = useState<{ id: number; title: string }[]>([]);
  const [studentsList, setStudentsList] = useState<{ id: number; title: string }[]>([]);
  const [filteredStudentsList, setFilteredStudentsList] = useState<{ id: number; title: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const selectedClassId = watch("class_id");

  useEffect(() => {
    GetClassName();
    GetStudents();
    setFormValue("fee_year", new Date().getFullYear().toString());
  }, [setFormValue]);

  const filterStudentsByClass = useCallback(
    async (classId: number) => {
      setIsLoading(true);
      try {
        const response = (await StudentAPI.GetByClassId(classId)) as unknown as { data: StudentResponse[] };
        if (response.data && response.data.length > 0) {
          setFilteredStudentsList(
            response.data.map((student) => ({
              id: student.student_id,
              title: student.student_name,
            }))
          );
        } else {
          const selectedClass = classNameList.find((cls) => cls.id === classId);
          if (selectedClass) {
            const allStudentsResponse = (await StudentAPI.Get()) as { data: StudentResponse[] };
            const filteredStudents = allStudentsResponse.data.filter((student) => student.class_name === selectedClass.title);
            setFilteredStudentsList(
              filteredStudents.map((student) => ({
                id: student.student_id,
                title: student.student_name,
              }))
            );
          } else {
            setFilteredStudentsList([]);
          }
        }
      } catch (error) {
        console.error("Error fetching students by class:", error);
        const selectedClass = classNameList.find((cls) => cls.id === classId);
        if (selectedClass && studentsList.length > 0) {
          const allStudentsResponse = (await StudentAPI.Get()) as { data: StudentResponse[] };
          const filteredStudents = allStudentsResponse.data.filter((student) => student.class_name === selectedClass.title);
          setFilteredStudentsList(
            filteredStudents.map((student) => ({
              id: student.student_id,
              title: student.student_name,
            }))
          );
        } else {
          setFilteredStudentsList([]);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [classNameList, studentsList]
  );

  useEffect(() => {
    if (selectedClassId) {
      filterStudentsByClass(selectedClassId);
    } else {
      setFilteredStudentsList(studentsList);
    }
    setSelectedStudent("");
    setFormValue("student_id", 0);
  }, [selectedClassId, studentsList, filterStudentsByClass, setFormValue]);

  const GetStudents = async () => {
    setIsLoading(true);
    try {
      const response = (await StudentAPI.Get()) as { data: StudentResponse[] };
      const list = response.data.map((student) => ({
        id: student.student_id,
        title: student.student_name,
      }));
      setStudentsList(list);
      setFilteredStudentsList(list);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const GetClassName = async () => {
    try {
      setIsLoading(true);
      const response = (await ClassNameAPI.Get()) as { data: ClassNameResponse[] };
      if (response.data && Array.isArray(response.data)) {
        setClassNameList(
          response.data.map((item: ClassNameResponse) => ({
            id: item.class_name_id,
            title: item.class_name,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching class names:", error);
    }
    setIsLoading(false);
  };

  const onSubmit = async (formData: AddFeeModel) => {
    try {
      setIsLoading(true);
      await FeeAPI.Create(formData);
      toast.success("Fee record added successfully", { position: "bottom-center" });
      reset();
      setSelectedStudent("");
    } catch (error) {
      console.error("Error adding fee record:", error);
      toast.error("Failed to add fee record", { position: "bottom-center" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-5">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-1">Fees Management</p>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Add Fee Record</h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
              
              {/* Class Name */}
              <div className="space-y-1">
                <FieldLabel>Class Name <span className="text-rose-500">*</span></FieldLabel>
                <div className="h-10 text-slate-800 dark:text-slate-100">
                  <Select
                    options={classNameList}
                    {...register("class_id", {
                      valueAsNumber: true,
                      required: "Required",
                    })}
                    DisplayItem="title"
                    className={`${inputCls} py-0 m-0`}
                  />
                </div>
                {errors.class_id && <p className="text-rose-500 text-xs mt-1 absolute">{errors.class_id.message}</p>}
              </div>

              {/* Student */}
              <div className="space-y-1">
                <FieldLabel>Student <span className="text-rose-500">*</span></FieldLabel>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className={`${inputCls} justify-between font-normal hover:bg-transparent ${!selectedClassId && "opacity-50"}`}
                      disabled={!selectedClassId}
                    >
                      {selectedStudent
                        ? filteredStudentsList.find((student) => student.id.toString() === selectedStudent)?.title
                        : selectedClassId ? "Select student..." : "Select class first"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search student..." className="h-9" />
                      <CommandList>
                        {isLoading ? (
                          <div className="p-4 text-center text-xs text-slate-500 flex justify-center items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin"/> Loading...
                          </div>
                        ) : (
                          <>
                            <CommandEmpty>No student found.</CommandEmpty>
                            <CommandGroup>
                              {filteredStudentsList.map((student) => (
                                <CommandItem
                                  key={student.id}
                                  value={student.id.toString()}
                                  onSelect={(currentValue: string) => {
                                    setSelectedStudent(currentValue === selectedStudent ? "" : currentValue);
                                    setOpen(false);
                                    setFormValue("student_id", Number(currentValue));
                                  }}
                                >
                                  {student.title}
                                  <Check className={cn("ml-auto h-4 w-4", selectedStudent === student.id.toString() ? "opacity-100" : "opacity-0")} />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {errors.student_id && <p className="text-rose-500 text-xs mt-1 absolute">{errors.student_id.message}</p>}
              </div>

              {/* Fee Amount */}
              <div className="space-y-1">
                <FieldLabel>Fee Amount <span className="text-rose-500">*</span></FieldLabel>
                <Input
                  type="number"
                  className={inputCls}
                  {...register("fee_amount", {
                    valueAsNumber: true,
                    required: "Required",
                    min: { value: 0, message: "Min: 0" },
                  })}
                  placeholder="e.g. 5000"
                />
                {errors.fee_amount && <p className="text-rose-500 text-xs mt-1 absolute">{errors.fee_amount.message}</p>}
              </div>

              {/* Fee Month */}
              <div className="space-y-1">
                <FieldLabel>Fee Month</FieldLabel>
                <div className="h-10 text-slate-800 dark:text-slate-100">
                  <Select
                    label=""
                    options={[
                      { id: "January", title: "January" }, { id: "February", title: "February" },
                      { id: "March", title: "March" }, { id: "April", title: "April" },
                      { id: "May", title: "May" }, { id: "June", title: "June" },
                      { id: "July", title: "July" }, { id: "August", title: "August" },
                      { id: "September", title: "September" }, { id: "October", title: "October" },
                      { id: "November", title: "November" }, { id: "December", title: "December" },
                    ]}
                    {...register("fee_month")}
                    className={`${inputCls} py-0 m-0`}
                  />
                </div>
              </div>

              {/* Year */}
              <div className="space-y-1">
                <FieldLabel>Year <span className="text-rose-500">*</span></FieldLabel>
                <Input
                  type="number"
                  className={inputCls}
                  {...register("fee_year", {
                    required: "Required",
                    min: { value: 2000, message: "After 2000" },
                    setValueAs: (v) => v === undefined || v === null ? "" : String(v),
                  })}
                  placeholder="e.g. 2024"
                />
                {errors.fee_year && <p className="text-rose-500 text-xs mt-1 absolute">{errors.fee_year.message}</p>}
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-8 flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                ) : (
                  <><Save className="w-4 h-4" /> Save Fee Record</>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddFees;
