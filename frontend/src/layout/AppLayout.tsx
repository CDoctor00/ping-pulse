import { Outlet } from "react-router-dom";
import { useAlarms, useSettings, useHosts } from "@/hooks";
import { Sidebar } from "./Sidebar";

export const AppLayout = () => {
  useHosts();
  useAlarms();
  useSettings();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
