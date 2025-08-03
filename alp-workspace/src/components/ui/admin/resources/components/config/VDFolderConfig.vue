<template>
  <div class="vd-folder-config space-y-4">
    <!-- SharePoint Site Selection -->
    <div>
      <label class="text-sm font-medium text-foreground">SharePoint Site *</label>
      <div class="mt-1 space-y-2">
        <Select 
          :value="selectedSiteId"
          @update:value="selectSite($event)"
        >
          <SelectTrigger>
            <SelectValue placeholder="Select SharePoint site" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="site1">Legal Documents - Main Site</SelectItem>
            <SelectItem value="site2">Client Resources - Secondary</SelectItem>
            <SelectItem value="site3">Templates & Forms</SelectItem>
            <SelectItem value="custom">Enter custom URL</SelectItem>
          </SelectContent>
        </Select>
        
        <!-- Custom URL Input -->
        <div v-if="selectedSiteId === 'custom'">
          <Input 
            :value="modelValue.sharePointSiteUrl || ''"
            @input="updateField('sharePointSiteUrl', $event.target.value)"
            placeholder="https://yourorg.sharepoint.com/sites/sitename"
            :class="validationErrors?.sharePointSiteUrl ? 'border-destructive' : ''"
          />
          <p v-if="validationErrors?.sharePointSiteUrl" class="text-sm text-destructive mt-1">
            {{ validationErrors.sharePointSiteUrl }}
          </p>
        </div>
      </div>
    </div>

    <!-- Folder Path Selection -->
    <div>
      <label class="text-sm font-medium text-foreground">Folder Path *</label>
      <div class="mt-1 space-y-2">
        <div class="flex items-center gap-2">
          <Input 
            :value="modelValue.sharePointFolderPath || ''"
            @input="updateField('sharePointFolderPath', $event.target.value)"
            placeholder="/Shared Documents/VD Resources"
            :class="validationErrors?.sharePointFolderPath ? 'border-destructive' : ''"
            class="flex-1"
          />
          <Button 
            variant="outline" 
            size="sm"
            @click="browseFolders"
            :disabled="!modelValue.sharePointSiteUrl"
          >
            <FolderOpen class="w-4 h-4 mr-2" />
            Browse
          </Button>
        </div>
        
        <!-- Folder Preview -->
        <div v-if="folderPreview" class="border rounded-lg p-3 bg-muted/30">
          <div class="flex items-start gap-3">
            <FolderOpen class="w-5 h-5 mt-0.5 text-primary" />
            <div class="flex-1">
              <p class="text-sm font-medium">{{ folderPreview.name }}</p>
              <p class="text-xs text-muted-foreground">
                {{ folderPreview.itemCount }} items • Last modified {{ formatDate(folderPreview.lastModified) }}
              </p>
              <div class="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                <span>{{ folderPreview.size }}</span>
                <span>{{ folderPreview.subfolders }} subfolders</span>
              </div>
            </div>
            <div class="flex items-center gap-1">
              <div :class="[
                'w-2 h-2 rounded-full',
                folderPreview.accessible ? 'bg-green-500' : 'bg-red-500'
              ]"></div>
              <span class="text-xs text-muted-foreground">
                {{ folderPreview.accessible ? 'Accessible' : 'No access' }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <p v-if="validationErrors?.sharePointFolderPath" class="text-sm text-destructive mt-1">
        {{ validationErrors.sharePointFolderPath }}
      </p>
    </div>

    <!-- Sync Settings -->
    <div class="space-y-3">
      <h4 class="text-sm font-medium">Synchronization Settings</h4>
      
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-sm font-medium text-foreground">Sync Frequency</label>
          <Select value="daily" @update:value="setSyncFrequency($event)">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="realtime">Real-time</SelectItem>
              <SelectItem value="hourly">Every hour</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="manual">Manual only</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label class="text-sm font-medium text-foreground">Sync Direction</label>
          <Select value="readonly" @update:value="setSyncDirection($event)">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="readonly">Read-only (from SharePoint)</SelectItem>
              <SelectItem value="bidirectional">Bidirectional</SelectItem>
              <SelectItem value="upload">Upload only (to SharePoint)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div class="space-y-2">
        <div class="flex items-center space-x-2">
          <input
            id="inheritPermissions"
            type="checkbox"
            :checked="modelValue.inheritPermissions !== false"
            @change="updateField('inheritPermissions', $event.target.checked)"
            class="rounded border-gray-300"
          />
          <label for="inheritPermissions" class="text-sm text-foreground">
            Inherit SharePoint permissions
          </label>
        </div>
        
        <div class="flex items-center space-x-2">
          <input
            id="enableWebhooks"
            type="checkbox"
            :checked="enableWebhooks"
            @change="setWebhooks($event.target.checked)"
            class="rounded border-gray-300"
          />
          <label for="enableWebhooks" class="text-sm text-foreground">
            Enable real-time notifications
          </label>
        </div>
      </div>
    </div>

    <!-- Folder Organization -->
    <div class="space-y-3">
      <h4 class="text-sm font-medium">Folder Organization</h4>
      
      <div>
        <label class="text-sm font-medium text-foreground">Auto-organize by</label>
        <Select value="none" @update:value="setOrganization($event)">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No auto-organization</SelectItem>
            <SelectItem value="date">Date created</SelectItem>
            <SelectItem value="type">File type</SelectItem>
            <SelectItem value="matter">Matter/case</SelectItem>
            <SelectItem value="client">Client</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label class="text-sm font-medium text-foreground">File naming convention</label>
        <Input 
          placeholder="e.g., {matter}_{date}_{filename}"
          value=""
          @input="setNamingConvention($event.target.value)"
        />
        <p class="text-xs text-muted-foreground mt-1">
          Use {matter}, {date}, {client}, {filename} as placeholders
        </p>
      </div>
    </div>

    <!-- Connection Status -->
    <div v-if="connectionStatus" class="border rounded-lg p-3" :class="[
      connectionStatus.connected ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
    ]">
      <div class="flex items-start gap-3">
        <div :class="[
          'w-5 h-5 mt-0.5',
          connectionStatus.connected ? 'text-green-600' : 'text-red-600'
        ]">
          <CheckCircle v-if="connectionStatus.connected" class="w-full h-full" />
          <XCircle v-else class="w-full h-full" />
        </div>
        <div class="flex-1">
          <p class="text-sm font-medium" :class="[
            connectionStatus.connected ? 'text-green-800' : 'text-red-800'
          ]">
            {{ connectionStatus.connected ? 'Connected to SharePoint' : 'Connection failed' }}
          </p>
          <p class="text-xs mt-1" :class="[
            connectionStatus.connected ? 'text-green-600' : 'text-red-600'
          ]">
            {{ connectionStatus.message }}
          </p>
          <div v-if="connectionStatus.connected && folderStats" class="grid grid-cols-3 gap-4 mt-2 text-xs">
            <div>
              <span class="text-muted-foreground">Items:</span>
              <span class="ml-1 font-medium">{{ folderStats.items }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">Size:</span>
              <span class="ml-1 font-medium">{{ folderStats.size }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">Last sync:</span>
              <span class="ml-1 font-medium">{{ folderStats.lastSync }}</span>
            </div>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          @click="testConnection"
          :disabled="!modelValue.sharePointSiteUrl || !modelValue.sharePointFolderPath"
        >
          Test
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { FolderOpen, CheckCircle, XCircle } from 'lucide-vue-next'

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
import type { CreateVDFolderResource } from '@/alp-types/admin-resources.types'

interface Props {
  modelValue: CreateVDFolderResource & { type: 'vdFolder' }
  validationErrors?: Record<string, string>
}

interface Emits {
  (e: 'update:field', field: string, value: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const selectedSiteId = ref('')
const folderPreview = ref<any>(null)
const connectionStatus = ref<any>(null)
const enableWebhooks = ref(false)

// Computed
const folderStats = computed(() => {
  if (connectionStatus.value?.connected) {
    return {
      items: props.modelValue.totalItemCount || 0,
      size: formatFileSize(props.modelValue.totalSize || 0),
      lastSync: props.modelValue.lastSyncAt ? formatDate(props.modelValue.lastSyncAt) : 'Never'
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
 * Select SharePoint site
 */
function selectSite(siteId: string) {
  selectedSiteId.value = siteId
  
  const siteUrls = {
    site1: 'https://yourorg.sharepoint.com/sites/legal-main',
    site2: 'https://yourorg.sharepoint.com/sites/client-resources',
    site3: 'https://yourorg.sharepoint.com/sites/templates'
  }
  
  if (siteId !== 'custom' && siteUrls[siteId]) {
    updateField('sharePointSiteUrl', siteUrls[siteId])
  }
}

/**
 * Browse folders (mock)
 */
function browseFolders() {
  // In real implementation, this would open SharePoint folder browser
  // For demo, we'll simulate folder selection
  const mockPath = '/Shared Documents/VD Resources'
  updateField('sharePointFolderPath', mockPath)
  
  // Mock folder preview
  setTimeout(() => {
    folderPreview.value = {
      name: 'VD Resources',
      itemCount: Math.floor(Math.random() * 100) + 10,
      lastModified: new Date(),
      size: formatFileSize(Math.floor(Math.random() * 1000000000) + 1000000),
      subfolders: Math.floor(Math.random() * 10) + 1,
      accessible: Math.random() > 0.2
    }
    
    // Update model with folder info
    updateField('sharePointFolderId', `folder-${Math.random().toString(36).substr(2, 9)}`)
    updateField('totalItemCount', folderPreview.value.itemCount)
    updateField('subfolderCount', folderPreview.value.subfolders)
  }, 500)
}

/**
 * Test SharePoint connection
 */
async function testConnection() {
  connectionStatus.value = { connected: false, message: 'Testing connection...' }
  
  // Mock connection test
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  const success = Math.random() > 0.3 // 70% success rate
  
  if (success) {
    connectionStatus.value = {
      connected: true,
      message: 'Successfully connected to SharePoint folder'
    }
    updateField('syncStatus', 'synced')
  } else {
    connectionStatus.value = {
      connected: false,
      message: 'Failed to connect. Check permissions and folder path.'
    }
    updateField('syncStatus', 'error')
  }
}

/**
 * Set sync frequency
 */
function setSyncFrequency(frequency: string) {
  // In real implementation, this would configure sync settings
  console.log('Sync frequency set to:', frequency)
}

/**
 * Set sync direction
 */
function setSyncDirection(direction: string) {
  // In real implementation, this would configure sync direction
  console.log('Sync direction set to:', direction)
}

/**
 * Set webhooks
 */
function setWebhooks(enabled: boolean) {
  enableWebhooks.value = enabled
  console.log('Webhooks:', enabled ? 'enabled' : 'disabled')
}

/**
 * Set organization method
 */
function setOrganization(method: string) {
  console.log('Organization method:', method)
}

/**
 * Set naming convention
 */
function setNamingConvention(convention: string) {
  console.log('Naming convention:', convention)
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
 * Format date
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date))
}

// Watch for site URL changes to test connection
watch(() => props.modelValue.sharePointSiteUrl, (newUrl) => {
  if (newUrl && props.modelValue.sharePointFolderPath) {
    connectionStatus.value = null
  }
})
</script>

<style scoped>
.vd-folder-config {
  /* Component-specific styles if needed */
}
</style>