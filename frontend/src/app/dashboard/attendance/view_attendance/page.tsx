import AttendanceTable from "@/components/Attendance/ViewAttendance";
import { Header } from "@/components/dashboard/Header";
import React from "react";

const ViewAttendancePage = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 -m-4">
      <Header value="View Attendance" subtitle="Search, filter and manage attendance records" />
      <div className="p-4 sm:p-6">
        <AttendanceTable />
      </div>
    </div>
  );
};

export default ViewAttendancePage;
