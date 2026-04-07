import MarkAttendance from '@/components/Attendance/MarkAttendance';
import { Header } from '@/components/dashboard/Header';
import React from 'react';

const MarkAttendancePage = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 -m-4">
      <Header value="Mark Attendance" subtitle="Record daily student attendance by class" />
      <div className="p-4 sm:p-6">
        <MarkAttendance />
      </div>
    </div>
  );
};

export default MarkAttendancePage;