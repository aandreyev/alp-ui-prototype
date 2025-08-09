<template>
  <div class="url-config space-y-4">
    <!-- URL Input with Validation -->
    <div>
      <label class="text-sm font-medium text-foreground">URL *</label>
      <div class="mt-1 space-y-2">
        <div class="relative">
          <Input 
            :value="modelValue.url || ''"
            @input="handleUrlInput($event.target.value)"
            placeholder="https://example.com/resource"
            :class="[
              validationErrors?.url ? 'border-destructive' : '',
              urlStatus === 'checking' ? 'pr-10' : ''
            ]"
          />
          <div v-if="urlStatus === 'checking'" class="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div class="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
        
        <!-- URL Status -->
        <div v-if="urlStatus !== 'idle'" class="flex items-center gap-2 text-sm">
          <div v-if="urlStatus === 'valid'" class="flex items-center gap-1 text-green-600">
            <CheckCircle class="w-4 h-4" />
            <span>URL is accessible</span>
          </div>
          <div v-else-if="urlStatus === 'invalid'" class="flex items-center gap-1 text-red-600">
            <XCircle class="w-4 h-4" />
            <span>URL appears to be inaccessible</span>
          </div>
          <div v-else-if="urlStatus === 'warning'" class="flex items-center gap-1 text-yellow-600">
            <AlertTriangle class="w-4 h-4" />
            <span>URL format is valid but not verified</span>
          </div>
        </div>
        
        <!-- URL Preview -->
        <div v-if="urlPreview" class="border rounded-lg p-3 bg-muted/30">
          <div class="flex items-start gap-3">
            <div v-if="urlPreview.favicon" class="w-4 h-4 mt-0.5">
              <img :src="urlPreview.favicon" :alt="urlPreview.domain" class="w-full h-full" />
            </div>
            <div v-else class="w-4 h-4 mt-0.5 bg-muted rounded flex items-center justify-center">
              <Link class="w-3 h-3 text-muted-foreground" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate">{{ urlPreview.title || 'No title' }}</p>
              <p class="text-xs text-muted-foreground truncate">{{ urlPreview.domain }}</p>
              <p v-if="urlPreview.description" class="text-xs text-muted-foreground mt-1 line-clamp-2">
                {{ urlPreview.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <p v-if="validationErrors?.url" class="text-sm text-destructive mt-1">
        {{ validationErrors.url }}
      </p>
    </div>

    <!-- URL Classification -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="text-sm font-medium text-foreground">URL Type</label>
        <Select 
          :value="modelValue.urlType || 'website'"
          @update:value="updateField('urlType', $event)"
        >
          <SelectTrigger class="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="website">Website</SelectItem>
            <SelectItem value="document">Document</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="form">Form</SelectItem>
            <SelectItem value="api">API</SelectItem>
            <SelectItem value="download">Download</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label class="text-sm font-medium text-foreground">Access Requirements</label>
        <Select 
          :value="accessRequirement"
          @update:value="setAccessRequirement($event)"
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">Public (no login required)</SelectItem>
            <SelectItem value="registration">Registration required</SelectItem>
            <SelectItem value="subscription">Subscription required</SelectItem>
            <SelectItem value="internal">Internal access only</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <!-- Health Monitoring -->
    <div class="space-y-3">
      <h4 class="text-sm font-medium">Health Monitoring</h4>
      
      <div class="flex items-center space-x-2">
        <input
          id="enableHealthCheck"
          type="checkbox"
          :checked="enableHealthCheck"
          @change="setHealthCheck($event.target.checked)"
          class="rounded border-gray-300"
        />
        <label for="enableHealthCheck" class="text-sm text-foreground">
          Monitor URL accessibility
        </label>
      </div>
      
      <div v-if="enableHealthCheck" class="pl-6 space-y-2">
        <div>
          <label class="text-sm font-medium text-foreground">Check Frequency</label>
          <Select value="daily" @update:value="() => {}">
            <SelectTrigger class="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hourly">Every hour</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div class="text-xs text-muted-foreground">
          We'll check if this URL is accessible and notify you if it goes down.
        </div>
      </div>
    </div>

    <!-- URL Metadata (if available) -->
    <div v-if="urlMetadata" class="bg-muted/30 rounded-lg p-4">
      <h4 class="text-sm font-medium mb-3">URL Information</h4>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span class="text-muted-foreground">Domain:</span>
          <span class="ml-2 font-medium">{{ urlMetadata.domain }}</span>
        </div>
        <div>
          <span class="text-muted-foreground">Type:</span>
          <span class="ml-2 font-medium">{{ urlMetadata.isExternal ? 'External' : 'Internal' }}</span>
        </div>
        <div v-if="urlMetadata.contentType">
          <span class="text-muted-foreground">Content Type:</span>
          <span class="ml-2 font-medium">{{ urlMetadata.contentType }}</span>
        </div>
        <div v-if="urlMetadata.responseTime">
          <span class="text-muted-foreground">Response Time:</span>
          <span class="ml-2 font-medium">{{ urlMetadata.responseTime }}ms</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Link, CheckCircle, XCircle, AlertTriangle } from 'lucide-vue-next'

// UI Components
import { Input } from '@/lib/registry/new-york/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/lib/registry/new-york/ui/select'

// Types
import type { CreateUrlResource } from '@/alp-types/admin-resources.types'

interface Props {
  modelValue: CreateUrlResource & { type: 'url' }
  validationErrors?: Record<string, string>
}

interface Emits {
  (e: 'update:field', field: string, value: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const urlStatus = ref<'idle' | 'checking' | 'valid' | 'invalid' | 'warning'>('idle')
const urlPreview = ref<any>(null)
const enableHealthCheck = ref(false)

// Computed
const accessRequirement = computed(() => {
  // Map internal properties to display value
  if (props.modelValue.metadata?.contentType === 'internal') return 'internal'
  return 'public' // default
})

const urlMetadata = computed(() => {
  if (props.modelValue.url) {
    try {
      const url = new URL(props.modelValue.url)
      return {
        domain: url.hostname,
        isExternal: !url.hostname.includes('localhost') && !url.hostname.includes('127.0.0.1'),
        contentType: props.modelValue.metadata?.contentType,
        responseTime: Math.floor(Math.random() * 500) + 100 // Mock response time
      }
    } catch {
      return null
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
 * Handle URL input with validation
 */
function handleUrlInput(url: string) {
  updateField('url', url)
  
  if (url) {
    validateUrl(url)
  } else {
    urlStatus.value = 'idle'
    urlPreview.value = null
  }
}

/**
 * Validate URL format and accessibility
 */
async function validateUrl(url: string) {
  try {
    new URL(url) // Validate URL format
    
    urlStatus.value = 'checking'
    
    // Mock URL validation - in real app, this would be an API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock response
    const isAccessible = Math.random() > 0.3 // 70% chance of being accessible
    
    if (isAccessible) {
      urlStatus.value = 'valid'
      updateField('isActive', true)
      updateField('domain', new URL(url).hostname)
      updateField('isExternal', !url.includes('localhost'))
      
      // Mock URL preview
      urlPreview.value = {
        title: `Sample Page Title for ${new URL(url).hostname}`,
        description: 'This is a mock description for the URL preview.',
        domain: new URL(url).hostname,
        favicon: `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}`
      }
    } else {
      urlStatus.value = 'invalid'
      updateField('isActive', false)
    }
    
  } catch {
    urlStatus.value = 'warning'
    updateField('isActive', false)
  }
}

/**
 * Set access requirement
 */
function setAccessRequirement(requirement: string) {
  // Map display value to internal properties
  if (requirement === 'internal') {
    updateField('metadata.contentType', 'internal')
  } else {
    updateField('metadata.contentType', 'public')
  }
}

/**
 * Set health monitoring
 */
function setHealthCheck(enabled: boolean) {
  enableHealthCheck.value = enabled
  // In real implementation, this would configure monitoring
  console.log('Health monitoring:', enabled ? 'enabled' : 'disabled')
}

// Watch for URL changes to update metadata
watch(() => props.modelValue.url, (newUrl) => {
  if (newUrl && urlMetadata.value) {
    updateField('domain', urlMetadata.value.domain)
    updateField('isExternal', urlMetadata.value.isExternal)
  }
})
</script>

<style scoped>
.url-config {
  /* Component-specific styles if needed */
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>