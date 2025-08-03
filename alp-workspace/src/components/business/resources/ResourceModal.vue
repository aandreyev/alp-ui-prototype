<template>
  <Dialog :open="visible" @update:open="handleClose">
    <DialogContent class="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <component :is="resourceIcon" class="w-5 h-5" />
          {{ resource.name }}
        </DialogTitle>
        <DialogDescription v-if="hierarchyPath">
          {{ hierarchyPath }}
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-6">
        <!-- Resource Details -->
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <Badge variant="outline">{{ resourceTypeLabel }}</Badge>
            <Badge v-if="resource.metadata.version" variant="secondary">
              v{{ resource.metadata.version }}
            </Badge>
          </div>
          
          <div v-if="resource.description" class="text-sm text-muted-foreground">
            {{ resource.description }}
          </div>
          
          <!-- Metadata Grid -->
          <div class="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div v-if="resource.metadata.author" class="space-y-1">
              <div class="text-xs font-medium text-muted-foreground">Author</div>
              <div class="text-sm">{{ resource.metadata.author }}</div>
            </div>
            
            <div v-if="formattedDate" class="space-y-1">
              <div class="text-xs font-medium text-muted-foreground">Last Modified</div>
              <div class="text-sm">{{ formattedDate }}</div>
            </div>
            
            <div v-if="resource.metadata.fileSize" class="space-y-1">
              <div class="text-xs font-medium text-muted-foreground">File Size</div>
              <div class="text-sm">{{ formatFileSize(resource.metadata.fileSize) }}</div>
            </div>
            
            <div v-if="resource.metadata.mimeType" class="space-y-1">
              <div class="text-xs font-medium text-muted-foreground">Type</div>
              <div class="text-sm font-mono text-xs">{{ resource.metadata.mimeType }}</div>
            </div>
          </div>
          
          <!-- Tags -->
          <div v-if="resource.metadata.tags?.length" class="space-y-2">
            <div class="text-xs font-medium text-muted-foreground">Tags</div>
            <div class="flex flex-wrap gap-1">
              <Badge 
                v-for="tag in resource.metadata.tags" 
                :key="tag"
                variant="secondary" 
                class="text-xs"
              >
                {{ tag }}
              </Badge>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="space-y-3">
          <div class="text-sm font-medium">Quick Actions</div>
          <div class="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              class="justify-start h-auto p-3"
              @click="handleAction('preview')"
            >
              <Eye class="w-4 h-4 mr-3" />
              <div class="text-left">
                <div class="font-medium">Preview</div>
                <div class="text-xs text-muted-foreground">Quick preview</div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              class="justify-start h-auto p-3"
              @click="handleAction('open')"
            >
              <ExternalLink class="w-4 h-4 mr-3" />
              <div class="text-left">
                <div class="font-medium">Open</div>
                <div class="text-xs text-muted-foreground">Open in new tab</div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              class="justify-start h-auto p-3"
              @click="handleAction('copy')"
            >
              <Copy class="w-4 h-4 mr-3" />
              <div class="text-left">
                <div class="font-medium">Copy Link</div>
                <div class="text-xs text-muted-foreground">Copy to clipboard</div>
              </div>
            </Button>
            
            <Button 
              v-if="resource.type === 'document' || resource.type === 'template'"
              variant="outline" 
              class="justify-start h-auto p-3"
              @click="handleAction('download')"
            >
              <Download class="w-4 h-4 mr-3" />
              <div class="text-left">
                <div class="font-medium">Download</div>
                <div class="text-xs text-muted-foreground">Save locally</div>
              </div>
            </Button>
          </div>
        </div>

        <!-- Related Resources (placeholder for future enhancement) -->
        <div v-if="relatedResources?.length" class="space-y-3">
          <div class="text-sm font-medium">Related Resources</div>
          <div class="grid gap-2">
            <div 
              v-for="related in relatedResources.slice(0, 3)" 
              :key="related.id"
              class="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
              @click="handleResourceClick(related)"
            >
              <component :is="getResourceIcon(related.type)" class="w-4 h-4 text-muted-foreground" />
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium truncate">{{ related.name }}</div>
                <div class="text-xs text-muted-foreground capitalize">{{ related.type }}</div>
              </div>
              <ChevronRight class="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>

      <DialogFooter class="gap-2">
        <Button variant="outline" @click="handleClose">
          Cancel
        </Button>
        <Button @click="handlePrimaryAction">
          <ExternalLink class="w-4 h-4 mr-2" />
          Open Resource
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  FileText, 
  FormInput, 
  Link as LinkIcon, 
  ExternalLink,
  Eye,
  Copy,
  Download,
  ChevronRight
} from 'lucide-vue-next'

import type { Resource } from '@/alp-types/resources.types'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/lib/registry/new-york/ui/dialog'
import { Button } from '@/lib/registry/new-york/ui/button'
import { Badge } from '@/lib/registry/new-york/ui/badge'

// Props
interface Props {
  resource: Resource
  visible: boolean
  hierarchyPath?: string
  relatedResources?: Resource[]
}

const props = defineProps<Props>()

// Events
const emit = defineEmits<{
  close: []
  action: [action: string, resource: Resource]
  'resource-click': [resource: Resource]
}>()

// Computed properties
const resourceIcon = computed(() => getResourceIcon(props.resource.type))

const resourceTypeLabel = computed(() => {
  switch (props.resource.type) {
    case 'form':
      return 'Form'
    case 'document':
      return 'Document'
    case 'url':
      return 'URL'
    case 'template':
      return 'Template'
    default:
      return 'Resource'
  }
})

const formattedDate = computed(() => {
  if (!props.resource.metadata.lastModified) return null
  
  try {
    const date = new Date(props.resource.metadata.lastModified)
    return date.toLocaleDateString('en-AU', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return null
  }
})

// Methods
const getResourceIcon = (type: string) => {
  switch (type) {
    case 'form':
      return FormInput
    case 'document':
      return FileText
    case 'url':
      return LinkIcon
    case 'template':
      return FileText
    default:
      return FileText
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const handleClose = () => {
  emit('close')
}

const handleAction = (action: string) => {
  emit('action', action, props.resource)
}

const handlePrimaryAction = () => {
  handleAction('open')
}

const handleResourceClick = (resource: Resource) => {
  emit('resource-click', resource)
}
</script>

<style scoped>
/* Component-specific styles */
</style>
