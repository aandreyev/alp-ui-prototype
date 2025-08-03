import { ref, computed, watch } from 'vue'
import type { Resource, ResourceType } from '@/alp-types/admin-resources.types'

// Simple static data for testing - inline to avoid import issues
const documentsData = [
  {
    id: 1,
    type: "document",
    name: "User Guide v2.1",
    description: "Comprehensive user guide for the platform",
    url: "/documents/user-guide-v2.1.pdf",
    fileName: "user-guide-v2.1.pdf",
    fileSize: 2457600,
    mimeType: "application/pdf",
    metadata: {
      name: "User Guide v2.1",
      author: "Documentation Team",
      tags: ["user-guide", "documentation", "latest"],
      isActive: true,
      status: "active"
    }
  },
  {
    id: 2,
    type: "document", 
    name: "API Reference Manual",
    description: "Complete API documentation and reference",
    url: "/documents/api-reference.pdf",
    fileName: "api-reference.pdf",
    fileSize: 1823400,
    mimeType: "application/pdf",
    metadata: {
      name: "API Reference Manual",
      author: "Development Team", 
      tags: ["api", "reference", "technical"],
      isActive: true,
      status: "active"
    }
  },
  {
    id: 3,
    type: "document",
    name: "Getting Started Checklist",
    description: "Quick start checklist for new users",
    url: "/documents/getting-started.pdf",
    fileName: "getting-started.pdf",
    fileSize: 945600,
    mimeType: "application/pdf",
    metadata: {
      name: "Getting Started Checklist",
      author: "Support Team",
      tags: ["getting-started", "checklist", "beginner"],
      isActive: true,
      status: "active"
    }
  },
  {
    id: 4,
    type: "document",
    name: "Privacy Policy 2024",
    description: "Updated privacy policy and terms of service",
    url: "/documents/privacy-policy-2024.pdf",
    fileName: "privacy-policy-2024.pdf",
    fileSize: 1156400,
    mimeType: "application/pdf",
    metadata: {
      name: "Privacy Policy 2024",
      author: "Legal Team",
      tags: ["privacy", "legal", "compliance"],
      isActive: true,
      status: "active"
    }
  }
]

const urlsData = [
  {
    id: 5,
    type: "url",
    name: "Official Website",
    description: "Main company website and landing page",
    url: "https://company.com",
    domain: "company.com",
    metadata: {
      name: "Official Website",
      author: "Marketing Team",
      tags: ["website", "public", "marketing"],
      isActive: true,
      status: "active"
    }
  },
  {
    id: 6,
    type: "url",
    name: "Support Portal",
    description: "Customer support and help center",
    url: "https://support.company.com",
    domain: "support.company.com",
    metadata: {
      name: "Support Portal",
      author: "Support Team",
      tags: ["support", "help", "customer"],
      isActive: true,
      status: "active"
    }
  },
  {
    id: 7,
    type: "url",
    name: "Developer Blog",
    description: "Technical blog with updates and tutorials",
    url: "https://blog.company.com/dev",
    domain: "blog.company.com",
    metadata: {
      name: "Developer Blog",
      author: "Development Team",
      tags: ["blog", "technical", "updates"],
      isActive: true,
      status: "active"
    }
  }
]

const formsData = [
  {
    id: 8,
    type: "form",
    name: "Contact Us Form", 
    description: "Main contact form for customer inquiries",
    metadata: {
      name: "Contact Us Form",
      author: "Marketing Team",
      tags: ["contact", "inquiry", "customer"],
      isActive: true,
      status: "active"
    }
  },
  {
    id: 9,
    type: "form",
    name: "Newsletter Signup",
    description: "Email newsletter subscription form",
    metadata: {
      name: "Newsletter Signup",
      author: "Marketing Team",
      tags: ["newsletter", "email", "subscription"],
      isActive: true,
      status: "active"
    }
  },
  {
    id: 10,
    type: "form",
    name: "Feedback Survey",
    description: "Customer satisfaction and feedback collection",
    metadata: {
      name: "Feedback Survey",
      author: "Product Team",
      tags: ["feedback", "survey", "satisfaction"],
      isActive: true,
      status: "active"
    }
  }
]

