import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Card from "@/components/Card";

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-3 gap-6">
      <Card title="Datasets Subidos" value={12} />
      <Card title="Usuarios Activos" value={5} />
      <Card title="Último Ingreso" value="Hoy" />
    </div>
  );}