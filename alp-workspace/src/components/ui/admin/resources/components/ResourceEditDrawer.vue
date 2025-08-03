<template>
  <Sheet :open="isOpen" @update:open="handleClose">
    <SheetContent side="right" class="w-[600px] sm:w-[800px] max-w-[90vw] overflow-hidden flex flex-col">
      <SheetHeader>
        <div class="flex items-center gap-3">
          <component :is="config?.icon" class="w-5 h-5" />
          <div>
            <SheetTitle>Edit {{ config?.label }}</SheetTitle>
            <SheetDescription>
              {{ originalResource?.name }} • Last modified {{ formatDate((originalResource?.metadata as any)?.lastModified) }}
            </SheetDescription>
          </div>
        </div>
      </SheetHeader>

      <!-- Loading overlay -->
      <div v-if="saving" class="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span class="text-sm text-muted-foreground">Saving changes...</span>
        </div>
      </div>

      <!-- Error Alert -->
      <Alert v-if="error" variant="destructive" class="mb-4">
        <AlertCircle class="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{{ error }}</AlertDescription>
      </Alert>

      <!-- Scrollable Content -->
      <div class="flex-1 overflow-y-auto py-4 space-y-6">
        <!-- Resource Information Panel -->
        <div class="bg-muted/50 rounded-lg p-4">
          <h3 class="text-sm font-medium text-foreground mb-3">Resource Information</h3>
          <div class="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span class="text-muted-foreground">Created:</span>
              <span class="ml-1">{{ formatDate((resource?.metadata as any)?.createdAt) }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">Modified:</span>
              <span class="ml-1">{{ formatDate((resource?.metadata as any)?.lastModified) }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">Author:</span>
              <span class="ml-1">{{ (resource?.metadata as any)?.author }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">Status:</span>
              <span class="ml-1">{{ (resource?.metadata as any)?.status }}</span>
            </div>
          </div>
        </div>

        <!-- Common Fields -->
        <div class="grid grid-cols-1 gap-4">
          <div>
            <label class="text-sm font-medium text-foreground">
              Name *
            </label>
            <Input
              id="name"
              :value="editableResource?.name || ''"
              @input="updateField('name', $event.target.value)"
              placeholder="Enter resource name"
              :class="hasFieldError('name') ? 'border-destructive' : ''"
            />
            <p v-if="hasFieldError('name')" class="text-sm text-destructive mt-1">
              {{ getFieldError('name') }}
            </p>
          </div>
          
          <div>
            <label class="text-sm font-medium text-foreground">
              Description
            </label>
            <Textarea 
              id="description"
              :value="editableResource?.description || ''"
              @input="updateField('description', $event.target.value)"
              placeholder="Enter resource description"
              rows="3"
              :class="hasFieldError('description') ? 'border-destructive' : ''"
            />
            <p v-if="hasFieldError('description')" class="text-sm text-destructive mt-1">
              {{ getFieldError('description') }}
            </p>
          </div>
          
          <div>
            <label class="text-sm font-medium text-foreground">
              Tags
            </label>
            <TagInput 
              :value="editableResource?.metadata?.tags || []"
              @update:value="updateField('metadata.tags', $event)"
              placeholder="Add tags..."
            />
          </div>
        </div>

        <!-- Type-Specific Fields (Dynamic Component) -->
        <Separator />
        <div>
          <h3 class="text-sm font-medium mb-3">{{ config?.label }} Details</h3>
          <component 
            :is="configComponents[config?.configComponent as keyof typeof configComponents]"
            v-if="editableResource && config?.configComponent"
            v-model="editableResource"
            :validation-errors="validationErrors"
            @update:field="updateField"
          />
        </div>

        <!-- Common Settings -->
        <Separator />
        <div>
          <h3 class="text-sm font-medium text-foreground mb-3">Settings</h3>
          <div class="grid grid-cols-1 gap-4">
            <div>
              <label class="text-sm font-medium text-foreground">
                Access Level
              </label>
              <select 
                :value="(editableResource?.metadata as any)?.accessLevel || 'public'"
                @change="updateField('metadata.accessLevel', $event.target.value)"
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="public">Public</option>
                <option value="restricted">Restricted</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer with Actions -->
      <SheetFooter class="border-t pt-4">
        <div class="flex justify-between w-full">
          <Button variant="outline" @click="handleClose">
            Cancel
          </Button>
          <div class="flex gap-2">
            <Button variant="outline" @click="handleReset" :disabled="!isDirty">
              Reset
            </Button>
            <Button @click="handleSave" :disabled="!canSave || saving">
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </Button>
          </div>
        </div>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Resource } from '@/alp-types/admin-resources.types'
import { getResourceConfig } from '../config/resourceConfigs'
import { useResourceValidation } from '../composables/useResourceValidation'

// Import config components explicitly
import {
  DocumentConfig,
  UrlConfig,
  FormConfig,
  EmailTemplateConfig,
  VDFolderConfig,
  VideoConfig
} from './config'

// UI Components
import Sheet from '@/lib/registry/new-york/ui/sheet/Sheet.vue'
import SheetContent from '@/lib/registry/new-york/ui/sheet/SheetContent.vue'
import SheetHeader from '@/lib/registry/new-york/ui/sheet/SheetHeader.vue'
import SheetTitle from '@/lib/registry/new-york/ui/sheet/SheetTitle.vue'
import SheetDescription from '@/lib/registry/new-york/ui/sheet/SheetDescription.vue'
import SheetFooter from '@/lib/registry/new-york/ui/sheet/SheetFooter.vue'
import Button from '@/lib/registry/new-york/ui/button/Button.vue'
import Input from '@/lib/registry/new-york/ui/input/Input.vue'
import Textarea from '@/lib/registry/new-york/ui/textarea/Textarea.vue'
import Separator from '@/lib/registry/new-york/ui/separator/Separator.vue'
import { Alert, AlertDescription, AlertTitle } from '@/lib/registry/new-york/ui/alert'
import { AlertCircle } from 'lucide-vue-next'
import TagInput from './TagInput.vue'

interface Props {
  isOpen: boolean
  resource?: Resource | null
}

interface Emits {
  (e: 'close'): void
  (e: 'updated', resource: Resource): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Get configuration for this resource type
const config = computed(() => props.resource ? getResourceConfig(props.resource.type) : null)

// Component mapping for explicit resolution
const configComponents = {
  DocumentConfig,
  UrlConfig,
  FormConfig,
  EmailTemplateConfig,
  VDFolderConfig,
  VideoConfig
}

// Local form state management (simpler approach)
const mode = ref<'add' | 'edit'>('edit')
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const originalResource = ref<Resource | null>(null)
const editableResource = ref<any>(null)
const isDirty = ref(false)

// Computed properties
const canSave = computed(() => {
  if (!editableResource.value) return false
  return editableResource.value.name?.trim().length > 0
})

// Convert resource to editable format
function getEditableFromResource(resource: Resource): any {
  return {
    type: resource.type,
    name: resource.name,
    description: resource.description,
    url: (resource as any).url || '',
    fileName: (resource as any).fileName || '',
    fileSize: (resource as any).fileSize || 0,
    mimeType: (resource as any).mimeType || '',
    targetUrl: (resource as any).targetUrl || '',
    formUrl: (resource as any).formUrl || '',
    formData: (resource as any).formData || {},
    templateId: (resource as any).templateId || '',
    subject: (resource as any).subject || '',
    bodyTemplate: (resource as any).bodyTemplate || '',
    videoUrl: (resource as any).videoUrl || '',
    duration: (resource as any).duration || 0,
    thumbnail: (resource as any).thumbnail || '',
    videoId: (resource as any).videoId || '',
    platform: (resource as any).platform || '',
    folderUrl: (resource as any).folderUrl || '',
    sharePointSiteId: (resource as any).sharePointSiteId || '',
    folderId: (resource as any).folderId || '',
    metadata: {
      ...resource.metadata,
      tags: resource.metadata.tags || []
    }
  }
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
  
  mode.value = 'edit'
  originalResource.value = null
  editableResource.value = null
  error.value = null
  isDirty.value = false
  return true
}

// Update field
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

// Save resource
async function save(): Promise<boolean> {
  if (!editableResource.value) return false
  
  try {
    saving.value = true
    error.value = null
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Create simple resource object for demo
    const savedResource = {
      id: originalResource.value!.id,
      ...editableResource.value,
      metadata: {
        ...editableResource.value.metadata,
        name: editableResource.value.name,
        lastModified: new Date()
      }
    }
    
    emit('updated', savedResource)
    
    // Reset state
    originalResource.value = null
    editableResource.value = null
    isDirty.value = false
    
    return true
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to save resource'
    error.value = message
    return false
  } finally {
    saving.value = false
  }
}

// Use validation composable
const {
  validationErrors,
  hasFieldError,
  getFieldError
} = useResourceValidation()

/**
 * Handle drawer close with confirmation if dirty
 */
async function handleClose() {
  const closed = await close()
  if (closed) {
    emit('close')
  }
}

/**
 * Handle save operation
 */
async function handleSave() {
  const success = await save()
  if (success) {
    // Drawer will close automatically via onSuccess callback
  }
}

/**
 * Handle reset to original values
 */
function handleReset() {
  if (props.resource) {
    openEdit(props.resource)
  }
}

/**
 * Format date helper
 */
function formatDate(date?: string | Date): string {
  if (!date) return 'Unknown'
  try {
    if (typeof date === 'string') {
      return new Date(date).toLocaleDateString()
    }
    return date.toLocaleDateString()
  } catch {
    return 'Unknown'
  }
}

// Watch for resource changes
watch(() => props.resource, (newResource) => {
  if (newResource && props.isOpen) {
    openEdit(newResource)
  }
}, { immediate: true })

// Watch for open state changes
watch(() => props.isOpen, (isOpen) => {
  if (isOpen && props.resource) {
    openEdit(props.resource)
  }
})
</script>

<style scoped>
/* Custom scrollbar for the content area */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: hsl(var(--muted-foreground)) transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: hsl(var(--muted-foreground));
  border-radius: 3px;
}
</style>