import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Property = {
  id: string;
  workspace_id: string;
  title: string;
  description: string;
  price: number;
  price_per_m2: number | null;
  location: string;
  neighborhood: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  bedrooms: number;
  bathrooms: number;
  area_m2: number | null;
  has_pool: boolean;
  property_type: string;
  status: string;
  image_url: string;
  gallery: string[] | null;
  source: string;
  source_url: string | null;
  created_at: string;
};

export type Lead = {
  id: string;
  workspace_id: string;
  whatsapp_number: string;
  user_name: string | null;
  email: string | null;
  budget_min: number | null;
  budget_max: number | null;
  budget_info: string | null;
  desired_location: string | null;
  desired_type: string | null;
  buyer_type: string;
  lead_score: number;
  urgency: string;
  source: string;
  raw_message: string | null;
  property_id: string | null;
  property?: Property;
  created_at: string;
};

export type Deal = {
  id: string;
  workspace_id: string;
  lead_id: string | null;
  property_id: string | null;
  title: string;
  stage: string;
  deal_value: number | null;
  commission_pct: number;
  notes: string | null;
  next_action: string | null;
  next_action_date: string | null;
  closed_at: string | null;
  created_at: string;
  lead?: Lead;
  property?: Property;
};

export type MarketListing = {
  id: string;
  title: string | null;
  price: number | null;
  price_per_m2: number | null;
  location: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  bedrooms: number | null;
  area_m2: number | null;
  property_type: string | null;
  source_portal: string | null;
  days_on_market: number;
  is_opportunity: boolean;
  opportunity_score: number | null;
  scraped_at: string;
};

export type SmartAlert = {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

type PropLabStore = {
  // Active workspace
  workspaceId: string;
  workspaceName: string;
  setWorkspace: (id: string, name: string) => void;

  // Properties
  properties: Property[];
  setProperties: (p: Property[]) => void;

  // Leads
  leads: Lead[];
  setLeads: (l: Lead[]) => void;

  // Deals
  deals: Deal[];
  setDeals: (d: Deal[]) => void;

  // Market Listings
  marketListings: MarketListing[];
  setMarketListings: (m: MarketListing[]) => void;

  // Alerts
  alerts: SmartAlert[];
  setAlerts: (a: SmartAlert[]) => void;
  unreadAlerts: number;

  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
};

export const useStore = create<PropLabStore>()(
  persist(
    (set) => ({
      workspaceId: "ae5d1008-34b9-42d4-9522-f0f4edf1c91f",
      workspaceName: "Ecuador Intelligence",
      setWorkspace: (id, name) => set({ workspaceId: id, workspaceName: name }),

      properties: [],
      setProperties: (properties) => set({ properties }),

      leads: [],
      setLeads: (leads) => set({ leads }),

      deals: [],
      setDeals: (deals) => set({ deals }),

      marketListings: [],
      setMarketListings: (marketListings) => set({ marketListings }),

      alerts: [],
      setAlerts: (alerts) =>
        set({
          alerts,
          unreadAlerts: alerts.filter((a) => !a.is_read).length,
        }),
      unreadAlerts: 0,

      sidebarOpen: false,
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    }),
    {
      name: "proplab-store",
      partialize: (state) => ({
        workspaceId: state.workspaceId,
        workspaceName: state.workspaceName,
      }),
    }
  )
);
