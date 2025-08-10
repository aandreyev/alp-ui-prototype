<template>
  <div class="url-config space-y-4">
    <!-- URL Path -->
    <div>
      <label class="text-sm font-medium text-foreground">URL Path *</label>
      <Input 
        :modelValue="data?.url ?? ''"
        @update:modelValue="$emit('update:field', 'url', $event)"
        placeholder="https://example.com/resource"
        :class="validationErrors?.url ? 'border-destructive' : ''"
      />
      <p v-if="validationErrors?.url" class="text-sm text-destructive mt-1">
        {{ validationErrors.url }}
      </p>
      <p class="text-xs text-muted-foreground mt-1">
        Enter the full URL including https://
      </p>
    </div>

    <!-- URL Type -->
    <div>
      <label class="text-sm font-medium text-foreground">URL Type</label>
      <Select 
        :modelValue="data?.urlType ?? 'external'"
        @update:modelValue="$emit('update:field', 'urlType', $event)"
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="external">External Link</SelectItem>
          <SelectItem value="internal">Internal Resource</SelectItem>
          <SelectItem value="government">Government Form</SelectItem>
          <SelectItem value="legal">Legal Database</SelectItem>
          <SelectItem value="client">Client Portal</SelectItem>
          <SelectItem value="reference">Reference Material</SelectItem>
          <SelectItem value="tool">Online Tool</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- URL Preview (if URL is valid) -->
    <div v-if="isValidUrl(data?.url)" class="bg-muted/30 rounded-lg p-4">
      <h4 class="text-sm font-medium mb-3">URL Preview</h4>
      <div class="flex items-center gap-3">
        <Link class="w-5 h-5 text-primary" />
        <div class="flex-1">
          <p class="text-sm font-medium">{{ extractDomain(data?.url) }}</p>
          <p class="text-xs text-muted-foreground truncate">{{ data?.url }}</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          @click="testUrl"
          :disabled="testing"
        >
          <ExternalLink class="w-4 h-4 mr-2" />
          {{ testing ? 'Testing...' : 'Test' }}
        </Button>
      </div>
      
      <!-- URL Status -->
      <div class="mt-3 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span class="text-muted-foreground">Domain:</span>
          <span class="ml-2 font-medium">{{ extractDomain(data?.url) }}</span>
        </div>
        <div>
          <span class="text-muted-foreground">Monitor Status:</span>
          <span class="ml-2 font-medium" :class="getStatusColor()">
            {{ getMonitorStatus() }}
          </span>
        </div>
      </div>
      
      <div v-if="data?.lastUpdated" class="mt-2 text-sm">
        <span class="text-muted-foreground">Last Updated:</span>
        <span class="ml-2 font-medium">{{ formatDate(data?.lastUpdated) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Link, ExternalLink } from 'lucide-vue-next'

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

// Define the shape of URL resource data
interface UrlResourceData {
  url?: string
  urlType?: string
  monitorStatus?: string
  lastChecked?: string
  lastUpdated?: string
  [key: string]: any
}

interface Props {
  data: UrlResourceData
  validationErrors?: Record<string, string>
}

interface Emits {
  (e: 'update:field', field: string, value: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const testing = ref(false)

/**
 * Check if URL is valid
 */
function isValidUrl(url?: string): boolean {
  if (!url) return false
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Extract domain from URL
 */
function extractDomain(url?: string): string {
  if (!url) return ''
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch {
    return 'Invalid URL'
  }
}

/**
 * Test URL accessibility
 */
async function testUrl() {
  if (!isValidUrl(props.data?.url)) return
  
  testing.value = true
  
  try {
    // Simulate URL testing
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Mock result - in real implementation, this would make an actual request
    const isActive = Math.random() > 0.2 // 80% chance of being active
    
    emit('update:field', 'monitorStatus', isActive ? 'active' : 'broken')
    emit('update:field', 'lastChecked', new Date().toISOString())
    
    // Also update lastUpdated when URL is tested
    emit('update:field', 'lastUpdated', new Date().toISOString())
    
    console.log('URL test result:', isActive ? 'Active' : 'Broken')
  } catch (error) {
    emit('update:field', 'monitorStatus', 'error')
    console.error('URL test failed:', error)
  } finally {
    testing.value = false
  }
}

/**
 * Get monitor status display text
 */
function getMonitorStatus(): string {
  const status = props.data?.monitorStatus
  switch (status) {
    case 'active': return 'Active'
    case 'broken': return 'Broken'
    case 'error': return 'Error'
    default: return 'Unknown'
  }
}

/**
 * Get status color class
 */
function getStatusColor(): string {
  const status = props.data?.monitorStatus
  switch (status) {
    case 'active': return 'text-green-600'
    case 'broken': return 'text-red-600'
    case 'error': return 'text-orange-600'
    default: return 'text-muted-foreground'
  }
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
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}
</script>
