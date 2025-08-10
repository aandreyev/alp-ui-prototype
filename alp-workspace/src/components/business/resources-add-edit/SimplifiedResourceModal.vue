<template>
  <Dialog :open="isOpen" @update:open="handleClose">
    <DialogContent :key="`${mode}-${originalResource?.id || 'new'}`" class="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
      <DialogHeader>
        <div class="flex items-center gap-3">
          <component :is="resourceTypeConfig?.icon" class="w-5 h-5" />
          <div>
            <DialogTitle>
              {{ mode === 'create' ? 'Create' : 'Edit' }} {{ resourceTypeConfig?.label }}
            </DialogTitle>
            <DialogDescription v-if="mode === 'edit' && originalResource">
              {{ originalResource.name }} • Last modified {{ formatDate(originalResource.updatedAt) }}
            </DialogDescription>
            <DialogDescription v-else>
              Add a new {{ resourceTypeConfig?.label.toLowerCase() }} resource
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <!-- Loading overlay -->
      <div v-if="saving" class="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span class="text-sm text-muted-foreground">
            {{ mode === 'create' ? 'Creating' : 'Saving' }} resource...
          </span>
        </div>
      </div>

      <!-- Error Alert -->
      <Alert v-if="error" variant="destructive" class="mb-4">
        <AlertCircle class="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{{ error }}</AlertDescription>
      </Alert>

      <div class="space-y-6 overflow-y-auto flex-1 py-4 pr-2">
        <!-- Common Fields -->
        <div class="space-y-4">
          <div>
            <label class="text-sm font-medium text-foreground">
              Name *
            </label>
            <Input
              v-model="formData.name"
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
              v-model="formData.description"
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
              :value="formData.tags || []"
              @update:value="updateField('tags', $event)"
              placeholder="Add tags..."
            />
            <p class="text-xs text-muted-foreground mt-1">
              Press Enter or comma to add tags
            </p>
          </div>
        </div>

        <!-- Type-Specific Fields -->
        <div v-if="props.resourceType" class="border-t pt-4">
          <h3 class="text-sm font-medium mb-3">{{ resourceTypeConfig?.label }} Configuration</h3>
          
          <!-- Document Config -->
          <SimplifiedDocumentConfig 
            v-if="props.resourceType === 'document'"
            :data="formData"
            :validation-errors="validationErrors"
            @update:field="updateField"
          />
          
          <!-- URL Config -->
          <SimplifiedUrlConfig 
            v-else-if="props.resourceType === 'url'"
            :data="formData"
            :validation-errors="validationErrors"
            @update:field="updateField"
          />
          
          <!-- Form Config -->
          <SimplifiedFormConfig 
            v-else-if="props.resourceType === 'form'"
            :data="formData"
            :validation-errors="validationErrors"
            @update:field="updateField"
          />
          
          <!-- Email Template Config -->
          <SimplifiedEmailTemplateConfig 
            v-else-if="props.resourceType === 'emailTemplate'"
            :data="formData"
            :validation-errors="validationErrors"
            @update:field="updateField"
          />
          
          <!-- Video Config -->
          <SimplifiedVideoConfig 
            v-else-if="props.resourceType === 'video'"
            :data="formData"
            :validation-errors="validationErrors"
            @update:field="updateField"
          />
          
          <!-- SharePoint Folder Config -->
          <SimplifiedVDFolderConfig 
            v-else-if="props.resourceType === 'vdFolder'"
            :data="formData"
            :validation-errors="validationErrors"
            @update:field="updateField"
          />
        </div>

        <!-- Auto-Populated Properties (Edit Mode Only) -->
        <div v-if="mode === 'edit' && originalResource" class="space-y-4">
          <div class="border-t pt-4">
            <h3 class="text-sm font-medium mb-3">Properties</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-muted-foreground">Created</label>
                <Input 
                  :modelValue="formatDate(originalResource.createdAt)" 
                  readonly 
                  class="bg-muted text-muted-foreground"
                />
              </div>
              <div>
                <label class="text-sm font-medium text-muted-foreground">Last Updated</label>
                <Input 
                  :modelValue="formatDate(originalResource.updatedAt)" 
                  readonly 
                  class="bg-muted text-muted-foreground"
                />
              </div>
            </div>
            
            <!-- Type-specific properties -->
            <div class="grid grid-cols-2 gap-4 mt-4">
              <template v-if="props.resourceType === 'document'">
                <div v-if="originalResource.fileSize">
                  <label class="text-sm font-medium text-muted-foreground">File Size</label>
                  <Input 
                    :modelValue="formatFileSize(originalResource.fileSize)" 
                    readonly 
                    class="bg-muted text-muted-foreground"
                  />
                </div>
                <div v-if="originalResource.mimeType">
                  <label class="text-sm font-medium text-muted-foreground">File Type</label>
                  <Input 
                    :modelValue="originalResource.mimeType" 
                    readonly 
                    class="bg-muted text-muted-foreground"
                  />
                </div>
              </template>
              
              <template v-else-if="props.resourceType === 'url'">
                <div>
                  <label class="text-sm font-medium text-muted-foreground">Monitor Status</label>
                  <Input 
                    :modelValue="originalResource.isActive ? 'Active' : 'Broken'" 
                    readonly 
                    :class="originalResource.isActive ? 'bg-muted text-muted-foreground' : 'bg-destructive/10 text-destructive'"
                  />
                </div>
              </template>
              
              <template v-else-if="props.resourceType === 'video'">
                <div v-if="originalResource.duration">
                  <label class="text-sm font-medium text-muted-foreground">Duration</label>
                  <Input 
                    :modelValue="formatDuration(originalResource.duration)" 
                    readonly 
                    class="bg-muted text-muted-foreground"
                  />
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <div class="flex items-center justify-between w-full">
          <!-- Preview/Open buttons (left side) -->
          <div class="flex items-center gap-2">
            <Button 
              v-if="mode === 'edit' && canPreview" 
              variant="outline" 
              size="sm" 
              @click="previewResource"
            >
              <Eye class="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button 
              v-if="mode === 'edit' && canOpen" 
              variant="outline" 
              size="sm" 
              @click="openResource"
            >
              <ExternalLink class="w-4 h-4 mr-2" />
              Open
            </Button>
          </div>
          
          <!-- Save/Cancel buttons (right side) -->
          <div class="flex items-center gap-2">
            <Button variant="outline" @click="handleClose" :disabled="saving">
              Cancel
            </Button>
            <Button @click="handleSave" :disabled="!canSave || saving">
              <Save class="w-4 h-4 mr-2" />
              {{ mode === 'create' ? 'Create' : 'Save Changes' }}
            </Button>
          </div>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
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
import { Textarea } from '@/lib/registry/new-york/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/lib/registry/new-york/ui/alert'

