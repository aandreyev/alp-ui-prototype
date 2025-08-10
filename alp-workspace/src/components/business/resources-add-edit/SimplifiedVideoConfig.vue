<template>
  <div class="video-config space-y-4">
    <!-- Video Type -->
    <div>
      <label class="text-sm font-medium text-foreground">Video Type</label>
      <Select 
        :modelValue="data?.videoType ?? 'other'"
        @update:modelValue="$emit('update:field', 'videoType', $event)"
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="training">Training Video</SelectItem>
          <SelectItem value="webinar">Webinar</SelectItem>
          <SelectItem value="tutorial">Tutorial</SelectItem>
          <SelectItem value="presentation">Presentation</SelectItem>
          <SelectItem value="demo">Demo</SelectItem>
          <SelectItem value="interview">Interview</SelectItem>
          <SelectItem value="conference">Conference</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Source Selection -->
    <div>
      <label class="text-sm font-medium text-foreground">Source *</label>
      <div class="space-y-3">
        <!-- Source Type Selection -->
        <div class="flex gap-4">
          <label class="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              :checked="sourceType === 'upload'"
              @change="setSourceType('upload')"
              class="rounded border-gray-300"
            />
            <span class="text-sm">Upload Video</span>
          </label>
          <label class="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              :checked="sourceType === 'url'"
              @change="setSourceType('url')"
              class="rounded border-gray-300"
            />
            <span class="text-sm">Video URL</span>
          </label>
        </div>

        <!-- Upload Section -->
        <div v-if="sourceType === 'upload'">
          <div 
            v-if="!data?.fileName"
            class="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
            @click="triggerFileUpload"
            @drop="handleDrop"
            @dragover.prevent
            @dragenter.prevent
          >
            <Video class="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
            <p class="text-sm text-foreground mb-1">Click to upload or drag and drop</p>
            <p class="text-xs text-muted-foreground">MP4, MOV, AVI, or other video files</p>
          </div>
          
          <div v-else class="border rounded-lg p-4 bg-muted/30">
            <div class="flex items-center gap-3">
              <Video class="w-5 h-5 text-primary" />
              <div class="flex-1">
                <p class="text-sm font-medium">{{ data?.fileName }}</p>
                <p class="text-xs text-muted-foreground">
                  {{ formatFileSize(data?.fileSize || 0) }} • {{ data?.mimeType }}
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
            accept="video/*"
            @change="handleFileSelect"
          />
        </div>

        <!-- URL Section -->
        <div v-if="sourceType === 'url'">
          <Input 
            :modelValue="data?.videoUrl ?? ''"
            @update:modelValue="$emit('update:field', 'videoUrl', $event)"
            placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
            :class="validationErrors?.videoUrl ? 'border-destructive' : ''"
          />
          <p v-if="validationErrors?.videoUrl" class="text-sm text-destructive mt-1">
            {{ validationErrors.videoUrl }}
          </p>
          <p class="text-xs text-muted-foreground mt-1">
            Supports YouTube, Vimeo, and direct video URLs
          </p>
        </div>
      </div>
    </div>

    <!-- Author -->
    <div>
      <label class="text-sm font-medium text-foreground">Author</label>
      <Input 
        :modelValue="data?.author ?? ''"
        @update:modelValue="$emit('update:field', 'author', $event)"
        placeholder="Video creator or presenter"
      />
    </div>

    <!-- Video Preview (if source is provided) -->
    <div v-if="hasVideoSource()" class="bg-muted/30 rounded-lg p-4">
      <h4 class="text-sm font-medium mb-3">Video Details</h4>
      <div class="flex items-center gap-3 mb-3">
        <Video class="w-5 h-5 text-primary" />
        <div class="flex-1">
          <p class="text-sm font-medium">
            {{ sourceType === 'upload' ? data?.fileName : extractVideoTitle(data?.videoUrl) }}
          </p>
          <p class="text-xs text-muted-foreground">
            {{ getVideoTypeLabel(data?.videoType) }}
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          @click="previewVideo"
          :disabled="loading"
        >
          <Play class="w-4 h-4 mr-2" />
          {{ loading ? 'Loading...' : 'Preview' }}
        </Button>
      </div>
      
      <!-- Video Properties -->
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span class="text-muted-foreground">Source:</span>
          <span class="ml-2 font-medium">{{ sourceType === 'upload' ? 'Upload' : 'URL' }}</span>
        </div>
        <div>
          <span class="text-muted-foreground">Type:</span>
          <span class="ml-2 font-medium">{{ getVideoTypeLabel(data?.videoType) }}</span>
        </div>
      </div>
      
      <!-- Auto-populated properties -->
      <div v-if="videoStats" class="mt-3 grid grid-cols-3 gap-4 text-sm">
        <div v-if="videoStats.duration">
          <span class="text-muted-foreground">Duration:</span>
          <span class="ml-2 font-medium">{{ formatDuration(videoStats.duration) }}</span>
        </div>
        <div v-if="videoStats.thumbnail">
          <span class="text-muted-foreground">Thumbnail:</span>
          <span class="ml-2 font-medium text-green-600">Generated</span>
        </div>
        <div v-if="data?.lastUpdated">
          <span class="text-muted-foreground">Last Updated:</span>
          <span class="ml-2 font-medium">{{ formatDate(data?.lastUpdated) }}</span>
        </div>
      </div>
    </div>

    <!-- Video Platform Support -->
    <div class="bg-muted/30 rounded-lg p-4">
      <h4 class="text-sm font-medium mb-3">Supported Platforms</h4>
      <div class="grid grid-cols-2 gap-2 text-xs">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 bg-red-500 rounded-full"></div>
          <span>YouTube</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span>Vimeo</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Direct MP4</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 bg-purple-500 rounded-full"></div>
          <span>File Upload</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Video, X, Play } from 'lucide-vue-next'

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

