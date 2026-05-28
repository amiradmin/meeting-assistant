import React from "react";
import WorkOrdersTable from "../components/cmms/WorkOrdersTable";
import PMSchedulesTable from "../components/cmms/PMSchedulesTable";

export default function CMMSDashboard() {
  return (
    <div className="p-4 space-y-8">
      <h1 className="text-2xl font-bold mb-4">داشبورد CMMS</h1>
      <WorkOrdersTable />
      <PMSchedulesTable />
    </div>
  );
}
