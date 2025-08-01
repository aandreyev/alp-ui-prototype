<template>
  <div>
    <!-- Modal Overlay -->
    <div
      v-if="modal.isOpen"
      class="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      @click="closeModal"
    >
      <!-- Modal Content -->
      <div
        class="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg"
        @click.stop
      >
        <!-- Modal Header -->
        <div class="flex flex-col space-y-1.5 text-center sm:text-left">
          <h2 class="text-lg font-semibold leading-none tracking-tight">
            {{ getModalTitle() }}
          </h2>
          <p v-if="getModalDescription()" class="text-sm text-muted-foreground">
            {{ getModalDescription() }}
          </p>
        </div>

        <!-- Modal Body -->
        <div class="grid gap-4 py-4">
          <!-- Create/Edit Matter Modal -->
          <div v-if="modal.type?.includes('Matter')">
            <MatterForm
              :matter="modal.props.matter"
              :mode="getFormMode()"
              @save="handleMatterSave"
              @cancel="closeModal"
            />
          </div>

          <!-- Create/Edit Client Modal -->
          <div v-else-if="modal.type?.includes('Client')">
            <ClientForm
              :client="modal.props.client"
              :mode="getFormMode()"
              @save="handleClientSave"
              @cancel="closeModal"
            />
          </div>

          <!-- Create/Edit Invoice Modal -->
          <div v-else-if="modal.type?.includes('Invoice')">
            <InvoiceForm
              :invoice="modal.props.invoice"
              :mode="getFormMode()"
              @save="handleInvoiceSave"
              @cancel="closeModal"
            />
          </div>

          <!-- Create/Edit Time Entry Modal -->
          <div v-else-if="modal.type?.includes('TimeEntry')">
            <TimeEntryForm
              :timeEntry="modal.props.timeEntry"
              :mode="getFormMode()"
              @save="handleTimeEntrySave"
              @cancel="closeModal"
            />
          </div>

          <!-- Confirm Delete Modal -->
          <div v-else-if="modal.type === 'ConfirmDelete'">
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle class="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 class="font-medium">Confirm Deletion</h3>
                  <p class="text-sm text-muted-foreground">
                    Are you sure you want to delete "{{ modal.props.itemName }}"? This action cannot be undone.
                  </p>
                </div>
              </div>
              <div class="flex justify-end gap-2">
                <Button variant="outline" @click="closeModal">
                  Cancel
                </Button>
                <Button variant="destructive" @click="handleDelete">
                  Delete
                </Button>
              </div>
            </div>
          </div>

          <!-- View Details Modal -->
          <div v-else-if="modal.type?.includes('View')">
            <div class="space-y-4">
              <!-- Matter Details -->
              <div v-if="modal.type === 'ViewMatter' && modal.props.matter">
                <MatterDetails :matter="modal.props.matter" />
              </div>
              
              <!-- Client Details -->
              <div v-else-if="modal.type === 'ViewClient' && modal.props.client">
                <ClientDetails :client="modal.props.client" />
              </div>
              
              <!-- Invoice Details -->
              <div v-else-if="modal.type === 'ViewInvoice' && modal.props.invoice">
                <InvoiceDetails :invoice="modal.props.invoice" />
              </div>
              
              <!-- Time Entry Details -->
              <div v-else-if="modal.type === 'ViewTimeEntry' && modal.props.timeEntry">
                <TimeEntryDetails :timeEntry="modal.props.timeEntry" />
              </div>
            </div>
          </div>
        </div>

        <!-- Close Button -->
        <button
          class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          @click="closeModal"
        >
          <X class="h-4 w-4" />
          <span class="sr-only">Close</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePrototypeStore } from '@/stores/prototype'
import { Button } from '@/lib/registry/new-york/ui/button'
import { X, AlertTriangle } from 'lucide-vue-next'
import type { Matter, Client, Invoice, TimeEntry } from '@/types'

// Import form components (these will be created next)
import MatterForm from '@/components/forms/MatterForm.vue'
import ClientForm from '@/components/forms/ClientForm.vue'
import InvoiceForm from '@/components/forms/InvoiceForm.vue'
import TimeEntryForm from '@/components/forms/TimeEntryForm.vue'

