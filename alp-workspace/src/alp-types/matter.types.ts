// ALP Matter Types - Based on actual ALP database schema
// These interfaces should match ALP's real data structures

export interface ALPMatter {
  matter_id: number;
  matter_name: string;
  matter_number: string;
  client_id: number;
  matter_status: 'open' | 'closed' | 'pending' | 'on_hold' | 'cancelled';
  matter_type: string;
  priority_level: 'low' | 'medium' | 'high' | 'urgent';
  assigned_solicitor_id: number;
  created_date: string;
  due_date: string | null;
  estimated_budget: number | null;
  actual_costs: number;
  billable_hours: number;
  description: string | null;
  notes: string | null;
  last_updated: string;
  updated_by: number;
}

export interface ALPClient {
  client_id: number;
  client_name: string;
  client_type: 'individual' | 'company' | 'trust' | 'partnership';
  contact_person: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postcode: string | null;
  abn: string | null;
  client_status: 'active' | 'inactive' | 'prospect';
  created_date: string;
  total_billed: number;
  payment_terms: string | null;
  notes: string | null;
}

export interface ALPSolicitor {
  solicitor_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  position: string;
  department: string | null;
  hourly_rate: number;
  is_active: boolean;
  initials: string;
}

export interface ALPTimeEntry {
  time_entry_id: number;
  matter_id: number;
  solicitor_id: number;
  entry_date: string;
  hours: number;
  description: string;
  billable: boolean;
  hourly_rate: number;
  total_amount: number;
  created_date: string;
  invoice_id: number | null;
}

export interface ALPInvoice {
  invoice_id: number;
  matter_id: number;
  client_id: number;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  subtotal: number;
  gst_amount: number;
  total_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  payment_date: string | null;
  notes: string | null;
  created_date: string;
}

export interface ALPTask {
  task_id: number;
  matter_id: number;
  task_name: string;
  description: string | null;
  assigned_to: number;
  due_date: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_date: string;
  completed_date: string | null;
}

// API Response Types
export interface ALPMatterResponse {
  success: boolean;
  data: ALPMatter;
  message?: string;
}

export interface ALPMattersListResponse {
  success: boolean;
  data: ALPMatter[];
  pagination?: {
    current_page: number;
    total_pages: number;
    total_records: number;
    per_page: number;
  };
  message?: string;
}

export interface ALPClientResponse {
  success: boolean;
  data: ALPClient;
  message?: string;
}

export interface ALPClientsListResponse {
  success: boolean;
  data: ALPClient[];
  pagination?: {
    current_page: number;
    total_pages: number;
    total_records: number;
    per_page: number;
  };
  message?: string;
}

// Form Data Types
export interface ALPMatterFormData {
  matter_name: string;
  matter_number?: string;
  client_id: number;
  matter_type: string;
  priority_level: 'low' | 'medium' | 'high' | 'urgent';
  assigned_solicitor_id: number;
  due_date?: string;
  estimated_budget?: number;
  description?: string;
  notes?: string;
}

export interface ALPClientFormData {
  client_name: string;
  client_type: 'individual' | 'company' | 'trust' | 'partnership';
  contact_person?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postcode?: string;
  abn?: string;
  payment_terms?: string;
  notes?: string;
}

// Filter and Search Types
export interface ALPMatterFilters {
  status?: string[];
  priority?: string[];
  solicitor_id?: number[];
  client_id?: number[];
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface ALPClientFilters {
  status?: string[];
  client_type?: string[];
  search?: string;
}

// Statistics Types
export interface ALPMatterStats {
  total_matters: number;
  open_matters: number;
  closed_matters: number;
  pending_matters: number;
  urgent_matters: number;
  total_estimated_budget: number;
  total_actual_costs: number;
  average_completion_time: number;
}

export interface ALPClientStats {
  total_clients: number;
  active_clients: number;
  prospect_clients: number;
  total_billed: number;
  average_billing_per_client: number;
}
