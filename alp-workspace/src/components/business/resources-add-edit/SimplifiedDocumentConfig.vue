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

    <!-- Versioning and Author -->
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="text-sm font-medium text-foreground">Version</label>
        <Input 
          :modelValue="activeVersionLabel"
          readonly
          class="bg-muted text-muted-foreground"
        />
        <p class="text-xs text-muted-foreground mt-1">Managed automatically when new versions are uploaded</p>
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

    <!-- Version history selector (if any) -->
    <div v-if="versionHistory.length" class="border rounded-lg p-3 bg-muted/30">
      <div class="flex items-center justify-between mb-2">
        <div class="text-sm font-medium">Versions</div>
        <Button size="sm" variant="outline" @click="triggerFileUpload">Upload new version</Button>
      </div>
      <div class="space-y-2">
        <div 
          v-for="v in sortedVersionHistory" 
          :key="v.id" 
          class="flex items-center justify-between p-2 rounded cursor-pointer hover:bg-muted"
          @click="selectVersion(v)"
        >
          <div>
            <div class="text-sm font-medium">v{{ v.version }} • {{ v.fileName }}</div>
            <div class="text-xs text-muted-foreground">{{ formatDate(v.uploadedAt) }} • {{ v.mimeType }} • {{ formatFileSize(v.fileSize) }}</div>
          </div>
          <span 
            v-if="isActiveVersion(v)" 
            class="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary"
          >Active</span>
        </div>
      </div>
    </div>

    <!-- Auto-populated properties (if file is uploaded) -->
    <div v-if="data?.fileName" class="bg-muted/30 rounded-lg p-4">
      <h4 class="text-sm font-medium mb-3">Document Properties</h4>
      <!-- First row: File Size and Last Updated -->
      <div class="grid grid-cols-2 gap-4 text-sm mb-3">
        <div>
          <span class="text-muted-foreground">File Size:</span>
          <span class="ml-2 font-medium">{{ formatFileSize(data.fileSize || 0) }}</span>
        </div>
        <div v-if="data.lastUpdated">
          <span class="text-muted-foreground">Last Updated:</span>
          <span class="ml-2 font-medium">{{ formatDate(data.lastUpdated) }}</span>
        </div>
      </div>
      <!-- Second row: File Type (full width) -->
      <div class="text-sm">
        <span class="text-muted-foreground">File Type:</span>
        <span class="ml-2 font-medium">{{ data.mimeType }}</span>
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
  const uploadedAt = new Date().toISOString()
  const nextVersion = computeNextVersion(currentVersionRaw.value)
  const newVersion = {
    id: `v-${Date.now()}`,
    version: nextVersion,
    fileName: file.name,
    url: `/documents/${file.name}`,
    fileSize: file.size,
    mimeType: file.type,
    uploadedAt
  }

  const history = [...versionHistory.value, newVersion]
  emit('update:field', 'metadata.versionHistory', history)
  emit('update:field', 'metadata.activeVersionId', newVersion.id)

  // Mirror active version fields to top-level for compatibility
  emit('update:field', 'fileName', newVersion.fileName)
  emit('update:field', 'fileSize', newVersion.fileSize)
  emit('update:field', 'mimeType', newVersion.mimeType)
  emit('update:field', 'url', newVersion.url)
  emit('update:field', 'version', newVersion.version)
  emit('update:field', 'lastUpdated', uploadedAt)

  console.log('Uploaded new document version:', newVersion)
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

// Versioning helpers
import type { DocumentVersion } from '@/alp-types/resources.types'
import { computed as vComputed } from 'vue'

const versionHistory = vComputed<DocumentVersion[]>(() => props.data?.metadata?.versionHistory || [])
const activeVersionId = vComputed<string | undefined>(() => props.data?.metadata?.activeVersionId)
const sortedVersionHistory = vComputed(() => [...versionHistory.value].sort((a,b) => (a.uploadedAt < b.uploadedAt ? 1 : -1)))

const currentVersionRaw = vComputed<string>(() => props.data?.version || (versionHistory.value.find(v => v.id === activeVersionId.value)?.version ?? '1.0'))
const activeVersionLabel = vComputed<string>(() => `v${currentVersionRaw.value}`)

function isActiveVersion(v: DocumentVersion) {
  return v.id === activeVersionId.value
}

function selectVersion(v: DocumentVersion) {
  emit('update:field', 'metadata.activeVersionId', v.id)
  // Mirror to top-level
  emit('update:field', 'fileName', v.fileName)
  emit('update:field', 'fileSize', v.fileSize)
  emit('update:field', 'mimeType', v.mimeType)
  emit('update:field', 'url', v.url)
  emit('update:field', 'version', v.version)
  emit('update:field', 'lastUpdated', v.uploadedAt)
}

function computeNextVersion(current: string): string {
  const m = String(current || '1.0').match(/^(\d+)\.(\d+)$/)
  if (!m) return '1.0'
  const major = Number(m[1])
  const minor = Number(m[2])
  return `${major}.${minor + 1}`
}
</script>
