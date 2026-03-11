import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-h-screen gradient-bg" style={{ marginLeft: "var(--sidebar-width)" }}>
        <div className="hidden max-md:block" style={{ marginLeft: "calc(-1 * var(--sidebar-width))" }} />
        {children}
      </main>
      {/* Remove margin on mobile */}
      <style>{`
        @media (max-width: 767px) {
          main { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  );
}
