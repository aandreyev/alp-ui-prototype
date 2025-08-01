import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Matter, Client, Invoice, TimeEntry } from '@/types'

export type ModalType = 
  | 'CreateMatter' 
  | 'EditMatter' 
  | 'ViewMatter'
  | 'CreateClient'
  | 'EditClient'
  | 'ViewClient'
  | 'CreateInvoice'
  | 'EditInvoice'
  | 'ViewInvoice'
  | 'CreateTimeEntry'
  | 'EditTimeEntry'
  | 'ViewTimeEntry'
  | 'ConfirmDelete'

export interface ModalState {
  isOpen: boolean
  type: ModalType | null
  props: Record<string, any>
}

export interface NavigationState {
  currentView: string
  breadcrumbs: Array<{ label: string; path: string }>
  history: string[]
}

export const usePrototypeStore = defineStore('prototype', () => {
  // Modal State
  const modal = ref<ModalState>({
    isOpen: false,
    type: null,
    props: {}
  })

  // Navigation State
  const navigation = ref<NavigationState>({
    currentView: 'dashboard',
    breadcrumbs: [{ label: 'Dashboard', path: 'dashboard' }],
    history: ['dashboard']
  })

  // Selected Items State
  const selectedMatter = ref<Matter | null>(null)
  const selectedClient = ref<Client | null>(null)
  const selectedInvoice = ref<Invoice | null>(null)
  const selectedTimeEntry = ref<TimeEntry | null>(null)

  // Loading States
  const isLoading = ref(false)
  const loadingMessage = ref('')

  // Notification State
  const notifications = ref<Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
    timestamp: Date
  }>>([])

  // Modal Actions
  const openModal = (type: ModalType, props: Record<string, any> = {}) => {
    modal.value = {
      isOpen: true,
      type,
      props
    }
  }

  const closeModal = () => {
    modal.value = {
      isOpen: false,
      type: null,
      props: {}
    }
  }

  // Navigation Actions
  const navigateTo = (view: string, label?: string) => {
    navigation.value.currentView = view
    navigation.value.history.push(view)
    
    if (label) {
      navigation.value.breadcrumbs.push({ label, path: view })
    }
  }

  const navigateBack = () => {
    if (navigation.value.history.length > 1) {
      navigation.value.history.pop()
      const previousView = navigation.value.history[navigation.value.history.length - 1]
      navigation.value.currentView = previousView
      navigation.value.breadcrumbs.pop()
    }
  }

  const resetNavigation = () => {
    navigation.value = {
      currentView: 'dashboard',
      breadcrumbs: [{ label: 'Dashboard', path: 'dashboard' }],
      history: ['dashboard']
    }
  }

  // Selection Actions
  const selectMatter = (matter: Matter) => {
    selectedMatter.value = matter
  }

  const selectClient = (client: Client) => {
    selectedClient.value = client
  }

  const selectInvoice = (invoice: Invoice) => {
    selectedInvoice.value = invoice
  }

  const selectTimeEntry = (timeEntry: TimeEntry) => {
    selectedTimeEntry.value = timeEntry
  }

  const clearSelections = () => {
    selectedMatter.value = null
    selectedClient.value = null
    selectedInvoice.value = null
    selectedTimeEntry.value = null
  }

  // Loading Actions
  const setLoading = (loading: boolean, message = '') => {
    isLoading.value = loading
    loadingMessage.value = message
  }

  // Notification Actions
  const addNotification = (
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message: string
  ) => {
    const notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: new Date()
    }
    notifications.value.unshift(notification)
    
    // Auto-remove after 5 seconds for success/info
    if (type === 'success' || type === 'info') {
      setTimeout(() => {
        removeNotification(notification.id)
      }, 5000)
    }
  }

  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const clearNotifications = () => {
    notifications.value = []
  }

  // Computed Properties
  const hasSelection = computed(() => 
    selectedMatter.value || selectedClient.value || selectedInvoice.value || selectedTimeEntry.value
  )

  const canNavigateBack = computed(() => navigation.value.history.length > 1)

  const currentBreadcrumb = computed(() => 
    navigation.value.breadcrumbs[navigation.value.breadcrumbs.length - 1]
  )

  const unreadNotifications = computed(() => 
    notifications.value.filter(n => n.type === 'error' || n.type === 'warning').length
  )

  return {
    // State
    modal,
    navigation,
    selectedMatter,
    selectedClient,
    selectedInvoice,
    selectedTimeEntry,
    isLoading,
    loadingMessage,
    notifications,

    // Actions
    openModal,
    closeModal,
    navigateTo,
    navigateBack,
    resetNavigation,
    selectMatter,
    selectClient,
    selectInvoice,
    selectTimeEntry,
    clearSelections,
    setLoading,
    addNotification,
    removeNotification,
    clearNotifications,

    // Computed
    hasSelection,
    canNavigateBack,
    currentBreadcrumb,
    unreadNotifications
  }
})