// Import detail components (these will be created next)
import MatterDetails from '@/components/details/MatterDetails.vue'
import ClientDetails from '@/components/details/ClientDetails.vue'
import InvoiceDetails from '@/components/details/InvoiceDetails.vue'
import TimeEntryDetails from '@/components/details/TimeEntryDetails.vue'

const store = usePrototypeStore()
const modal = computed(() => store.modal)

const closeModal = () => {
  store.closeModal()
}

const getModalTitle = () => {
  if (!modal.value.type) return ''
  
  const typeMap: Record<string, string> = {
    'CreateMatter': 'Create New Matter',
    'EditMatter': 'Edit Matter',
    'ViewMatter': 'Matter Details',
    'CreateClient': 'Create New Client',
    'EditClient': 'Edit Client',
    'ViewClient': 'Client Details',
    'CreateInvoice': 'Create New Invoice',
    'EditInvoice': 'Edit Invoice',
    'ViewInvoice': 'Invoice Details',
    'CreateTimeEntry': 'Create Time Entry',
    'EditTimeEntry': 'Edit Time Entry',
    'ViewTimeEntry': 'Time Entry Details',
    'ConfirmDelete': 'Confirm Deletion'
  }
  
  return typeMap[modal.value.type] || modal.value.type
}

const getModalDescription = () => {
  if (!modal.value.type) return ''
  
  const descriptionMap: Record<string, string> = {
    'CreateMatter': 'Create a new legal matter for a client',
    'EditMatter': 'Update matter information and settings',
    'CreateClient': 'Add a new client to the system',
    'EditClient': 'Update client information and details',
    'CreateInvoice': 'Generate a new invoice for time entries or fixed-price work',
    'EditInvoice': 'Modify invoice details and line items',
    'CreateTimeEntry': 'Log time spent on matters or projects',
    'EditTimeEntry': 'Update time entry details and billing information'
  }
  
  return descriptionMap[modal.value.type] || ''
}

const getFormMode = () => {
  if (!modal.value.type) return 'create'
  return modal.value.type.startsWith('Create') ? 'create' : 'edit'
}

// Event Handlers
const handleMatterSave = (matter: Matter) => {
  // Simulate save operation
  store.setLoading(true, 'Saving matter...')
  
  setTimeout(() => {
    store.setLoading(false)
    store.addNotification('success', 'Matter Saved', `Matter "${matter.name}" has been saved successfully.`)
    store.selectMatter(matter)
    closeModal()
  }, 1000)
}

const handleClientSave = (client: Client) => {
  // Simulate save operation
  store.setLoading(true, 'Saving client...')
  
  setTimeout(() => {
    store.setLoading(false)
    store.addNotification('success', 'Client Saved', `Client "${client.name}" has been saved successfully.`)
    store.selectClient(client)
    closeModal()
  }, 1000)
}

const handleInvoiceSave = (invoice: Invoice) => {
  // Simulate save operation
  store.setLoading(true, 'Saving invoice...')
  
  setTimeout(() => {
    store.setLoading(false)
    store.addNotification('success', 'Invoice Saved', `Invoice ${invoice.invoiceNumber} has been saved successfully.`)
    store.selectInvoice(invoice)
    closeModal()
  }, 1000)
}

const handleTimeEntrySave = (timeEntry: TimeEntry) => {
  // Simulate save operation
  store.setLoading(true, 'Saving time entry...')
  
  setTimeout(() => {
    store.setLoading(false)
    store.addNotification('success', 'Time Entry Saved', 'Time entry has been saved successfully.')
    store.selectTimeEntry(timeEntry)
    closeModal()
  }, 1000)
}

const handleDelete = () => {
  // Simulate delete operation
  store.setLoading(true, 'Deleting item...')
  
  setTimeout(() => {
    store.setLoading(false)
    store.addNotification('success', 'Item Deleted', `"${modal.value.props.itemName}" has been deleted successfully.`)
    closeModal()
    
    // Execute callback if provided
    if (modal.value.props.onConfirm) {
      modal.value.props.onConfirm()
    }
  }, 1000)
}
</script>
