<template>
  <div class="document-config space-y-4">
    <!-- Document Type -->
    <div>
      <label class="text-sm font-medium text-foreground">Document Type</label>
      <Select 
        :modelValue="data?.documentType ?? 'other'"
        @update:modelValue="$emit('update:field', 'documentType', $event)"
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
          <SelectItem value="report">Report</SelectItem>
          <SelectItem value="manual">Manual</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- File Upload Section -->
    <div>
      <label class="text-sm font-medium text-foreground">Document File *</label>
      <div class="mt-1">
        <div 
          v-if="!data?.fileName"
          class="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
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
              <p class="text-sm font-medium">{{ data.fileName }}</p>
              <p class="text-xs text-muted-foreground">
                {{ formatFileSize(data.fileSize || 0) }} • {{ data.mimeType }}
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

    <!-- Version and Author -->
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="text-sm font-medium text-foreground">Version</label>
        <Input 
          :modelValue="data?.version ?? '1.0'"
          @update:modelValue="$emit('update:field', 'version', $event)"
          placeholder="1.0"
        />
        <p class="text-xs text-muted-foreground mt-1">
          e.g., 1.0, 1.1, 2.0
        </p>
      </div>
      
      <div>
        <label class="text-sm font-medium text-foreground">Author</label>
        <Input 
          :modelValue="data?.author ?? ''"
          @update:modelValue="$emit('update:field', 'author', $event)"
          placeholder="Document author"
        />
      </div>
    </div>

    <!-- Auto-populated properties (if file is uploaded) -->
    <div v-if="data?.fileName" class="bg-muted/30 rounded-lg p-4">
      <h4 class="text-sm font-medium mb-3">Document Properties</h4>
      <div class="grid grid-cols-3 gap-4 text-sm">
        <div>
          <span class="text-muted-foreground">File Size:</span>
          <span class="ml-2 font-medium">{{ formatFileSize(data.fileSize || 0) }}</span>
        </div>
        <div>
          <span class="text-muted-foreground">File Type:</span>
          <span class="ml-2 font-medium">{{ data.mimeType }}</span>
        </div>
        <div v-if="data.lastUpdated">
          <span class="text-muted-foreground">Last Updated:</span>
          <span class="ml-2 font-medium">{{ formatDate(data.lastUpdated) }}</span>
        </div>
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

// Define the shape of document resource data
interface DocumentResourceData {
  documentType?: string
  fileName?: string
  fileSize?: number
  mimeType?: string
  version?: string
  author?: string
  url?: string
  lastUpdated?: string
  [key: string]: any
}

interface Props {
  data: DocumentResourceData
  validationErrors?: Record<string, string>
}

interface Emits {
  (e: 'update:field', field: string, value: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const fileInputRef = ref<HTMLInputElement>()

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
  emit('update:field', 'fileName', file.name)
  emit('update:field', 'fileSize', file.size)
  emit('update:field', 'mimeType', file.type)
  emit('update:field', 'lastUpdated', new Date().toISOString())
  
  // Generate a mock URL for demo purposes
  emit('update:field', 'url', `/documents/${file.name}`)
  
  // Set default version if not set
  if (!props.data?.version) {
    emit('update:field', 'version', '1.0')
  }
  
  console.log('File processed:', file.name, file.size, file.type)
}

/**
 * Remove uploaded file
 */
function removeFile() {
  emit('update:field', 'fileName', '')
  emit('update:field', 'fileSize', 0)
  emit('update:field', 'mimeType', '')
  emit('update:field', 'url', '')
  emit('update:field', 'lastUpdated', '')
  
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

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  if (!dateString) return 'Unknown'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
}
</script>
