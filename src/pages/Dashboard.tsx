
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import UserDashboard from "@/components/dashboards/UserDashboard";
import RunnerDashboard from "@/components/dashboards/RunnerDashboard";
import AdminDashboard from "@/components/dashboards/AdminDashboard";

const Dashboard = () => {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  switch (userRole) {
    case 'admin':
      return <AdminDashboard />;
    case 'runner':
      return <RunnerDashboard />;
    case 'user':
    default:
      return <UserDashboard />;
  }
};

export default Dashboard;
