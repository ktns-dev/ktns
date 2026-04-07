import { Header } from "@/components/dashboard/Header";
import ModernStudentTable from "@/components/Students/StudentTable";
import React from "react";

const StudentsPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 -m-4">
      <Header value="Students" subtitle="Manage student records and enrollment" />
      <div className="p-4 sm:p-6">
        <ModernStudentTable />
      </div>
    </div>
  );
};

export default StudentsPage;