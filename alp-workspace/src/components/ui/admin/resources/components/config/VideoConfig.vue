<template>
  <div class="video-config space-y-4">
    <!-- Video Source -->
    <div>
      <label class="text-sm font-medium text-foreground">Video Source *</label>
      <div class="mt-1 space-y-3">
        <!-- Source Type Selection -->
        <div class="flex items-center gap-4">
          <div class="flex items-center space-x-2">
            <input
              id="sourceUpload"
              type="radio"
              :checked="videoSource === 'upload'"
              @change="setVideoSource('upload')"
              name="videoSource"
              class="text-primary"
            />
            <label for="sourceUpload" class="text-sm text-foreground">Upload File</label>
          </div>
          <div class="flex items-center space-x-2">
            <input
              id="sourceUrl"
              type="radio"
              :checked="videoSource === 'url'"
              @change="setVideoSource('url')"
              name="videoSource"
              class="text-primary"
            />
            <label for="sourceUrl" class="text-sm text-foreground">Video URL</label>
          </div>
        </div>
        
        <!-- File Upload -->
        <div v-if="videoSource === 'upload'">
          <div 
            v-if="!modelValue.fileName"
            class="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
            @click="triggerFileUpload"
            @drop="handleDrop"
            @dragover.prevent
            @dragenter.prevent
          >
            <Video class="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
            <p class="text-sm text-foreground mb-1">Click to upload or drag and drop</p>
            <p class="text-xs text-muted-foreground">MP4, MOV, AVI, or WebM files (max 500MB)</p>
          </div>
          
          <div v-else class="border rounded-lg p-4 bg-muted/30">
            <div class="flex items-center gap-3">
              <Video class="w-5 h-5 text-primary" />
              <div class="flex-1">
                <p class="text-sm font-medium">{{ modelValue.fileName }}</p>
                <p class="text-xs text-muted-foreground">
                  {{ formatFileSize(modelValue.fileSize) }} • {{ modelValue.format }}
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
        
        <!-- URL Input -->
        <div v-else-if="videoSource === 'url'">
          <div class="space-y-2">
            <Select 
              :value="modelValue.hostingPlatform || 'youtube'"
              @update:value="updateField('hostingPlatform', $event)"
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="vimeo">Vimeo</SelectItem>
                <SelectItem value="azure_media">Azure Media Services</SelectItem>
                <SelectItem value="local">Local/Custom Server</SelectItem>
              </SelectContent>
            </Select>
            
            <Input 
              :value="modelValue.videoUrl || ''"
              @input="handleUrlInput($event.target.value)"
              placeholder="https://youtube.com/watch?v=..."
              :class="validationErrors?.videoUrl ? 'border-destructive' : ''"
            />
            
            <!-- Video Preview -->
            <div v-if="videoPreview" class="border rounded-lg p-3 bg-muted/30">
              <div class="flex items-start gap-3">
                <div class="w-16 h-12 bg-muted rounded overflow-hidden">
                  <img v-if="videoPreview.thumbnail" :src="videoPreview.thumbnail" :alt="videoPreview.title" class="w-full h-full object-cover" />
                  <div v-else class="w-full h-full flex items-center justify-center">
                    <Video class="w-6 h-6 text-muted-foreground" />
                  </div>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium">{{ videoPreview.title }}</p>
                  <p class="text-xs text-muted-foreground">
                    {{ formatDuration(videoPreview.duration) }} • {{ videoPreview.platform }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <p v-if="validationErrors?.videoUrl" class="text-sm text-destructive">
          {{ validationErrors.videoUrl }}
        </p>
      </div>
    </div>

    <!-- Video Information -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label class="text-sm font-medium text-foreground">Duration (seconds)</label>
        <Input 
          type="number"
          :value="modelValue.duration || 0"
          @input="updateField('duration', parseInt($event.target.value) || 0)"
          placeholder="300"
          min="0"
          class="w-28"
        />
      </div>
      
      <div>
        <label class="text-sm font-medium text-foreground">Video Type</label>
        <Select 
          :value="modelValue.videoType || 'training'"
          @update:value="updateField('videoType', $event)"
        >
          <SelectTrigger class="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="training">Training</SelectItem>
            <SelectItem value="presentation">Presentation</SelectItem>
            <SelectItem value="tutorial">Tutorial</SelectItem>
            <SelectItem value="meeting">Meeting Recording</SelectItem>
            <SelectItem value="webinar">Webinar</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label class="text-sm font-medium text-foreground">Difficulty Level</label>
        <Select 
          :value="modelValue.difficulty || 'beginner'"
          @update:value="updateField('difficulty', $event)"
        >
          <SelectTrigger class="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <!-- Video Metadata -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="text-sm font-medium text-foreground">Resolution/Quality</label>
        <Select 
          :value="modelValue.resolution || '1080p'"
          @update:value="updateField('resolution', $event)"
        >
          <SelectTrigger class="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="720p">720p HD</SelectItem>
            <SelectItem value="1080p">1080p Full HD</SelectItem>
            <SelectItem value="1440p">1440p QHD</SelectItem>
            <SelectItem value="4k">4K UHD</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label class="text-sm font-medium text-foreground">Target Audience</label>
        <TagInput 
          :value="modelValue.audience || []"
          @update:value="updateField('audience', $event)"
          placeholder="Add audience tags..."
        />
      </div>
    </div>

    <!-- Topics -->
    <div>
      <label class="text-sm font-medium text-foreground">Topics</label>
      <TagInput 
        :value="modelValue.topics || []"
        @update:value="updateField('topics', $event)"
        placeholder="Add topic tags..."
      />
    </div>

    <!-- Chapters -->
    <div>
      <label class="text-sm font-medium text-foreground">Video Chapters</label>
      <div class="mt-2 space-y-2">
        <div v-for="(chapter, index) in videoChapters" :key="index" class="border rounded-lg p-3">
          <div class="grid grid-cols-12 gap-2 items-start">
            <div class="col-span-4">
              <Input 
                :value="chapter.title"
                @input="updateChapter(index, 'title', $event.target.value)"
                placeholder="Chapter title"
                class="text-sm"
              />
            </div>
            <div class="col-span-2">
              <Input 
                type="number"
                :value="chapter.startTime"
                @input="updateChapter(index, 'startTime', parseInt($event.target.value) || 0)"
                placeholder="Start (s)"
                class="text-sm"
                min="0"
              />
            </div>
            <div class="col-span-2">
              <Input 
                type="number"
                :value="chapter.endTime"
                @input="updateChapter(index, 'endTime', parseInt($event.target.value) || 0)"
                placeholder="End (s)"
                class="text-sm"
                min="0"
              />
            </div>
            <div class="col-span-3">
              <Input 
                :value="chapter.description || ''"
                @input="updateChapter(index, 'description', $event.target.value)"
                placeholder="Description"
                class="text-sm"
              />
            </div>
            <div class="col-span-1">
              <Button 
                variant="ghost" 
                size="sm"
                @click="removeChapter(index)"
                class="text-muted-foreground hover:text-destructive"
              >
                <X class="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          @click="addChapter"
          class="w-full"
        >
          <Plus class="w-4 h-4 mr-2" />
          Add Chapter
        </Button>
      </div>
    </div>

    <!-- Accessibility -->
    <div class="space-y-3">
      <h4 class="text-sm font-medium">Accessibility</h4>
      
      <div class="space-y-2">
        <div class="flex items-center space-x-2">
          <input
            id="hasSubtitles"
            type="checkbox"
            :checked="modelValue.hasSubtitles || false"
            @change="updateField('hasSubtitles', $event.target.checked)"
            class="rounded border-gray-300"
          />
          <label for="hasSubtitles" class="text-sm text-foreground">
            Has subtitles/captions
          </label>
        </div>
        
        <div v-if="modelValue.hasSubtitles" class="pl-6">
          <label class="text-sm font-medium text-foreground">Subtitle Languages</label>
          <TagInput 
            :value="modelValue.subtitleLanguages || []"
            @update:value="updateField('subtitleLanguages', $event)"
            placeholder="e.g., en, es, fr"
            :maxTags="5"
          />
        </div>
        
        <div class="flex items-center space-x-2">
          <input
            id="hasTranscript"
            type="checkbox"
            :checked="modelValue.hasTranscript || false"
            @change="updateField('hasTranscript', $event.target.checked)"
            class="rounded border-gray-300"
          />
          <label for="hasTranscript" class="text-sm text-foreground">
            Has transcript
          </label>
        </div>
      </div>
    </div>

    <!-- Video Analytics (if video exists) -->
    <div v-if="videoAnalytics" class="bg-muted/30 rounded-lg p-4">
      <h4 class="text-sm font-medium mb-3">Video Analytics</h4>
      <div class="grid grid-cols-4 gap-4 text-sm">
        <div>
          <span class="text-muted-foreground">Views:</span>
          <span class="ml-2 font-medium">{{ videoAnalytics.views }}</span>
        </div>
        <div>
          <span class="text-muted-foreground">Unique Viewers:</span>
          <span class="ml-2 font-medium">{{ videoAnalytics.uniqueViewers }}</span>
        </div>
        <div>
          <span class="text-muted-foreground">Avg. Watch Time:</span>
          <span class="ml-2 font-medium">{{ videoAnalytics.avgWatchTime }}%</span>
        </div>
        <div>
          <span class="text-muted-foreground">Completion Rate:</span>
          <span class="ml-2 font-medium">{{ videoAnalytics.completionRate }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Video, X, Plus } from 'lucide-vue-next'

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

// Custom Components
import TagInput from '../TagInput.vue'

// Types
import type { CreateVideoResource, VideoChapter } from '@/alp-types/admin-resources.types'

interface Props {
  modelValue: CreateVideoResource & { type: 'video' }
  validationErrors?: Record<string, string>
}

interface Emits {
  (e: 'update:field', field: string, value: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const videoSource = ref<'upload' | 'url'>('url')
const fileInputRef = ref<HTMLInputElement>()
const videoPreview = ref<any>(null)

// Computed
const videoChapters = computed(() => props.modelValue.chapters || [])

const videoAnalytics = computed(() => {
  if (props.modelValue.videoUrl) {
    return {
      views: props.modelValue.viewCount || 0,
      uniqueViewers: props.modelValue.uniqueViewers || 0,
      avgWatchTime: Math.floor(Math.random() * 40) + 60, // Mock 60-100%
      completionRate: Math.floor(Math.random() * 30) + 70 // Mock 70-100%
    }
  }
  return null
})

/**
 * Update field value
 */
function updateField(field: string, value: any) {
  emit('update:field', field, value)
}

/**
 * Set video source type
 */
function setVideoSource(source: 'upload' | 'url') {
  videoSource.value = source
  
  // Clear opposite source data
  if (source === 'upload') {
    updateField('videoUrl', '')
    updateField('hostingPlatform', 'local')
  } else {
    updateField('fileName', '')
    updateField('fileSize', 0)
  }
}

/**
 * Trigger file upload
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
    processVideoFile(file)
  }
}

/**
 * Handle drag and drop
 */
function handleDrop(event: DragEvent) {
  event.preventDefault()
  const file = event.dataTransfer?.files[0]
  if (file && file.type.startsWith('video/')) {
    processVideoFile(file)
  }
}

/**
 * Process uploaded video file
 */
function processVideoFile(file: File) {
  updateField('fileName', file.name)
  updateField('fileSize', file.size)
  updateField('format', file.type.split('/')[1] || 'mp4')
  updateField('hostingPlatform', 'local')
  
  // Generate mock URL
  updateField('videoUrl', `/videos/${file.name}`)
  
  // Mock video metadata extraction
  setTimeout(() => {
    updateField('duration', Math.floor(Math.random() * 1800) + 300) // 5-35 minutes
    updateField('resolution', '1080p')
  }, 500)
  
  console.log('Video file processed:', file.name, file.size)
}

/**
 * Remove uploaded file
 */
function removeFile() {
  updateField('fileName', '')
  updateField('fileSize', 0)
  updateField('format', '')
  updateField('videoUrl', '')
  updateField('duration', 0)
  
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

/**
 * Handle URL input
 */
function handleUrlInput(url: string) {
  updateField('videoUrl', url)
  
  if (url) {
    extractVideoMetadata(url)
  } else {
    videoPreview.value = null
  }
}

/**
 * Extract video metadata from URL
 */
async function extractVideoMetadata(url: string) {
  // Mock metadata extraction
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  let platform = 'unknown'
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    platform = 'YouTube'
    updateField('hostingPlatform', 'youtube')
  } else if (url.includes('vimeo.com')) {
    platform = 'Vimeo'
    updateField('hostingPlatform', 'vimeo')
  }
  
  // Mock video preview
  videoPreview.value = {
    title: `Sample Video Title`,
    duration: Math.floor(Math.random() * 1800) + 300,
    platform,
    thumbnail: `https://via.placeholder.com/160x120/666/fff?text=Video`
  }
  
  updateField('duration', videoPreview.value.duration)
}

/**
 * Add new chapter
 */
function addChapter() {
  const newChapter: VideoChapter = {
    id: `chapter-${Date.now()}`,
    title: '',
    startTime: 0,
    endTime: 0
  }
  
  const chapters = [...videoChapters.value, newChapter]
  updateField('chapters', chapters)
}

/**
 * Remove chapter
 */
function removeChapter(index: number) {
  const chapters = videoChapters.value.filter((_, i) => i !== index)
  updateField('chapters', chapters)
}

/**
 * Update chapter property
 */
function updateChapter(index: number, property: string, value: any) {
  const chapters = [...videoChapters.value]
  chapters[index] = { ...chapters[index], [property]: value }
  updateField('chapters', chapters)
}

/**
 * Format file size
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
 * Format duration in seconds to MM:SS
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
</script>

<style scoped>
.video-config {
  /* Component-specific styles if needed */
}
</style>