// Custom Components
import TagInput from '@/components/ui/admin/resources/components/TagInput.vue'

// Simplified Config Components
import SimplifiedDocumentConfig from '@/components/business/resources-add-edit/SimplifiedDocumentConfig.vue'
import SimplifiedUrlConfig from '@/components/business/resources-add-edit/SimplifiedUrlConfig.vue'
import SimplifiedFormConfig from '@/components/business/resources-add-edit/SimplifiedFormConfig.vue'
import SimplifiedEmailTemplateConfig from '@/components/business/resources-add-edit/SimplifiedEmailTemplateConfig.vue'
import SimplifiedVDFolderConfig from '@/components/business/resources-add-edit/SimplifiedVDFolderConfig.vue'
import SimplifiedVideoConfig from '@/components/business/resources-add-edit/SimplifiedVideoConfig.vue'

// Types
import type { Resource as BaseResource, ResourceType as GlobalResourceType } from '@/alp-types/resources.types'
type Resource = BaseResource & Record<string, any>
type ModalResourceType = Exclude<GlobalResourceType, 'template'>

// Resource type configurations
import { 
  FileText, 
  Link, 
  FileCheck, 
  Mail, 
  Video, 
  Folder
} from 'lucide-vue-next'

const resourceTypeConfigs: Record<ModalResourceType, { label: string; icon: any }> = {
  document: { label: 'Document', icon: FileText },
  url: { label: 'URL', icon: Link },
  form: { label: 'Form', icon: FileCheck },
  emailTemplate: { label: 'Email Template', icon: Mail },
  video: { label: 'Video', icon: Video },
  vdFolder: { label: 'SharePoint Folder', icon: Folder }
}

interface Props {
  isOpen: boolean
  mode: 'create' | 'edit'
  resourceType: ModalResourceType
  resource?: Resource | null
}

