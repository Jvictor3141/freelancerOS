import { Route, Routes } from "react-router-dom";
import { DashboardLayout } from "./layout/DashboardLayout";
import { ClientsPage } from "./pages/ClientsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { PaymentsPage } from "./pages/PaymentsPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { ProposalsPage } from "./pages/ProposalsPage";
import { SettingsPage } from "./pages/SettingsPage";

function App() {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/clientes" element={<ClientsPage />} />
        <Route path="/projetos" element={<ProjectsPage />} />
        <Route path="/pagamentos" element={<PaymentsPage />} />
        <Route path="/propostas" element={<ProposalsPage />} />
        <Route path="/configuracoes" element={<SettingsPage />} />
      </Routes>
    </DashboardLayout>
  );
}

export default App;
