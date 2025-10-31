import React from "react";
import BottomNav from "@/components/BottomNav";

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className="flex flex-col"
      style={{ height: "calc(var(--vh, 1vh) * 100)" }}
    >
      {/* Scrollable content */}
      <main className="flex-1 overflow-auto">{children}</main>

      {/* Bottom nav fixed with safe-area support */}
      <div className="pb-[env(safe-area-inset-bottom)]">
        <BottomNav />
      </div>
    </div>
  );
};

export default ProtectedLayout;
