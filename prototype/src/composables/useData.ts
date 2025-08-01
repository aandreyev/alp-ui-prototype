import { ref, computed } from 'vue'
import type { Matter, Client, Invoice, TimeEntry } from '@/types'

// Import JSON data
import sampleMatters from '@/data/sample-matters.json'
import sampleClients from '@/data/sample-clients.json'

export function useData() {
  // Reactive data stores
  const matters = ref<Matter[]>(sampleMatters as Matter[])
  const clients = ref<Client[]>(sampleClients as Client[])
  const invoices = ref<Invoice[]>([])
  const timeEntries = ref<TimeEntry[]>([])

  // Computed getters
  const getMatters = computed(() => matters.value)
  const getClients = computed(() => clients.value)
  const getInvoices = computed(() => invoices.value)
  const getTimeEntries = computed(() => timeEntries.value)

  // Matter operations
  const getMatterById = (id: number) => matters.value.find(m => m.id === id)
  const addMatter = (matter: Matter) => {
    matters.value.push(matter)
  }
  const updateMatter = (id: number, updates: Partial<Matter>) => {
    const index = matters.value.findIndex(m => m.id === id)
    if (index !== -1) {
      matters.value[index] = { ...matters.value[index], ...updates }
    }
  }
  const deleteMatter = (id: number) => {
    const index = matters.value.findIndex(m => m.id === id)
    if (index !== -1) {
      matters.value.splice(index, 1)
    }
  }

  // Client operations
  const getClientById = (id: number) => clients.value.find(c => c.id === id)
  const addClient = (client: Client) => {
    clients.value.push(client)
  }
  const updateClient = (id: number, updates: Partial<Client>) => {
    const index = clients.value.findIndex(c => c.id === id)
    if (index !== -1) {
      clients.value[index] = { ...clients.value[index], ...updates }
    }
  }
  const deleteClient = (id: number) => {
    const index = clients.value.findIndex(c => c.id === id)
    if (index !== -1) {
      clients.value.splice(index, 1)
    }
  }

  // Filter functions
  const getMattersByStatus = (status: string) => 
    matters.value.filter(m => m.status === status)
  
  const getMattersByPriority = (priority: string) => 
    matters.value.filter(m => m.priority === priority)
  
  const getClientsByStatus = (status: string) => 
    clients.value.filter(c => c.status === status)

  // Statistics
  const matterStats = computed(() => ({
    total: matters.value.length,
    open: matters.value.filter(m => m.status === 'Open').length,
    closed: matters.value.filter(m => m.status === 'Closed').length,
    onHold: matters.value.filter(m => m.status === 'On Hold').length,
    urgent: matters.value.filter(m => m.priority === 'Urgent').length
  }))

  const clientStats = computed(() => ({
    total: clients.value.length,
    active: clients.value.filter(c => c.status === 'Active').length,
    prospects: clients.value.filter(c => c.status === 'Prospect').length,
    totalBilled: clients.value.reduce((sum, c) => sum + (c.totalBilled || 0), 0)
  }))

  return {
    // Data
    matters,
    clients,
    invoices,
    timeEntries,
    
    // Getters
    getMatters,
    getClients,
    getInvoices,
    getTimeEntries,
    
    // CRUD operations
    getMatterById,
    addMatter,
    updateMatter,
    deleteMatter,
    getClientById,
    addClient,
    updateClient,
    deleteClient,
    
    // Filters
    getMattersByStatus,
    getMattersByPriority,
    getClientsByStatus,
    
    // Statistics
    matterStats,
    clientStats
  }
}
