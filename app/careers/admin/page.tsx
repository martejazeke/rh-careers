import { AdminDashboard } from "./AdminDashboard";
import { AuthGuard } from "./AuthGuard";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Admin Dashboard | Rebus Careers Admin"
}

export default function AdminPage() {
  return (
    <AuthGuard>
      <AdminDashboard />
    </AuthGuard>
  );
}

