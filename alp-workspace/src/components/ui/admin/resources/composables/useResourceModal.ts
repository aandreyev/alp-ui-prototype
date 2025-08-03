import { ref, computed } from 'vue'
import type { Resource, ResourceType } from '@/alp-types/admin-resources.types'

export interface UseResourceModalOptions {
  resourceType: ResourceType
  onSuccess?: (resource: any) => void
  onError?: (error: string) => void
}

export function useResourceModal(options: UseResourceModalOptions) {
  const { resourceType, onSuccess, onError } = options

  // Modal state
  const mode = ref<'add' | 'edit'>('add')
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)
  const originalResource = ref<Resource | null>(null)
  const editableResource = ref<any>(null)
  const isDirty = ref(false)

  // Create empty resource based on type - simplified for UI demo
  function createEmptyResource(type: ResourceType): any {
    return {
      type,
      name: '',
      description: '',
      metadata: {
        name: '',
        createdAt: new Date(),
        lastModified: new Date(),
        author: 'Current User',
        tags: [],
        isActive: true,
        status: 'active',
        categories: [],
        entityType: 'offering',
        entityId: 1,
        accessLevel: 'public',
        viewCount: 0
      }
    }
  }

  // Convert resource to editable format - simplified
  function getEditableFromResource(resource: Resource): any {
    return {
      type: resource.type,
      name: resource.name,
      description: resource.description,
      metadata: {
        ...resource.metadata,
        tags: resource.metadata.tags || []
      }
    }
  }

  // Open modal for adding
  function openAdd(type: ResourceType) {
    mode.value = 'add'
    originalResource.value = null
    editableResource.value = createEmptyResource(type)
    error.value = null
    isDirty.value = false
  }

  // Open modal for editing
  function openEdit(resource: Resource) {
    mode.value = 'edit'
    originalResource.value = resource
    editableResource.value = getEditableFromResource(resource)
    error.value = null
    isDirty.value = false
  }

  // Close modal
  async function close(): Promise<boolean> {
    if (isDirty.value) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to close?')
      if (!confirmed) return false
    }
    
    mode.value = 'add'
    originalResource.value = null
    editableResource.value = null
    error.value = null
    isDirty.value = false
    return true
  }

  // Update field - simplified
  function updateField(field: string, value: any) {
    if (!editableResource.value) return
    
    if (field.startsWith('metadata.')) {
      const metadataField = field.replace('metadata.', '')
      if (!editableResource.value.metadata) {
        editableResource.value.metadata = {}
      }
      editableResource.value.metadata[metadataField] = value
    } else {
      editableResource.value[field] = value
    }
    
    isDirty.value = true
  }

  // Save resource - simplified for UI demo
  async function save(): Promise<boolean> {
    if (!editableResource.value) return false
    
    try {
      saving.value = true
      error.value = null
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Create simple resource object for demo
      const savedResource = {
        id: mode.value === 'add' ? Date.now() : originalResource.value!.id,
        ...editableResource.value,
        metadata: {
          ...editableResource.value.metadata,
          name: editableResource.value.name,
          lastModified: new Date()
        }
      }
      
      onSuccess?.(savedResource)
      
      // Reset state
      originalResource.value = null
      editableResource.value = null
      isDirty.value = false
      
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save resource'
      error.value = message
      onError?.(message)
      return false
    } finally {
      saving.value = false
    }
  }

  // Computed properties
  const canSave = computed(() => {
    if (!editableResource.value) return false
    return editableResource.value.name?.trim().length > 0
  })

  return {
    // State
    mode: computed(() => mode.value),
    loading: computed(() => loading.value),
    saving: computed(() => saving.value),
    error: computed(() => error.value),
    editableResource: computed(() => editableResource.value),
    isDirty: computed(() => isDirty.value),
    canSave,
    
    // Actions
    openAdd,
    openEdit,
    close,
    save,
    updateField
  }
}