const emailTemplatesData = [
  {
    id: 11,
    type: "emailTemplate",
    name: "Welcome Email",
    description: "Welcome email for new users",
    metadata: {
      name: "Welcome Email",
      author: "Marketing Team", 
      tags: ["welcome", "onboarding", "email"],
      isActive: true,
      status: "active"
    }
  },
  {
    id: 12,
    type: "emailTemplate",
    name: "Password Reset",
    description: "Template for password reset notifications",
    metadata: {
      name: "Password Reset",
      author: "Security Team",
      tags: ["security", "password", "reset"],
      isActive: true,
      status: "active"
    }
  },
  {
    id: 13,
    type: "emailTemplate",
    name: "Monthly Newsletter",
    description: "Template for monthly company updates",
    metadata: {
      name: "Monthly Newsletter",
      author: "Communications Team",
      tags: ["newsletter", "monthly", "updates"],
      isActive: true,
      status: "active"
    }
  }
]

const videosData = [
  {
    id: 10,
    type: "video",
    name: "Platform Overview",
    description: "Introduction video showing platform features",
    metadata: {
      name: "Platform Overview",
      author: "Video Production Team",
      tags: ["overview", "demo"],
      isActive: true,
      status: "active"
    }
  }
]

const vdFoldersData = [
  {
    id: 11,
    type: "vdFolder",
    name: "Marketing Assets",
    description: "Shared folder containing marketing materials",
    metadata: {
      name: "Marketing Assets",
      author: "Marketing Team",
      tags: ["marketing", "assets"],
      isActive: true,
      status: "active"
    }
  }
]

import { isRef } from 'vue'
import type { Ref } from 'vue'

