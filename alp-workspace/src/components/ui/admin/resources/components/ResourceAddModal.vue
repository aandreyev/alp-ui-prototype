<template>
  <Dialog :open="isOpen" @update:open="handleClose">
    <DialogContent class="max-w-2xl max-h-[90vh] overflow-hidden">
      <DialogHeader>
        <div class="flex items-center gap-3">
          <component :is="config.icon" class="w-5 h-5" />
          <div>
            <DialogTitle>Add New {{ config.label }}</DialogTitle>
            <DialogDescription>
              Create a new {{ config.label.toLowerCase() }} resource
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <!-- Loading overlay -->
      <div v-if="saving" class="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span class="text-sm text-muted-foreground">Creating {{ config.label.toLowerCase() }}...</span>
        </div>
      </div>

      <!-- Error Alert -->
      <Alert v-if="error" variant="destructive" class="mb-4">
        <AlertCircle class="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{{ error }}</AlertDescription>
      </Alert>

      <div class="space-y-6 overflow-y-auto max-h-[60vh] py-4">
        <!-- Common Fields (same for all types) -->
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
            <p class="text-xs text-muted-foreground mt-1">
              Press Enter or comma to add tags
            </p>
          </div>
        </div>

        <!-- Type-Specific Fields (dynamic component) -->
        <Separator />
        <div>
          <h3 class="text-sm font-medium mb-3">{{ config.label }} Details</h3>
          <component 
            :is="config.configComponent"
            v-if="editableResource"
            v-model="editableResource"
            :validation-errors="validationErrors"
            @update:field="updateField"
          />
        </div>

        <!-- Common Settings (same for all types) -->
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
              <p class="text-xs text-muted-foreground mt-1">
                Who can access this resource
              </p>
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
              <p class="text-xs text-muted-foreground mt-1">
                Organize resources by category
              </p>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="handleClose" :disabled="saving">
          Cancel
        </Button>
        <Button @click="handleSave" :disabled="!canSave || saving">
          <Plus class="w-4 h-4 mr-2" />
          Create {{ config.label }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, watch, nextTick } from 'vue'
import { Plus, AlertCircle } from 'lucide-vue-next'

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
import type { Resource, ResourceType } from '@/alp-types/admin-resources.types'
import { getResourceConfig } from '../config/resourceConfigs'
import { useResourceModal } from '../composables/useResourceModal'
import { useResourceValidation } from '../composables/useResourceValidation'

interface Props {
  isOpen: boolean
  resourceType: ResourceType
}

interface Emits {
  (e: 'close'): void
  (e: 'created', resource: Resource): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Get configuration for this resource type
const config = computed(() => getResourceConfig(props.resourceType))

// Use modal composable
const {
  mode,
  loading,
  saving,
  error,
  editableResource,
  isDirty,
  canSave,
  openAdd,
  close,
  save,
  updateField
} = useResourceModal({
  resourceType: props.resourceType,
  onSuccess: (resource) => emit('created', resource),
  onError: (error) => console.error('Error creating resource:', error)
})

// Use validation composable
const {
  validationErrors,
  hasFieldError,
  getFieldError
} = useResourceValidation()

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

// Watch for prop changes to open modal
watch(() => props.isOpen, (newValue) => {
  if (newValue && !editableResource.value) {
    nextTick(() => {
      openAdd(props.resourceType)
    })
  }
})

// Watch for resource type changes
watch(() => props.resourceType, (newType) => {
  if (props.isOpen) {
    openAdd(newType)
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