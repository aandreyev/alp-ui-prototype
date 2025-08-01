export interface Matter {
  id: number
  name: string
  client: ClientInfo
  status: MatterStatus
  priority: Priority
  coordinator: User
  progress: Progress
  estimatedBudget: number
  actualCosts: number
  dueDate: string
  offerings: Offering[]
  outcomes?: Outcome[]
}

export interface Client {
  id: number
  name: string
  email: string
  phone?: string
  address?: Address
  contactPerson?: string
  matters?: Matter[]
  totalBilled?: number
  status: 'Active' | 'Inactive' | 'Prospect'
  createdDate: string
  lastActivity?: string
}

export interface Invoice {
  id: number
  invoiceNumber: string
  client: ClientInfo
  matter?: Matter
  status: InvoiceStatus
  type: 'FixedPrice' | 'TimeEntry'
  lineItems: InvoiceLineItem[]
  issueDate: string
  dueDate: string
  paidDate?: string
  subtotal: number
  gstAmount: number
  totalAmount: number
  paymentTerms: string
  notes?: string
}

export interface TimeEntry {
  id: number
  matter?: Matter
  project?: Project
  user: User
  description: string
  date: string
  startTime?: string
  endTime?: string
  duration: number // in minutes
  rate: number
  billableType: BillableType
  status: TimeEntryStatus
  isLocked: boolean
  invoiceId?: number
}

export interface ClientInfo {
  name: string
  email: string
  phone?: string
}

export interface Address {
  street: string
  city: string
  state: string
  postcode: string
  country: string
}

export interface InvoiceLineItem {
  id: number
  description: string
  quantity: number
  rate: number
  amount: number
  gstRate: number
  gstAmount: number
}

export interface Project {
  id: number
  name: string
  description?: string
  status: ProjectStatus
  startDate: string
  endDate?: string
  budget?: number
  actualCosts?: number
}

export type MatterStatus = 'Open' | 'Closed' | 'On Hold' | 'Cancelled'
export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent'
export type InvoiceStatus = 'Draft' | 'Pending Approval' | 'Approved' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled'
export type BillableType = 'Billable' | 'Non-Billable' | 'Non-Chargeable' | 'Pro Bono'
export type TimeEntryStatus = 'Draft' | 'Submitted' | 'Approved' | 'Invoiced'
export type ProjectStatus = 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Cancelled'

export interface User {
  name: string
  initials: string
  email: string
  avatar?: string
}

export interface Progress {
  completed: number
  total: number
  percentage?: number
}

export interface Offering {
  name: string
  color: string
  id?: number
}

export interface Outcome {
  id: number
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'blocked'
}