interface Emits {
  (e: 'close'): void
  (e: 'created', resource: Resource): void
  (e: 'updated', resource: Resource): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Reactive state
const saving = ref(false)
const error = ref<string | null>(null)
const validationErrors = ref<Record<string, string>>({})
const originalResource = ref<Resource | null>(null)
const formData = ref<any>({
  name: '',
  description: '',
  tags: [],
  type: props.resourceType
})

// Create a reactive reference to resourceType
const resourceType = computed<ModalResourceType>(() => props.resourceType)

// Computed properties
const resourceTypeConfig = computed(() => resourceTypeConfigs[resourceType.value])

const canSave = computed(() => {
  return formData.value.name?.trim() && !saving.value
})

const canPreview = computed(() => {
  return props.mode === 'edit' && ['document', 'url', 'video', 'emailTemplate'].includes(props.resourceType)
})

const canOpen = computed(() => {
  return props.mode === 'edit' && ['url', 'form', 'vdFolder'].includes(props.resourceType)
})

// Methods
const getConfigComponent = () => {
  const components: Record<ModalResourceType, any> = {
    document: SimplifiedDocumentConfig,
    url: SimplifiedUrlConfig,
    form: SimplifiedFormConfig,
    emailTemplate: SimplifiedEmailTemplateConfig,
    video: SimplifiedVideoConfig,
    vdFolder: SimplifiedVDFolderConfig
  }
  return components[props.resourceType]
}

const updateField = (field: string, value: any) => {
  console.log('🔄 updateField called:', field, '=', value)
  console.log('📋 Current formData before update:', JSON.stringify(formData.value, null, 2))
  
  const keys = field.split('.')
  let target = formData.value
  
  for (let i = 0; i < keys.length - 1; i++) {
    if (!target[keys[i]]) {
      target[keys[i]] = {}
    }
    target = target[keys[i]]
  }
  
  target[keys[keys.length - 1]] = value
  
  console.log('📋 Current formData after update:', JSON.stringify(formData.value, null, 2))
}

const hasFieldError = (field: string) => {
  return !!validationErrors.value[field]
}

const getFieldError = (field: string) => {
  return validationErrors.value[field]
}

const validateForm = () => {
  const errors: Record<string, string> = {}
  
  if (!formData.value.name?.trim()) {
    errors.name = 'Name is required'
  }
  
  // Type-specific validation
  if (props.resourceType === 'url' && !formData.value.url?.trim()) {
    errors.url = 'URL is required'
  }
  
  if (props.resourceType === 'form' && !formData.value.syntaqFormId?.trim()) {
    errors.syntaqFormId = 'Syntaq Form ID is required'
  }
  
  if (props.resourceType === 'emailTemplate' && !formData.value.subjectLine?.trim()) {
    errors.subjectLine = 'Subject line is required'
  }
  
  if (props.resourceType === 'vdFolder' && !formData.value.sharePointUrl?.trim()) {
    errors.sharePointUrl = 'SharePoint URL is required'
  }
  
  validationErrors.value = errors
  return Object.keys(errors).length === 0
}

const handleSave = async () => {
  if (!validateForm()) {
    return
  }
  
  saving.value = true
  error.value = null
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const resourceData = {
      ...formData.value,
      id: props.mode === 'create' ? Date.now().toString() : originalResource.value?.id,
      createdAt: props.mode === 'create' ? new Date().toISOString() : originalResource.value?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        tags: formData.value.tags || [],
        ...formData.value.metadata
      }
    }
    
    if (props.mode === 'create') {
      emit('created', resourceData as Resource)
    } else {
      emit('updated', resourceData as Resource)
    }
    
    handleClose()
  } catch (err) {
    error.value = 'Failed to save resource. Please try again.'
    console.error('Error saving resource:', err)
  } finally {
    saving.value = false
  }
}

const handleClose = () => {
  if (saving.value) return
  
  // Reset form
  formData.value = {
    name: '',
    description: '',
    tags: [],
    type: props.resourceType
  }
  validationErrors.value = {}
  error.value = null
  originalResource.value = null
  
  emit('close')
}

const previewResource = () => {
  if (!originalResource.value) return
  console.log('Preview resource:', originalResource.value)
  // TODO: Implement preview functionality
}

const openResource = () => {
  if (!originalResource.value) return
  
  switch (props.resourceType) {
    case 'url':
      window.open(originalResource.value?.url, '_blank')
      break
    case 'form':
      console.log('Open form:', originalResource.value)
      break
    case 'vdFolder':
      console.log('Open SharePoint folder:', originalResource.value)
      break
  }
}

