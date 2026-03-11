// ─── Admin API Types ─── 

export interface AdminAgent {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  customers_count: number;
  orders_count: number;
  total_commissions: number;
  coupon?: string;
}

export interface AdminAgentDetail {
  agent: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    coupon?: string;
    commission_plan?: string | { name?: string; [key: string]: unknown };
  };
  stats: {
    customers_count: number;
    orders_count: number;
    total_commissions: number;
  };
  customers: AdminCustomer[];
  orders: AdminOrder[];
  commissions_details: AdminCommissionDetail[];
}

export interface AdminCustomer {
  id: number;
  first_name?: string;
  last_name?: string;
  name?: string;
  email: string;
  created_at?: string;
}

export interface AdminOrder {
  id: number;
  total: number;
  status?: string;
  created_at?: string;
  customer_name?: string;
}

export interface AdminCommissionDetail {
  id: number;
  amount: number;
  type: string;
  order_id?: number;
  created_at?: string;
}

export interface AdminAgentsResponse {
  data: AdminAgent[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// ─── Content Types ───

export interface AdminContent {
  id: number;
  title: string;
  description?: string;
  file_path: string;
  gender: "male" | "female" | "all";
  // API returns nested arrays (same shape as partner media library)
  categories?: { id: number; name: string }[];
  filters?: { id: number; name: string }[];
  // flat fallbacks (some endpoints may return these instead)
  category?: string;
  tags?: string[];
  user_id: number;
  created_at?: string;
}

export interface CreateContentPayload {
  user_id: number;
  title: string;
  description?: string;
  file: File;
  gender: "male" | "female" | "all";
  category: string;
  tags: string[];
  canva_design_id?: string;
  canva_project_id?: string;
  canva_url?: string;
  canva_data?: string;
}

export interface UpdateContentPayload {
  title?: string;
  description?: string;
  file?: File;
  gender?: "male" | "female" | "all";
  category?: string;
  tags?: string[];
}
