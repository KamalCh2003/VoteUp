// src/components/admin/AdminHome.jsx
import AdminLayout from "./AdminLayout";
import DashboardOverview from "./DashboardOverview";

export default function AdminHome() {
  return (
    <AdminLayout>
      <DashboardOverview />
    </AdminLayout>
  );
}