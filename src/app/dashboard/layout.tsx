import Sidebar from "@/components/Sidebar";
import AutoFeed from "@/components/AutoFeed";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <AutoFeed />
      <main className="flex-1 min-h-screen gradient-bg" style={{ marginLeft: "var(--sidebar-width)" }}>
        {children}
      </main>
      <style>{`
        @media (max-width: 767px) {
          main { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  );
}