interface Props {
  data: any
  validationErrors?: Record<string, string>
}

interface Emits {
  (e: 'update:field', field: string, value: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const fileInputRef = ref<HTMLInputElement>()
const loading = ref(false)
const videoStats = ref<any>(null)

const sourceType = computed(() => {
  if (props.data?.fileName) return 'upload'
  if (props.data?.videoUrl) return 'url'
  return 'upload' // default
})

/**
 * Set source type and clear other source
 */
function setSourceType(type: 'upload' | 'url') {
  if (type === 'upload') {
    emit('update:field', 'videoUrl', '')
  } else {
    emit('update:field', 'fileName', '')
    emit('update:field', 'fileSize', 0)
    emit('update:field', 'mimeType', '')
  }
}

/**
 * Check if video source is provided
 */
function hasVideoSource(): boolean {
  return !!(props.data?.fileName || props.data?.videoUrl)
}

/**
 * Get video type label
 */
function getVideoTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'training': 'Training Video',
    'webinar': 'Webinar',
    'tutorial': 'Tutorial',
    'presentation': 'Presentation',
    'demo': 'Demo',
    'interview': 'Interview',
    'conference': 'Conference',
    'other': 'Other'
  }
  return labels[type] || 'Other'
}

/**
 * Extract video title from URL
 */
function extractVideoTitle(url: string): string {
  if (!url) return 'Video'
  
  try {
    const urlObj = new URL(url)
    if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
      return 'YouTube Video'
    } else if (urlObj.hostname.includes('vimeo.com')) {
      return 'Vimeo Video'
    } else {
      return 'Video URL'
    }
  } catch {
    return 'Invalid URL'
  }
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
  // Clear URL source
  emit('update:field', 'videoUrl', '')
  
  // Update file information
  emit('update:field', 'fileName', file.name)
  emit('update:field', 'fileSize', file.size)
  emit('update:field', 'mimeType', file.type)
  emit('update:field', 'lastUpdated', new Date().toISOString())
  
  // Generate a mock URL for demo purposes
  emit('update:field', 'url', `/videos/${file.name}`)
  
  console.log('Video file processed:', file.name, file.size, file.type)
  
  // Load video stats
  loadVideoStats()
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
  
  videoStats.value = null
}

/**
 * Preview video
 */
async function previewVideo() {
  if (!hasVideoSource()) return
  
  loading.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (props.data?.videoUrl) {
      // Open video URL in new window
      window.open(props.data.videoUrl, '_blank')
    } else {
      // For uploaded files, would open video player
      console.log('Opening video player for:', props.data?.fileName)
    }
  } catch (error) {
    console.error('Failed to preview video:', error)
  } finally {
    loading.value = false
  }
}

/**
 * Load video statistics (mock)
 */
async function loadVideoStats() {
  if (!hasVideoSource()) {
    videoStats.value = null
    return
  }
  
  try {
    // Simulate API call to get video stats
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock video statistics
    videoStats.value = {
      duration: Math.floor(Math.random() * 3600) + 60, // 1 minute to 1 hour
      thumbnail: true,
      resolution: '1920x1080',
      bitrate: '2.5 Mbps'
    }
    
    // Update model with duration
    emit('update:field', 'duration', videoStats.value.duration)
    emit('update:field', 'thumbnail', `/thumbnails/${Date.now()}.jpg`)
    
    console.log('Video stats loaded:', videoStats.value)
  } catch (error) {
    console.error('Failed to load video stats:', error)
    videoStats.value = null
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
 * Format duration for display
 */
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
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

// Watch for video URL changes to load stats
watch(() => props.data?.videoUrl, (newUrl) => {
  if (newUrl) {
    loadVideoStats()
  } else if (!props.data?.fileName) {
    videoStats.value = null
  }
}, { immediate: true })
</script>