export function useResourceList(options: { resourceType: ResourceType | Ref<ResourceType> }) {
  const resourceTypeRef: Ref<ResourceType> = isRef(options.resourceType) ? options.resourceType as Ref<ResourceType> : ref(options.resourceType)
  // Simple reactive state
  const resources = ref<Resource[]>([])
  const totalCount = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const selectedResources = ref<Set<number>>(new Set())
  const showAddModal = ref(false)
  const showEditModal = ref(false)
  const selectedResource = ref<Resource | null>(null)
  
  // Additional state for compatibility with ResourceListPage
  const filters = ref({})
  const sorting = ref({ field: 'name', direction: 'asc' })
  const currentPage = ref(1)
  const pageSize = 10

  // Get data based on resource type - cast as any for UI demo simplicity  
  function getDataForType(type: ResourceType): Resource[] {
    // console.log('📂 Getting data for type:', type)
    const data = (() => {
      switch (type) {
        case 'document': return documentsData as any
        case 'url': return urlsData as any
        case 'form': return formsData as any
        case 'emailTemplate': return emailTemplatesData as any
        case 'video': return videosData as any
        case 'vdFolder': return vdFoldersData as any
        default: return []
      }
    })()
    console.log('📋 Raw data for', type, ':', data)
    return data
  }

  // Computed filtered resources
  const filteredResources = computed(() => {
    let filtered = getDataForType(resourceTypeRef.value)
    
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(resource =>
        resource.name.toLowerCase().includes(query) ||
        resource.description?.toLowerCase().includes(query) ||
        (resource.metadata?.tags || []).some((tag: string) => tag.toLowerCase().includes(query))
      )
    }
    
    return filtered
  })

  // Load resources (simulate async for realistic feel)
  async function fetchResources() {
    loading.value = true
    error.value = null
    
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 200))
    
    try {
      const data = filteredResources.value
      resources.value = data
      totalCount.value = resources.value.length
    } catch (err) {
      error.value = 'Failed to load resources'
      console.error('Error loading resources:', err)
    } finally {
      loading.value = false
    }
  }

  // Simple actions for UI demo
  async function deleteResource(resourceId: number) {
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 500))
    
    resources.value = resources.value.filter(r => r.id !== resourceId)
    totalCount.value = resources.value.length
    
    loading.value = false
  }

  async function duplicateResource(resource: Resource) {
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const duplicated = {
      ...resource,
      id: Date.now(),
      name: `${resource.name} (Copy)`,
      metadata: {
        ...resource.metadata,
        name: `${resource.name} (Copy)`,
        createdAt: new Date(),
        lastModified: new Date()
      }
    }
    
    resources.value.unshift(duplicated)
    totalCount.value = resources.value.length
    
    loading.value = false
    return duplicated
  }

  // Modal actions
  function openAddModal() {
    showAddModal.value = true
  }

  function openEditModal(resourceId: string) {
    const resource = resources.value.find(r => r.id.toString() === resourceId)
    if (resource) {
      selectedResource.value = resource
      showEditModal.value = true
    }
  }

  function handleResourceCreated(resource: any) {
    const newResource = {
      ...resource,
      id: Date.now(),
      insertedAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false
    }
    resources.value.unshift(newResource)
    totalCount.value = resources.value.length
    showAddModal.value = false
  }

  function handleResourceUpdated(resource: Resource) {
    const index = resources.value.findIndex(r => r.id === resource.id)
    if (index !== -1) {
      resources.value[index] = resource
    }
    showEditModal.value = false
    selectedResource.value = null
  }

  // Selection management
  function toggleResourceSelection(resourceId: number) {
    if (selectedResources.value.has(resourceId)) {
      selectedResources.value.delete(resourceId)
    } else {
      selectedResources.value.add(resourceId)
    }
  }

  function clearSelection() {
    selectedResources.value.clear()
  }

  // Computed properties for compatibility
  const totalPages = computed(() => Math.ceil(totalCount.value / pageSize))
  const startIndex = computed(() => (currentPage.value - 1) * pageSize + 1)
  const endIndex = computed(() => Math.min(currentPage.value * pageSize, totalCount.value))
  const hasResults = computed(() => resources.value.length > 0)
  const isEmpty = computed(() => !loading.value && resources.value.length === 0)

  // Additional functions for compatibility
  const updateSearch = (query: string) => {
    searchQuery.value = query
  }

  const updateFilters = (newFilters: any) => {
    filters.value = newFilters
    fetchResources()
  }

  const updateSorting = (newSorting: any) => {
    sorting.value = newSorting
    fetchResources()
  }

  const goToPage = (page: number) => {
    currentPage.value = page
    fetchResources()
  }

  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++
      fetchResources()
    }
  }

  const previousPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--
      fetchResources()
    }
  }

  const clearFilters = () => {
    filters.value = {}
    searchQuery.value = ''
    fetchResources()
  }

  const refresh = () => {
    fetchResources()
  }

  // Watch for resource type changes
  watch(resourceTypeRef, () => {
    currentPage.value = 1
    selectedResources.value.clear()
    fetchResources()
  })

  // Watch for search changes
  watch(searchQuery, () => {
    fetchResources()
  })

  // Initial load
  fetchResources()

  return {
    // State
    resources: computed(() => resources.value),
    totalCount: computed(() => totalCount.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    searchQuery,
    selectedResources: computed(() => selectedResources.value),
    showAddModal,
    showEditModal,
    selectedResource: computed(() => selectedResource.value),
    
    // Additional state for compatibility
    filters,
    sorting,
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    hasResults,
    isEmpty,
    
    // Actions
    fetchResources,
    deleteResource,
    duplicateResource,
    openAddModal,
    openEditModal,
    handleResourceCreated,
    handleResourceUpdated,
    toggleResourceSelection,
    clearSelection,
    
    // Additional actions for compatibility
    updateSearch,
    updateFilters,
    updateSorting,
    goToPage,
    nextPage,
    previousPage,
    clearFilters,
    refresh
  }
}