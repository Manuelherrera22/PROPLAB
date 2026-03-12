import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET() {
  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    env: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ SET" : "❌ MISSING",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? `✅ SET (${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...)` : "❌ MISSING",
      SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY ? "✅ SET" : "❌ MISSING",
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? "✅ SET" : "❌ MISSING",
    },
  };

  try {
    const supabase = createServerClient();
    
    // Test each table
    const tables = ["workspaces", "properties", "leads", "deals", "smart_alerts", "knowledge_entries"];
    const tableResults: Record<string, unknown> = {};
    
    for (const table of tables) {
      const { data, error, count } = await supabase
        .from(table)
        .select("*", { count: "exact", head: false })
        .limit(2);
      
      tableResults[table] = {
        count: data?.length ?? 0,
        error: error?.message ?? null,
        sample: data?.slice(0, 1).map((row: Record<string, unknown>) => {
          // Only return id and title/name for brevity
          const { id, title, name, user_name } = row as { id?: string; title?: string; name?: string; user_name?: string };
          return { id, title: title || name || user_name || "—" };
        }),
      };
    }
    
    diagnostics.tables = tableResults;

    // Test workspace-specific query
    const { data: ws } = await supabase.from("workspaces").select("id, name").limit(1);
    if (ws && ws.length > 0) {
      const wsId = ws[0].id;
      diagnostics.activeWorkspace = { id: wsId, name: ws[0].name };
      
      const { data: props, error: propsErr } = await supabase
        .from("properties")
        .select("id, title, price, status")
        .eq("workspace_id", wsId)
        .limit(3);
      
      diagnostics.workspaceProperties = {
        count: props?.length ?? 0,
        error: propsErr?.message ?? null,
        data: props,
      };
    }

    diagnostics.status = "✅ CONNECTED";
  } catch (err) {
    diagnostics.status = "❌ ERROR";
    diagnostics.error = (err as Error).message;
  }

  return NextResponse.json(diagnostics, { status: 200 });
}
