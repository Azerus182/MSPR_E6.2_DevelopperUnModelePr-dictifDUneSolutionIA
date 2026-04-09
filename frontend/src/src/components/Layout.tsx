import { Outlet } from "react-router";
import { BottomNav } from "./BottomNav";

export function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F3F4F6] to-[#E5E7EB] flex items-center justify-center p-4">
      {/* Cadre mobile */}
      <div className="w-full max-w-md min-h-screen bg-[#FFFEF9] shadow-2xl rounded-3xl overflow-hidden flex flex-col relative">
        <main className="flex-1 pb-20 overflow-y-auto">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
}