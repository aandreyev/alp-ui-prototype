<template>
  <Dialog :open="isOpen" @update:open="handleClose">
    <DialogContent class="max-w-2xl max-h-[90vh] overflow-hidden">
      <DialogHeader>
        <div class="flex items-center gap-3">
          <component :is="config?.icon" class="w-5 h-5" />
          <div>
            <DialogTitle>Edit {{ config?.label }}</DialogTitle>
            <DialogDescription>
              {{ originalResource?.name }} • Last modified {{ formatDate(originalResource?.updatedAt) }}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

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

      <div class="space-y-6 overflow-y-auto max-h-[60vh] py-4">
        <!-- Common Fields (same structure as add modal) -->
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

        <!-- Type-Specific Fields (same dynamic component as add) -->
        <Separator />
        <div>
          <h3 class="text-sm font-medium mb-3">{{ config?.label }} Details</h3>
          <component 
            :is="config?.configComponent"
            v-if="editableResource"
            v-model="editableResource"
            :validation-errors="validationErrors"
            @update:field="updateField"
          />
        </div>

        <!-- Common Settings (same as add modal) -->
        <Separator />
        <div>
          <h3 class="text-sm font-medium mb-3">Settings</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-foreground">
                Access Level
              </label>
              <Select 
                :value="editableResource?.metadata?.accessLevel || 'public'"
                @update:value="updateField('metadata.accessLevel', $event)"
              >
                <SelectTrigger id="accessLevel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="restricted">Restricted</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label class="text-sm font-medium text-foreground">
                Categories
              </label>
              <TagInput 
                :value="editableResource?.metadata?.categories || []"
                @update:value="updateField('metadata.categories', $event)"
                placeholder="Add categories..."
              />
            </div>
          </div>
        </div>

        <!-- Read-only Metadata -->
        <Separator />
        <div>
          <h3 class="text-sm font-medium mb-3">Information</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-muted-foreground">Created</label>
              <Input 
                :value="formatDate(originalResource?.insertedAt)" 
                readonly 
                class="bg-muted text-muted-foreground"
              />
            </div>
            <div>
              <label class="text-sm font-medium text-muted-foreground">Created By</label>
              <Input 
                :value="originalResource?.insertedById || 'System'" 
                readonly 
                class="bg-muted text-muted-foreground"
              />
            </div>
          </div>
          
          <!-- Type-specific readonly info -->
          <div v-if="originalResource" class="grid grid-cols-2 gap-4 mt-4">
            <template v-if="originalResource.type === 'document'">
              <div>
                <label class="text-sm font-medium text-muted-foreground">File Size</label>
                <Input 
                  :value="formatFileSize(originalResource.fileSize)" 
                  readonly 
                  class="bg-muted text-muted-foreground"
                />
              </div>
              <div>
                <label class="text-sm font-medium text-muted-foreground">Downloads</label>
                <Input 
                  :value="originalResource.downloadCount.toString()" 
                  readonly 
                  class="bg-muted text-muted-foreground"
                />
              </div>
            </template>
            
            <template v-else-if="originalResource.type === 'url'">
              <div>
                <label class="text-sm font-medium text-muted-foreground">Clicks</label>
                <Input 
                  :value="originalResource.clickCount.toString()" 
                  readonly 
                  class="bg-muted text-muted-foreground"
                />
              </div>
              <div>
                <label class="text-sm font-medium text-muted-foreground">Status</label>
                <Input 
                  :value="originalResource.isActive ? 'Active' : 'Inactive'" 
                  readonly 
                  class="bg-muted text-muted-foreground"
                />
              </div>
            </template>
            
            <template v-else-if="originalResource.type === 'form'">
              <div>
                <label class="text-sm font-medium text-muted-foreground">Submissions</label>
                <Input 
                  :value="originalResource.submissionCount.toString()" 
                  readonly 
                  class="bg-muted text-muted-foreground"
                />
              </div>
              <div>
                <label class="text-sm font-medium text-muted-foreground">Status</label>
                <Input 
                  :value="originalResource.isPublished ? 'Published' : 'Draft'" 
                  readonly 
                  class="bg-muted text-muted-foreground"
                />
              </div>
            </template>
            
            <template v-else-if="originalResource.type === 'video'">
              <div>
                <label class="text-sm font-medium text-muted-foreground">Duration</label>
                <Input 
                  :value="formatDuration(originalResource.duration)" 
                  readonly 
                  class="bg-muted text-muted-foreground"
                />
              </div>
              <div>
                <label class="text-sm font-medium text-muted-foreground">Views</label>
                <Input 
                  :value="originalResource.viewCount.toString()" 
                  readonly 
                  class="bg-muted text-muted-foreground"
                />
              </div>
            </template>
          </div>
        </div>
      </div>

      <DialogFooter>
        <!-- Action buttons (left side) -->
        <div class="flex items-center gap-2 mr-auto">
          <Button variant="outline" size="sm" @click="previewResource" v-if="canPreview">
            <Eye class="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" size="sm" @click="openResource" v-if="canOpen">
            <ExternalLink class="w-4 h-4 mr-2" />
            Open
          </Button>
        </div>
        
        <!-- Save/Cancel buttons (right side) -->
        <div class="flex items-center gap-2">
          <Button variant="outline" @click="handleClose" :disabled="saving">
            Cancel
          </Button>
          <Button @click="handleSave" :disabled="!canSave || saving" v-if="isDirty">
            <Save class="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, watch, nextTick } from 'vue'
