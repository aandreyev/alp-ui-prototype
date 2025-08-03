<template>
  <div class="document-config space-y-4">
    <!-- File Upload Section -->
    <div>
      <label class="text-sm font-medium text-foreground">Document File *</label>
      <div class="mt-1">
        <div 
          v-if="!modelValue.fileName"
          class="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors"
          @click="triggerFileUpload"
          @drop="handleDrop"
          @dragover.prevent
          @dragenter.prevent
        >
          <FileText class="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
          <p class="text-sm text-foreground mb-1">Click to upload or drag and drop</p>
          <p class="text-xs text-muted-foreground">PDF, Word, Excel, PowerPoint, or text files</p>
        </div>
        
        <div v-else class="border rounded-lg p-4 bg-muted/30">
          <div class="flex items-center gap-3">
            <FileText class="w-5 h-5 text-primary" />
            <div class="flex-1">
              <p class="text-sm font-medium">{{ modelValue.fileName }}</p>
              <p class="text-xs text-muted-foreground">
                {{ formatFileSize(modelValue.fileSize) }} • {{ modelValue.mimeType }}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              @click="removeFile"
              class="text-muted-foreground hover:text-destructive"
            >
              <X class="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <input 
          ref="fileInputRef"
          type="file"
          class="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf"
          @change="handleFileSelect"
        />
      </div>
      <p v-if="validationErrors?.fileName" class="text-sm text-destructive mt-1">
        {{ validationErrors.fileName }}
      </p>
    </div>

    <!-- Document Type -->
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="text-sm font-medium text-foreground">Document Type</label>
        <Select 
          :value="modelValue.documentType || 'other'"
          @update:value="updateField('documentType', $event)"
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="template">Template</SelectItem>
            <SelectItem value="form">Form</SelectItem>
            <SelectItem value="guide">Guide</SelectItem>
            <SelectItem value="policy">Policy</SelectItem>
            <SelectItem value="contract">Contract</SelectItem>
            <SelectItem value="letter">Letter</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label class="text-sm font-medium text-foreground">Confidentiality Level</label>
        <Select 
          :value="modelValue.confidentialityLevel || 'public'"
          @update:value="updateField('confidentialityLevel', $event)"
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="internal">Internal</SelectItem>
            <SelectItem value="confidential">Confidential</SelectItem>
            <SelectItem value="restricted">Restricted</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <!-- Version Information -->
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="text-sm font-medium text-foreground">Version</label>
        <Input 
          :value="modelValue.version || '1.0'"
          @input="updateField('version', $event.target.value)"
          placeholder="1.0"
        />
        <p class="text-xs text-muted-foreground mt-1">
          Semantic versioning (e.g., 1.0, 1.1, 2.0)
        </p>
      </div>
      
      <div>
        <label class="text-sm font-medium text-foreground">Language</label>
        <Select 
          :value="modelValue.language || 'en'"
          @update:value="updateField('language', $event)"
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="es">Spanish</SelectItem>
            <SelectItem value="fr">French</SelectItem>
            <SelectItem value="de">German</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <!-- Document Properties (if file is uploaded) -->
    <div v-if="modelValue.fileName" class="bg-muted/30 rounded-lg p-4">
      <h4 class="text-sm font-medium mb-3">Document Properties</h4>
      <div class="grid grid-cols-3 gap-4 text-sm">
        <div>
          <span class="text-muted-foreground">File Size:</span>
          <span class="ml-2 font-medium">{{ formatFileSize(modelValue.fileSize) }}</span>
        </div>
        <div>
          <span class="text-muted-foreground">Type:</span>
          <span class="ml-2 font-medium">{{ modelValue.mimeType }}</span>
        </div>
        <div v-if="modelValue.pageCount">
          <span class="text-muted-foreground">Pages:</span>
          <span class="ml-2 font-medium">{{ modelValue.pageCount }}</span>
        </div>
      </div>
    </div>

    <!-- Additional Options -->
    <div class="space-y-3">
      <div class="flex items-center space-x-2">
        <input
          id="isLatestVersion"
          type="checkbox"
          :checked="modelValue.isLatestVersion !== false"
          @change="updateField('isLatestVersion', $event.target.checked)"
          class="rounded border-gray-300"
        />
        <label for="isLatestVersion" class="text-sm text-foreground">
          This is the latest version
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { FileText, X } from 'lucide-vue-next'

// UI Components
import { Button } from '@/lib/registry/new-york/ui/button'
import { Input } from '@/lib/registry/new-york/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/lib/registry/new-york/ui/select'

// Types
import type { CreateDocumentResource } from '@/alp-types/admin-resources.types'

interface Props {
  modelValue: CreateDocumentResource & { type: 'document' }
  validationErrors?: Record<string, string>
}

interface Emits {
  (e: 'update:field', field: string, value: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const fileInputRef = ref<HTMLInputElement>()

/**
 * Update field value
 */
function updateField(field: string, value: any) {
  emit('update:field', field, value)
}

/**
 * Trigger file upload dialog
 */
function triggerFileUpload() {
  fileInputRef.value?.click()
}

/**
 * Handle file selection
 */
function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    processFile(file)
  }
}

/**
 * Handle drag and drop
 */
function handleDrop(event: DragEvent) {
  event.preventDefault()
  const file = event.dataTransfer?.files[0]
  if (file) {
    processFile(file)
  }
}

/**
 * Process uploaded file
 */
function processFile(file: File) {
  // Update file information
  updateField('fileName', file.name)
  updateField('fileSize', file.size)
  updateField('mimeType', file.type)
  
  // Generate a mock URL for demo purposes
  // In real implementation, this would upload to server
  updateField('url', `/documents/${file.name}`)
  
  // Set default version if not set
  if (!props.modelValue.version) {
    updateField('version', '1.0')
  }
  
  // Mock additional properties based on file type
  if (file.type === 'application/pdf') {
    updateField('pageCount', Math.floor(Math.random() * 50) + 1)
  }
  
  console.log('File processed:', file.name, file.size, file.type)
}

/**
 * Remove uploaded file
 */
function removeFile() {
  updateField('fileName', '')
  updateField('fileSize', 0)
  updateField('mimeType', '')
  updateField('url', '')
  updateField('pageCount', undefined)
  
  // Clear file input
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

/**
 * Format file size for display
 */
function formatFileSize(bytes: number): string {
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
</script>

<style scoped>
.document-config {
  /* Component-specific styles if needed */
}
</style>