// Utility functions
const formatDate = (date?: Date | string) => {
  if (!date) return 'Unknown'
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d)
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`
}

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// Watch for prop changes
watch(() => props.resource, (newResource) => {
  console.log('🔍 Resource prop changed:', newResource)
  if (newResource && props.mode === 'edit') {
    originalResource.value = newResource
    // Properly spread all resource properties for editing
    const newFormData = {
      ...newResource,
      tags: newResource.metadata?.tags || [],
      // Ensure type-specific fields are included
      url: newResource.url || '',
      syntaqFormId: newResource.syntaqFormId || '',
      subjectLine: newResource.subjectLine || '',
      emailContent: newResource.emailContent || '',
      sharePointUrl: newResource.sharePointUrl || '',
      videoUrl: newResource.videoUrl || '',
      fileName: newResource.fileName || '',
      fileSize: newResource.fileSize || 0,
      mimeType: newResource.mimeType || '',
      author: newResource.metadata?.author || newResource.author || '',
      version: newResource.metadata?.version || newResource.version || '',
      templateType: newResource.templateType || '',
      documentType: newResource.documentType || '',
      urlType: newResource.urlType || '',
      formCategory: newResource.formCategory || '',
      videoType: newResource.videoType || '',
      siteName: newResource.siteName || '',
      folderName: newResource.folderName || '',
      monitorStatus: newResource.monitorStatus || '',
      lastChecked: newResource.lastChecked || '',
      lastUpdated: newResource.lastUpdated || ''
    }
  console.log('📝 Setting formData to:', newFormData)
  // Mutate existing object to preserve reactivity bindings
  Object.assign(formData.value, newFormData)
  }
}, { immediate: true })

watch(() => props.isOpen, async (newValue) => {
  console.log('🚪 Modal isOpen changed:', newValue, 'Mode:', props.mode)
  if (newValue) {
    // Wait for next tick to ensure DOM is ready
    await nextTick()
    
    if (props.mode === 'create') {
      // Reset form for create mode
      formData.value = {
        name: '',
        description: '',
        tags: [],
        type: props.resourceType,
        url: '',
        syntaqFormId: '',
        subjectLine: '',
        emailContent: '',
        sharePointUrl: '',
        videoUrl: '',
        fileName: '',
        fileSize: 0,
        mimeType: '',
        author: '',
        version: '1.0',
        templateType: '',
        documentType: '',
        urlType: '',
        formCategory: '',
        videoType: '',
        siteName: '',
        folderName: '',
        monitorStatus: '',
        lastChecked: '',
        lastUpdated: ''
      }
      console.log('✨ Create mode - formData reset')
  } else if (props.resource && props.mode === 'edit') {
      // Ensure edit mode data is properly loaded
      console.log('📥 Edit mode - Loading resource:', props.resource)
      originalResource.value = props.resource
      const editFormData = {
        ...props.resource,
        tags: props.resource.metadata?.tags || [],
        url: props.resource.url || '',
        syntaqFormId: props.resource.syntaqFormId || '',
        subjectLine: props.resource.subjectLine || '',
        emailContent: props.resource.emailContent || '',
        sharePointUrl: props.resource.sharePointUrl || '',
        videoUrl: props.resource.videoUrl || '',
        fileName: props.resource.fileName || '',
        fileSize: props.resource.fileSize || 0,
        mimeType: props.resource.mimeType || '',
        author: props.resource.metadata?.author || props.resource.author || '',
        version: props.resource.metadata?.version || props.resource.version || '',
        templateType: props.resource.templateType || '',
        documentType: props.resource.documentType || '',
        urlType: props.resource.urlType || '',
        formCategory: props.resource.formCategory || '',
        videoType: props.resource.videoType || '',
        siteName: props.resource.siteName || '',
        folderName: props.resource.folderName || '',
        monitorStatus: props.resource.monitorStatus || '',
        lastChecked: props.resource.lastChecked || '',
        lastUpdated: props.resource.lastUpdated || ''
      }
  console.log('📝 Edit mode - Setting formData:', editFormData)
  // Mutate existing object to preserve reactivity bindings
  Object.assign(formData.value, editFormData)
    }
  }
})
</script>

<style scoped>
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