import { Save, Eye, ExternalLink, AlertCircle } from 'lucide-vue-next'

// UI Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/lib/registry/new-york/ui/dialog'
import { Button } from '@/lib/registry/new-york/ui/button'
import { Input } from '@/lib/registry/new-york/ui/input'
// import { Label } from '@/lib/registry/new-york/ui/label'
import { Textarea } from '@/lib/registry/new-york/ui/textarea'
import { Separator } from '@/lib/registry/new-york/ui/separator'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/lib/registry/new-york/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/lib/registry/new-york/ui/alert'

// Custom Components
import TagInput from './TagInput.vue'

// Types and Composables
import type { Resource } from '@/alp-types/admin-resources.types'
import { getResourceConfig } from '../config/resourceConfigs'
import { useResourceModal } from '../composables/useResourceModal'
import { useResourceValidation } from '../composables/useResourceValidation'

interface Props {
  isOpen: boolean
  resource: Resource | null
}

interface Emits {
  (e: 'close'): void
  (e: 'updated', resource: Resource): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Get configuration based on resource type
const config = computed(() => {
  if (!props.resource) return getResourceConfig('document') // fallback
  return getResourceConfig(props.resource.type)
})

// Use modal composable
const {
  mode,
  loading,
  saving,
  error,
  originalResource,
  editableResource,
  isDirty,
  canSave,
  openEdit,
  close,
  save,
  updateField
} = useResourceModal({
  onSuccess: (resource) => emit('updated', resource),
  onError: (error) => console.error('Error updating resource:', error)
})

// Use validation composable
const {
  validationErrors,
  hasFieldError,
  getFieldError
} = useResourceValidation()

// Computed properties for actions
const canPreview = computed(() => {
  return props.resource && ['document', 'url', 'video', 'emailTemplate'].includes(props.resource.type)
})

const canOpen = computed(() => {
  return props.resource && ['url', 'form', 'vdFolder'].includes(props.resource.type)
})

/**
 * Handle modal close with confirmation if dirty
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
    // Modal will close automatically via onSuccess callback
  }
}

/**
 * Preview resource
 */
function previewResource() {
  if (!props.resource) return
  
  // TODO: Implement preview functionality based on resource type
  console.log('Preview resource:', props.resource)
}

/**
 * Open resource
 */
function openResource() {
  if (!props.resource) return
  
  switch (props.resource.type) {
    case 'url':
      window.open(props.resource.url, '_blank')
      break
    case 'form':
      // TODO: Open Syntaq form
      console.log('Open form:', props.resource)
      break
    case 'vdFolder':
      // TODO: Open SharePoint folder
      console.log('Open folder:', props.resource)
      break
    default:
      console.log('Open resource:', props.resource)
  }
}

/**
 * Utility functions
 */
function formatDate(date?: Date): string {
  if (!date) return 'Unknown'
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// Watch for prop changes to open modal
watch(() => props.resource, (newResource) => {
  if (newResource && props.isOpen) {
    nextTick(() => {
      openEdit(newResource)
    })
  }
})

watch(() => props.isOpen, (newValue) => {
  if (newValue && props.resource) {
    nextTick(() => {
      openEdit(props.resource!)
    })
  }
})
</script>

<style scoped>
/* Component-specific styles */
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