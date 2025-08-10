<template>
  <div class="vd-folder-config space-y-4">
    <!-- SharePoint Site URL/Path -->
    <div>
      <label class="text-sm font-medium text-foreground">SharePoint Site URL/Path *</label>
      <Input 
        :modelValue="data?.sharePointUrl ?? ''"
        @update:modelValue="$emit('update:field', 'sharePointUrl', $event)"
        placeholder="https://yourcompany.sharepoint.com/sites/sitename/folder"
        :class="validationErrors?.sharePointUrl ? 'border-destructive' : ''"
      />
      <p v-if="validationErrors?.sharePointUrl" class="text-sm text-destructive mt-1">
        {{ validationErrors.sharePointUrl }}
      </p>
      <p class="text-xs text-muted-foreground mt-1">
        Enter the full SharePoint folder URL
      </p>
    </div>

    <!-- Site Name and Folder Name -->
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="text-sm font-medium text-foreground">Site Name</label>
        <Input 
          :modelValue="data?.siteName ?? ''"
          @update:modelValue="$emit('update:field', 'siteName', $event)"
          placeholder="Site display name"
        />
        <p class="text-xs text-muted-foreground mt-1">
          Friendly name for the SharePoint site
        </p>
      </div>
      
      <div>
        <label class="text-sm font-medium text-foreground">Folder Name</label>
        <Input 
          :modelValue="data?.folderName ?? ''"
          @update:modelValue="$emit('update:field', 'folderName', $event)"
          placeholder="Folder display name"
        />
        <p class="text-xs text-muted-foreground mt-1">
          Friendly name for the folder
        </p>
      </div>
    </div>

    <!-- SharePoint Preview (if URL is valid) -->
    <div v-if="isValidSharePointUrl(data?.sharePointUrl)" class="bg-muted/30 rounded-lg p-4">
      <h4 class="text-sm font-medium mb-3">SharePoint Folder Details</h4>
      <div class="flex items-center gap-3 mb-3">
        <Folder class="w-5 h-5 text-primary" />
        <div class="flex-1">
          <p class="text-sm font-medium">{{ extractFolderName(data?.sharePointUrl) }}</p>
          <p class="text-xs text-muted-foreground truncate">{{ extractSiteName(data?.sharePointUrl) }}</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          @click="openSharePointFolder"
        >
          <ExternalLink class="w-4 h-4 mr-2" />
          Open
        </Button>
      </div>
      
      <!-- SharePoint Properties -->
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span class="text-muted-foreground">Site:</span>
          <span class="ml-2 font-medium">{{ extractSiteName(data?.sharePointUrl) }}</span>
        </div>
        <div>
          <span class="text-muted-foreground">Folder:</span>
          <span class="ml-2 font-medium">{{ extractFolderName(data?.sharePointUrl) }}</span>
        </div>
      </div>
      
      <!-- Mock folder statistics -->
      <div v-if="folderStats" class="mt-3 grid grid-cols-3 gap-4 text-sm">
        <div>
          <span class="text-muted-foreground">Files:</span>
          <span class="ml-2 font-medium">{{ folderStats.fileCount }}</span>
        </div>
        <div>
          <span class="text-muted-foreground">Subfolders:</span>
          <span class="ml-2 font-medium">{{ folderStats.folderCount }}</span>
        </div>
        <div>
          <span class="text-muted-foreground">Last Activity:</span>
          <span class="ml-2 font-medium">{{ formatDate(folderStats.lastActivity) }}</span>
        </div>
      </div>
    </div>

    <!-- Access Instructions -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 class="text-sm font-medium mb-2 text-blue-900">Access Requirements</h4>
      <ul class="text-xs text-blue-800 space-y-1">
        <li>• Users must have appropriate SharePoint permissions</li>
        <li>• Corporate network access may be required</li>
        <li>• Some folders may require additional authentication</li>
      </ul>
    </div>

    <!-- Folder Structure Helper -->
    <div class="bg-muted/30 rounded-lg p-4">
      <h4 class="text-sm font-medium mb-3">URL Format Examples</h4>
      <div class="space-y-2 text-xs">
        <div>
          <code class="bg-muted px-2 py-1 rounded text-xs block">
            https://company.sharepoint.com/sites/legal/Documents/Templates
          </code>
          <span class="text-muted-foreground mt-1 block">Document library folder</span>
        </div>
        <div>
          <code class="bg-muted px-2 py-1 rounded text-xs block">
            https://company.sharepoint.com/sites/matters/Shared%20Documents/Client%20Files
          </code>
          <span class="text-muted-foreground mt-1 block">Shared documents with spaces</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Folder, ExternalLink } from 'lucide-vue-next'

// UI Components
import { Button } from '@/lib/registry/new-york/ui/button'
import { Input } from '@/lib/registry/new-york/ui/input'

interface Props {
  data: any
  validationErrors?: Record<string, string>
}

interface Emits {
  (e: 'update:field', field: string, value: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const folderStats = ref<any>(null)

/**
 * Check if SharePoint URL is valid
 */
function isValidSharePointUrl(url: string): boolean {
  if (!url) return false
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.includes('sharepoint.com') || urlObj.hostname.includes('sharepoint')
  } catch {
    return false
  }
}

/**
 * Extract site name from SharePoint URL
 */
function extractSiteName(url: string): string {
  if (!url) return ''
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/')
    const sitesIndex = pathParts.indexOf('sites')
    if (sitesIndex !== -1 && pathParts[sitesIndex + 1]) {
      return pathParts[sitesIndex + 1]
    }
    return urlObj.hostname
  } catch {
    return 'Invalid URL'
  }
}

/**
 * Extract folder name from SharePoint URL
 */
function extractFolderName(url: string): string {
  if (!url) return ''
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/').filter(part => part)
    if (pathParts.length > 0) {
      const lastPart = pathParts[pathParts.length - 1]
      return decodeURIComponent(lastPart).replace(/%20/g, ' ')
    }
    return 'Root Folder'
  } catch {
    return 'Invalid URL'
  }
}

/**
 * Open SharePoint folder in new window
 */
function openSharePointFolder() {
  if (!isValidSharePointUrl(props.data.sharePointUrl)) return
  
  window.open(props.data.sharePointUrl, '_blank')
}

/**
 * Load folder statistics (mock)
 */
async function loadFolderStats() {
  if (!isValidSharePointUrl(props.data.sharePointUrl)) {
    folderStats.value = null
    return
  }
  
  try {
    // Simulate API call to get folder stats
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Mock folder statistics
    folderStats.value = {
      fileCount: Math.floor(Math.random() * 50) + 1,
      folderCount: Math.floor(Math.random() * 10),
      lastActivity: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    }
    
    console.log('Folder stats loaded:', folderStats.value)
  } catch (error) {
    console.error('Failed to load folder stats:', error)
    folderStats.value = null
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
    year: 'numeric'
  }).format(date)
}

// Watch for SharePoint URL changes to load stats
watch(() => props.data.sharePointUrl, (newUrl) => {
  if (isValidSharePointUrl(newUrl)) {
    loadFolderStats()
  } else {
    folderStats.value = null
  }
}, { immediate: true })
</script>
