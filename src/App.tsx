import { useState } from "react";
import { AuthProvider, useAuth } from "./auth";
import Sidebar from "./components/Sidebar";
import type { ViewKey } from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import ResumeAnalysis from "./components/ResumeAnalysis";
import Roadmap from "./components/Roadmap";
import Opportunities from "./components/Opportunities";
import Applications from "./components/Applications";
import MentorView from "./components/MentorView";
import AdminView from "./components/AdminView";
import MockInterview from "./components/MockInterview";

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

function AppShell() {
  const { user, loading } = useAuth();
  const [view, setView] = useState<ViewKey>("dashboard");

  if (loading)
    return (
      <div className="flex h-full w-full items-center justify-center bg-paper">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-emerald" />
      </div>
    );

  if (!user) return <div className="h-full w-full"><Login /></div>;

  function renderView() {
    if (view === "dashboard") {
      if (user!.role === "mentor") return <MentorView />;
      if (user!.role === "admin") return <AdminView />;
      return <Dashboard onNavigate={setView} />;
    }
    switch (view) {
      case "resume":
        return <ResumeAnalysis />;
      case "roadmap":
        return <Roadmap />;
      case "interview":
        return <MockInterview />;
      case "opportunities":
        return <Opportunities />;
      case "applications":
        return <Applications />;
      default:
        return <Dashboard onNavigate={setView} />;
    }
  }

  return (
    <div className="flex h-full w-full overflow-hidden bg-paper">
      <Sidebar active={view} onChange={setView} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar view={view} />
        <main className="flex-1 overflow-y-auto px-6 py-6 lg:px-10 lg:py-8">
          <div className="mx-auto w-full max-w-6xl">{renderView()}</div>
        </main>
      </div>
    </div>
  );
}
