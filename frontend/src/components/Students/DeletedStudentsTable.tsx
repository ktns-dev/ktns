'use client';

import { useState } from 'react';
import { RotateCcw, Loader2, UserX, AlertCircle } from 'lucide-react';
import { StudentAPI } from '@/api/Student/StudentsAPI';

interface DeletedStudent {
  student_id: number;
  student_name: string;
  class_name: string;
  reason: string;
  deleted_by: number;
  deleted_by_name?: string;
  deleted_at: string;
}

interface DeletedStudentsTableProps {
  students: DeletedStudent[];
  onRestoreSuccess: () => void;
}

export default function DeletedStudentsTable({
  students,
  onRestoreSuccess,
}: DeletedStudentsTableProps) {
  const [restoringId, setRestoringId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const handleRestore = async (deletedRecordId: number, name: string) => {
    const confirmed = window.confirm(`Restore "${name}" back to active students?`);
    if (!confirmed) return;

    setRestoringId(deletedRecordId);
    setError('');
    try {
      await StudentAPI.RestoreStudent(deletedRecordId);
      onRestoreSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to restore student.');
    } finally {
      setRestoringId(null);
    }
  };

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
          <UserX className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-slate-600 dark:text-slate-300 font-semibold text-base">No deleted students</p>
        <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">All students are currently active.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-800 dark:bg-slate-950 text-slate-100">
              <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider w-14">#</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Student Name</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Class</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Reason</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Deleted By</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Deleted At</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider w-28">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
            {students.map((student, index) => (
              <tr key={student.student_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 font-medium">{index + 1}</td>
                <td className="px-4 py-3.5">
                  <span className="font-semibold text-slate-800 dark:text-slate-100">{student.student_name}</span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-100 dark:border-indigo-800">
                    {student.class_name}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 max-w-xs">
                  <span className="line-clamp-2">{student.reason}</span>
                </td>
                <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                  {student.deleted_by_name || `User #${student.deleted_by}`}
                </td>
                <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {new Date(student.deleted_at).toLocaleDateString('en-GB', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })}
                </td>
                <td className="px-4 py-3.5">
                  <button
                    onClick={() => handleRestore(student.student_id, student.student_name)}
                    disabled={restoringId === student.student_id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {restoringId === student.student_id ? (
                      <><Loader2 className="w-3 h-3 animate-spin" /> Restoring…</>
                    ) : (
                      <><RotateCcw className="w-3 h-3" /> Restore</>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden space-y-3">
        {students.map((student, index) => (
          <div
            key={student.student_id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm space-y-3"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-400 font-medium">#{index + 1}</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">{student.student_name}</p>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-100 dark:border-indigo-800">
                {student.class_name}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-slate-400 font-medium uppercase tracking-wide text-[10px]">Reason</p>
                <p className="text-slate-700 dark:text-slate-300 mt-0.5 line-clamp-2">{student.reason}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium uppercase tracking-wide text-[10px]">Deleted By</p>
                <p className="text-slate-700 dark:text-slate-300 mt-0.5">{student.deleted_by_name || `User #${student.deleted_by}`}</p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-400 font-medium uppercase tracking-wide text-[10px]">Deleted At</p>
                <p className="text-slate-700 dark:text-slate-300 mt-0.5">
                  {new Date(student.deleted_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleRestore(student.student_id, student.student_name)}
              disabled={restoringId === student.student_id}
              className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-sm font-semibold rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors disabled:opacity-50"
            >
              {restoringId === student.student_id ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Restoring…</>
              ) : (
                <><RotateCcw className="w-4 h-4" /> Restore Student</>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
