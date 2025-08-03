<template>
  <div class="resource-card group">
    <Card class="hover:shadow-md transition-shadow cursor-pointer" @click="handleClick">
      <CardHeader class="pb-3">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-2 min-w-0 flex-1">
            <component 
              :is="resourceIcon" 
              class="w-4 h-4 text-muted-foreground flex-shrink-0" 
            />
            <div class="min-w-0 flex-1">
              <h3 class="font-medium text-sm truncate">{{ resource.name }}</h3>
              <p v-if="showHierarchyPath && hierarchyPath" class="text-xs text-muted-foreground truncate">
                {{ hierarchyPath }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-1 ml-2">
            <Badge variant="outline" class="text-xs flex-shrink-0">
              {{ resourceTypeLabel }}
            </Badge>
            <component 
              v-if="resource.type === 'url'" 
              :is="ExternalLink" 
              class="w-3 h-3 text-muted-foreground" 
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent class="pt-0">
        <p v-if="resource.description" :class="[
          'text-muted-foreground text-sm mb-4',
          compact ? 'line-clamp-2' : 'line-clamp-4'
        ]">
          {{ resource.description }}
        </p>
        
        <!-- Detailed Metadata (when not compact) -->
        <div v-if="!compact" class="space-y-3 mb-4">
          <!-- Primary Metadata Row -->
          <div class="flex items-center gap-4 text-sm text-muted-foreground">
            <span v-if="resource.metadata.author" class="flex items-center gap-1">
              <User class="w-4 h-4" />
              {{ resource.metadata.author }}
            </span>
            <span v-if="resource.metadata.version" class="flex items-center gap-1">
              <Tag class="w-4 h-4" />
              v{{ resource.metadata.version }}
            </span>
            <span v-if="formattedDate" class="flex items-center gap-1">
              <Calendar class="w-4 h-4" />
              {{ formattedDate }}
            </span>
          </div>
          
          <!-- Additional Metadata Row -->
          <div v-if="hasAdditionalMetadata" class="flex items-center gap-4 text-sm text-muted-foreground">
            <span v-if="resource.metadata.fileSize" class="flex items-center gap-1">
              <FileText class="w-4 h-4" />
              {{ formatFileSize(resource.metadata.fileSize) }}
            </span>
            <span v-if="resource.metadata.mimeType" class="flex items-center gap-1">
              <FileText class="w-4 h-4" />
              {{ resource.metadata.mimeType }}
            </span>
          </div>
          
          <!-- All Tags -->
          <div v-if="resource.metadata.tags?.length" class="flex flex-wrap gap-1">
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
        
        <!-- Compact Metadata (when compact) -->
        <div v-else class="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <span v-if="resource.metadata.author" class="flex items-center gap-1">
            <User class="w-3 h-3" />
            {{ resource.metadata.author }}
          </span>
          <span v-if="resource.metadata.version" class="flex items-center gap-1">
            <Tag class="w-3 h-3" />
            v{{ resource.metadata.version }}
          </span>
          <span v-if="formattedDate" class="flex items-center gap-1">
            <Calendar class="w-3 h-3" />
            {{ formattedDate }}
          </span>
        </div>
        
        <!-- Action Buttons -->
        <div v-if="!compact" class="flex items-center gap-2 mt-4">
          <Button 
            variant="outline" 
            size="sm"
            class="h-8 px-3"
            @click.stop="handleAction('preview')"
          >
            <Eye class="w-4 h-4 mr-1" />
            Preview
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            class="h-8 px-3"
            @click.stop="handleAction('open')"
          >
            <ExternalLink class="w-4 h-4 mr-1" />
            Open
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            class="h-8 px-3"
            @click.stop="handleAction('copy')"
          >
            <Copy class="w-4 h-4 mr-1" />
            Copy
          </Button>
          <Button 
            v-if="showDownloadButton"
            variant="outline" 
            size="sm"
            class="h-8 px-3"
            @click.stop="handleAction('download')"
          >
            <Download class="w-4 h-4 mr-1" />
            Download
          </Button>
        </div>
        
        <!-- Compact Actions (when compact) -->
        <div v-else class="flex items-center justify-between">
          <div v-if="resource.metadata.tags?.length" class="flex gap-1">
            <Badge 
              v-for="tag in resource.metadata.tags.slice(0, 2)" 
              :key="tag"
              variant="secondary" 
              class="text-xs px-1 py-0"
            >
              {{ tag }}
            </Badge>
            <span v-if="resource.metadata.tags.length > 2" class="text-xs text-muted-foreground">
              +{{ resource.metadata.tags.length - 2 }}
            </span>
          </div>
          
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="ghost" 
              size="sm"
              class="h-7 px-2"
              @click.stop="handleAction('preview')"
            >
              <Eye class="w-3 h-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              class="h-7 px-2"
              @click.stop="handleAction('open')"
            >
              <ExternalLink class="w-3 h-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              class="h-7 px-2"
              @click.stop="handleAction('copy')"
            >
              <Copy class="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
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
  User,
  Tag,
  Calendar
} from 'lucide-vue-next'

import type { Resource } from '@/alp-types/resources.types'
import { Card, CardContent, CardHeader } from '@/lib/registry/new-york/ui/card'
import { Badge } from '@/lib/registry/new-york/ui/badge'
import { Button } from '@/lib/registry/new-york/ui/button'

// Props
interface Props {
  resource: Resource
  showHierarchyPath?: boolean
  hierarchyPath?: string
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showHierarchyPath: false,
  compact: false
})

// Events
const emit = defineEmits<{
  click: [resource: Resource]
  action: [action: string, resource: Resource]
}>()

// Computed properties
const resourceIcon = computed(() => {
  switch (props.resource.type) {
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
})

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
      month: 'short', 
      year: 'numeric' 
    })
  } catch {
    return null
  }
})

const hasAdditionalMetadata = computed(() => {
  return props.resource.metadata.fileSize || props.resource.metadata.mimeType
})

const showDownloadButton = computed(() => {
  // Show download button for documents and templates, but not for URLs or forms
  return props.resource.type === 'document' || props.resource.type === 'template'
})

// Methods
const handleClick = () => {
  emit('click', props.resource)
}

const handleAction = (action: string) => {
  emit('action', action, props.resource)
}

const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
.resource-card {
  transition: all 0.2s ease-in-out;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-4 {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
