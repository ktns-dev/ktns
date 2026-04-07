"use client";
import React, { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, Pencil, CheckCircle2, XCircle, Clock, LogOut } from "lucide-react";
import { AttendanceAPI as API } from "@/api/Attendance/AttendanceAPI";
import { MarkAttUpdate } from "@/models/markattendace/markattendance";

interface EditAttendanceProps {
  attendanceId: number;
  onUpdate: () => void;
}

interface APIResponse {
  status: number;
  data: { message?: string };
}

type StatusKey = "present" | "absent" | "late" | "leave";

const STATUS_OPTIONS: { key: StatusKey; label: string; icon: React.ReactNode; value: number; ring: string; bg: string; text: string }[] = [
  { key: "present", label: "Present", icon: <CheckCircle2 className="w-5 h-5" />, value: 1, ring: "ring-emerald-400",  bg: "bg-emerald-50 dark:bg-emerald-900/30",  text: "text-emerald-700 dark:text-emerald-400" },
  { key: "absent",  label: "Absent",  icon: <XCircle       className="w-5 h-5" />, value: 2, ring: "ring-rose-400",    bg: "bg-rose-50 dark:bg-rose-900/30",        text: "text-rose-700 dark:text-rose-400"       },
  { key: "late",    label: "Late",    icon: <Clock         className="w-5 h-5" />, value: 3, ring: "ring-amber-400",  bg: "bg-amber-50 dark:bg-amber-900/30",      text: "text-amber-700 dark:text-amber-400"    },
  { key: "leave",   label: "Leave",   icon: <LogOut        className="w-5 h-5" />, value: 4, ring: "ring-blue-400",   bg: "bg-blue-50 dark:bg-blue-900/30",        text: "text-blue-700 dark:text-blue-400"      },
];

const EditAttendance = ({ attendanceId, onUpdate }: EditAttendanceProps) => {
  const { handleSubmit, reset } = useForm<MarkAttUpdate>();
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<StatusKey | null>(null);

  const handleFormSubmit = async () => {
    if (!selected) {
      toast.error("Please select an attendance status", { position: "bottom-center" });
      return;
    }
    setLoading(true);
    try {
      const option = STATUS_OPTIONS.find(o => o.key === selected)!;
      const updateData: MarkAttUpdate = {
        attendance_id: attendanceId,
        attendance_value_id: option.value,
        updated_at: new Date(),
      };
      const response = (await API.Update(updateData.attendance_id, updateData)) as APIResponse;
      if (response.status === 200) {
        setOpen(false);
        reset();
        setSelected(null);
        toast.success("Attendance updated!", { position: "bottom-center", duration: 3000 });
        onUpdate();
      } else {
        throw new Error(response.data.message || "Failed to update");
      }
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to update attendance", { position: "bottom-center" });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) { setOpen(false); setSelected(null); reset(); }
  };

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
      >
        <Pencil className="w-3.5 h-3.5" />
        Edit
      </button>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-sm p-0 gap-0 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl bg-white dark:bg-slate-900">
          {/* Accent bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500 rounded-t-2xl" />

          <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                <Pencil className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Edit Attendance
                </DialogTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Record #{String(attendanceId).padStart(4, "0")}
                </p>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="px-6 py-5 space-y-5">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                Select Status
              </p>
              <div className="grid grid-cols-2 gap-2">
                {STATUS_OPTIONS.map(opt => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setSelected(opt.key)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                      selected === opt.key
                        ? `${opt.bg} ${opt.text} border-current ring-1 ${opt.ring}`
                        : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <span className={selected === opt.key ? opt.text : "text-slate-400"}>{opt.icon}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-1">
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
                disabled={loading || !selected}
                className="flex-1 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : "Save Changes"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditAttendance;
