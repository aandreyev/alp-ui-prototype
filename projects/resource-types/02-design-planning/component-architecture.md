# Component Architecture Design

**Document Purpose**: Define Vue component structure and relationships for the enhanced resource type system, building on existing ALP patterns and Phase 1 analysis.

---

## Architecture Overview

Based on our Phase 1 analysis, the enhanced resource type system will extend the existing portal resources architecture with type-specific components while maintaining seamless integration.

### Core Architecture Principles

1. **Extend, Don't Replace**: Build upon existing `ResourceCard.vue` and `ResourceDetailModal.vue`
2. **Type-Specific Specialization**: Each resource type has dedicated components for unique functionality
3. **Consistent Interface**: All type-specific components implement common interfaces
4. **Progressive Enhancement**: Graceful degradation for unsupported resource types

---

## Component Hierarchy

### Root Integration Points

```
EnhancedOutcomesTab.vue (existing)
├── ResourceCard.vue (existing - enhanced)
│   ├── DocumentResourceCard.vue (new)
│   ├── UrlResourceCard.vue (new)
│   ├── FormResourceCard.vue (new)
│   ├── EmailTemplateResourceCard.vue (new)
│   ├── VDFolderResourceCard.vue (new)
│   └── VideoResourceCard.vue (new)
├── ResourceDetailModal.vue (existing - enhanced)
│   ├── DocumentResourceDetail.vue (new)
│   ├── UrlResourceDetail.vue (new)
│   ├── FormResourceDetail.vue (new)
│   ├── EmailTemplateResourceDetail.vue (new)
│   ├── VDFolderResourceDetail.vue (new)
│   └── VideoResourceDetail.vue (new)
└── ResourceFilters.vue (existing - enhanced)
    └── ResourceTypeFilters.vue (new)
```

---

## Component Specifications

### 1. Enhanced ResourceCard.vue

**Purpose**: Main container that dynamically renders type-specific resource cards

**Enhancements to Existing Component**:
```vue
<template>
  <div class="resource-card">
    <!-- Existing common card structure -->
    <div class="resource-card-header">
      <ResourceTypeIcon :type="resource.type" />
      <h3>{{ resource.name }}</h3>
      <ResourceActions :resource="resource" />
    </div>
    
    <!-- Type-specific content area -->
    <div class="resource-card-content">
      <component 
        :is="getResourceComponent(resource.type)"
        :resource="resource"
        :context="context"
        @action="handleResourceAction"
      />
    </div>
    
    <!-- Common footer with metadata -->
    <div class="resource-card-footer">
      <ResourceMetadata :resource="resource" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Resource, ResourceContext } from '@/types/resources'

// Type-specific components
import DocumentResourceCard from './DocumentResourceCard.vue'
import UrlResourceCard from './UrlResourceCard.vue'
import FormResourceCard from './FormResourceCard.vue'
import EmailTemplateResourceCard from './EmailTemplateResourceCard.vue'
import VDFolderResourceCard from './VDFolderResourceCard.vue'
import VideoResourceCard from './VideoResourceCard.vue'

interface Props {
  resource: Resource
  context: ResourceContext
}

const props = defineProps<Props>()

const resourceComponents = {
  document: DocumentResourceCard,
  url: UrlResourceCard,
  form: FormResourceCard,
  emailTemplate: EmailTemplateResourceCard,
  vdFolder: VDFolderResourceCard,
  video: VideoResourceCard
}

const getResourceComponent = (type: string) => {
  return resourceComponents[type] || 'div' // Fallback for unknown types
}
</script>
```

### 2. Type-Specific Resource Cards

#### 2.1 DocumentResourceCard.vue

**Purpose**: Display document-specific information and actions

**Key Features** (from Resource Field Analysis):
- File type icon and size display
- Version information
- Download/preview actions
- Document status (draft, review, approved)

```vue
<template>
  <div class="document-resource-card">
    <!-- File Information -->
    <div class="flex items-center gap-3 mb-3">
      <FileIcon :extension="resource.fileExtension" class="w-8 h-8" />
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium truncate">{{ resource.fileName }}</p>
        <p class="text-xs text-gray-500">
          {{ formatFileSize(resource.fileSize) }} • 
          {{ resource.fileExtension.toUpperCase() }}
        </p>
      </div>
      <DocumentStatusBadge :status="resource.reviewStatus" />
    </div>
    
    <!-- Document Metadata -->
    <div class="space-y-2 mb-3">
      <div v-if="resource.version" class="flex justify-between text-xs">
        <span class="text-gray-500">Version:</span>
        <span>{{ resource.version }}</span>
      </div>
      <div v-if="resource.pageCount" class="flex justify-between text-xs">
        <span class="text-gray-500">Pages:</span>
        <span>{{ resource.pageCount }}</span>
      </div>
    </div>
    
    <!-- Actions -->
    <div class="flex gap-2">
      <Button size="sm" variant="outline" @click="previewDocument">
        <Eye class="w-4 h-4 mr-1" />
        Preview
      </Button>
      <Button size="sm" @click="downloadDocument">
        <Download class="w-4 h-4 mr-1" />
        Download
      </Button>
    </div>
    
    <!-- Usage Analytics -->
    <div v-if="showAnalytics" class="mt-3 pt-3 border-t">
      <div class="grid grid-cols-3 gap-2 text-xs text-center">
        <div>
          <p class="font-medium">{{ resource.downloadCount }}</p>
          <p class="text-gray-500">Downloads</p>
        </div>
        <div>
          <p class="font-medium">{{ resource.viewCount }}</p>
          <p class="text-gray-500">Views</p>
        </div>
        <div>
          <p class="font-medium">{{ resource.shareCount }}</p>
          <p class="text-gray-500">Shares</p>
        </div>
      </div>
    </div>
  </div>
</template>
```

#### 2.2 FormResourceCard.vue

**Purpose**: Display Syntaq form-specific information and analytics

**Key Features** (from Syntaq Integration Analysis):
- Form submission analytics
- Category-based styling
- Direct form access
- Completion rate visualization

```vue
<template>
  <div class="form-resource-card">
    <!-- Form Category Badge -->
    <div class="flex items-center justify-between mb-3">
      <FormCategoryBadge :category="resource.category" />
      <FormStatusIndicator :isActive="resource.isActive" />
    </div>
    
    <!-- Form Analytics -->
    <div class="grid grid-cols-2 gap-3 mb-3">
      <div class="text-center p-2 bg-gray-50 rounded">
        <p class="text-lg font-semibold text-blue-600">{{ resource.submissionCount }}</p>
        <p class="text-xs text-gray-500">Submissions</p>
      </div>
      <div class="text-center p-2 bg-gray-50 rounded">
        <p class="text-lg font-semibold text-green-600">{{ resource.completionRate }}%</p>
        <p class="text-xs text-gray-500">Completion</p>
      </div>
    </div>
    
    <!-- Form Details -->
    <div class="space-y-2 mb-3 text-xs">
      <div class="flex justify-between">
        <span class="text-gray-500">Form ID:</span>
        <span class="font-mono">{{ resource.syntaqFormId }}</span>
      </div>
      <div v-if="resource.estimatedCompletionTime" class="flex justify-between">
        <span class="text-gray-500">Est. Time:</span>
        <span>{{ resource.estimatedCompletionTime }}m</span>
      </div>
    </div>
    
    <!-- Actions -->
    <div class="flex gap-2">
      <Button size="sm" @click="openForm" class="flex-1">
        <ExternalLink class="w-4 h-4 mr-1" />
        Open Form
      </Button>
      <Button size="sm" variant="outline" @click="viewAnalytics">
        <BarChart class="w-4 h-4 mr-1" />
        Analytics
      </Button>
    </div>
  </div>
</template>
```

#### 2.3 VDFolderResourceCard.vue

**Purpose**: Display SharePoint folder information with enhanced metadata

**Key Features** (from SharePoint Integration Analysis):
- Folder content summary
- Sync status indicator
- Direct SharePoint access
- Folder health metrics

```vue
<template>
  <div class="vd-folder-resource-card">
    <!-- Folder Header -->
    <div class="flex items-center gap-3 mb-3">
      <FolderIcon class="w-8 h-8 text-blue-500" />
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium truncate">{{ resource.sharePointFolderName }}</p>
        <p class="text-xs text-gray-500">{{ resource.folderType }} folder</p>
      </div>
      <SyncStatusBadge :status="resource.syncStatus" />
    </div>
    
    <!-- Folder Content Summary -->
    <div class="grid grid-cols-2 gap-2 mb-3 text-xs">
      <div class="flex justify-between">
        <span class="text-gray-500">Documents:</span>
        <span>{{ resource.documentCount }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-500">Total Size:</span>
        <span>{{ formatFileSize(resource.totalSize) }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-500">Subfolders:</span>
        <span>{{ resource.subfolderCount }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-500">Last Sync:</span>
        <span>{{ formatDate(resource.lastSyncAt) }}</span>
      </div>
    </div>
    
    <!-- Folder Health Indicators -->
    <div v-if="resource.brokenLinksCount > 0 || resource.duplicateFilesCount > 0" 
         class="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
      <div v-if="resource.brokenLinksCount > 0" class="text-yellow-700">
        ⚠️ {{ resource.brokenLinksCount }} broken links
      </div>
      <div v-if="resource.duplicateFilesCount > 0" class="text-yellow-700">
        📋 {{ resource.duplicateFilesCount }} duplicate files
      </div>
    </div>
    
    <!-- Actions -->
    <div class="flex gap-2">
      <Button size="sm" @click="openSharePointFolder" class="flex-1">
        <ExternalLink class="w-4 h-4 mr-1" />
        Open Folder
      </Button>
      <Button size="sm" variant="outline" @click="syncFolder">
        <RefreshCw class="w-4 h-4 mr-1" />
        Sync
      </Button>
    </div>
  </div>
</template>
```

#### 2.4 VideoResourceCard.vue

**Purpose**: Display video content with playback and analytics

**Key Features** (from Resource Field Analysis):
- Video thumbnail and duration
- Chapter navigation
- Playback analytics
- Interactive features

```vue
<template>
  <div class="video-resource-card">
    <!-- Video Thumbnail -->
    <div class="relative mb-3 rounded overflow-hidden bg-gray-100">
      <img 
        v-if="resource.thumbnailUrl" 
        :src="resource.thumbnailUrl" 
        :alt="resource.name"
        class="w-full h-32 object-cover"
      />
      <div v-else class="w-full h-32 flex items-center justify-center">
        <Play class="w-12 h-12 text-gray-400" />
      </div>
      
      <!-- Duration Overlay -->
      <div class="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
        {{ formatDuration(resource.duration) }}
      </div>
      
      <!-- Play Button Overlay -->
      <div class="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-25">
        <Button size="sm" @click="playVideo" class="bg-white text-black hover:bg-gray-100">
          <Play class="w-4 h-4 mr-1" />
          Play
        </Button>
      </div>
    </div>
    
    <!-- Video Metadata -->
    <div class="space-y-2 mb-3 text-xs">
      <div class="flex justify-between">
        <span class="text-gray-500">Type:</span>
        <VideoTypeBadge :type="resource.videoType" />
      </div>
      <div class="flex justify-between">
        <span class="text-gray-500">Resolution:</span>
        <span>{{ resource.resolution }}</span>
      </div>
      <div v-if="resource.chapters.length > 0" class="flex justify-between">
        <span class="text-gray-500">Chapters:</span>
        <span>{{ resource.chapters.length }}</span>
      </div>
    </div>
    
    <!-- Video Analytics -->
    <div class="grid grid-cols-3 gap-2 mb-3 text-xs text-center">
      <div>
        <p class="font-medium">{{ resource.viewCount }}</p>
        <p class="text-gray-500">Views</p>
      </div>
      <div>
        <p class="font-medium">{{ resource.completionRate }}%</p>
        <p class="text-gray-500">Completion</p>
      </div>
      <div>
        <p class="font-medium">{{ formatDuration(resource.averageWatchTime) }}</p>
        <p class="text-gray-500">Avg Watch</p>
      </div>
    </div>
    
    <!-- Interactive Features -->
    <div v-if="resource.hasQuiz || resource.hasSubtitles" class="flex gap-1 mb-3">
      <Badge v-if="resource.hasQuiz" variant="secondary" class="text-xs">
        <Brain class="w-3 h-3 mr-1" />
        Quiz
      </Badge>
      <Badge v-if="resource.hasSubtitles" variant="secondary" class="text-xs">
        <Subtitles class="w-3 h-3 mr-1" />
        Subtitles
      </Badge>
    </div>
    
    <!-- Actions -->
    <div class="flex gap-2">
      <Button size="sm" @click="playVideo" class="flex-1">
        <Play class="w-4 h-4 mr-1" />
        Watch
      </Button>
      <Button size="sm" variant="outline" @click="viewChapters">
        <List class="w-4 h-4 mr-1" />
        Chapters
      </Button>
    </div>
  </div>
</template>
```

---

## Common Components

### ResourceTypeIcon.vue

**Purpose**: Consistent iconography for resource types

```vue
<template>
  <component :is="getIcon(type)" :class="iconClasses" />
</template>

<script setup lang="ts">
import { FileText, Link, FormInput, Mail, Folder, Video } from 'lucide-vue-next'

interface Props {
  type: string
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md'
})

const iconMap = {
  document: FileText,
  url: Link,
  form: FormInput,
  emailTemplate: Mail,
  vdFolder: Folder,
  video: Video
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6'
}

const getIcon = (type: string) => iconMap[type] || FileText
const iconClasses = computed(() => sizeClasses[props.size])
</script>
```

### ResourceActions.vue

**Purpose**: Common action buttons for all resource types

```vue
<template>
  <div class="flex gap-1">
    <!-- Type-specific primary action -->
    <Button 
      size="sm" 
      :variant="primaryAction.variant"
      @click="handlePrimaryAction"
    >
      <component :is="primaryAction.icon" class="w-4 h-4" />
    </Button>
    
    <!-- Common actions dropdown -->
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="ghost">
          <MoreHorizontal class="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem @click="viewDetails">
          <Eye class="w-4 h-4 mr-2" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem @click="editResource">
          <Edit class="w-4 h-4 mr-2" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem @click="shareResource">
          <Share class="w-4 h-4 mr-2" />
          Share
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem @click="removeResource" class="text-red-600">
          <Trash class="w-4 h-4 mr-2" />
          Remove
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
```

---

## Integration Strategy

### 1. Backward Compatibility

**Existing ResourceCard.vue Enhancement**:
- Maintain existing props interface
- Add type detection logic
- Graceful fallback for unknown types
- Preserve existing styling and behavior

### 2. Progressive Enhancement

**Implementation Approach**:
1. **Phase 1**: Enhance existing ResourceCard with type detection
2. **Phase 2**: Implement type-specific components one by one
3. **Phase 3**: Add advanced features (analytics, interactions)
4. **Phase 4**: Optimize performance and add testing

### 3. Data Flow Integration

**Resource Data Pipeline**:
```
API Response → Resource Type Detection → Type-Specific Component → User Interaction
     ↓                    ↓                        ↓                    ↓
Enhanced Metadata → Component Props → Specialized Display → Action Handlers
```

---

## Performance Considerations

### 1. Component Lazy Loading

```typescript
// Lazy load type-specific components
const DocumentResourceCard = defineAsyncComponent(() => 
  import('./DocumentResourceCard.vue')
)
```

### 2. Prop Optimization

```typescript
// Use computed props for expensive operations
const formattedMetadata = computed(() => 
  formatResourceMetadata(props.resource)
)
```

### 3. Event Handling

```typescript
// Efficient event delegation
const handleResourceAction = (action: string, payload: any) => {
  emit('resourceAction', { action, payload, resourceId: props.resource.id })
}
```

---

## Testing Strategy

### 1. Component Testing

**Individual Component Tests**:
- Props validation
- Event emission
- Conditional rendering
- Error handling

### 2. Integration Testing

**ResourceCard Integration**:
- Type detection accuracy
- Component switching
- Data flow validation
- Action handling

### 3. Visual Testing

**Storybook Stories**:
- All resource types
- Different data states
- Responsive behavior
- Accessibility compliance

---

## Accessibility Considerations

### 1. Semantic HTML

- Proper heading hierarchy
- ARIA labels for interactive elements
- Focus management for modals

### 2. Keyboard Navigation

- Tab order optimization
- Keyboard shortcuts for common actions
- Screen reader compatibility

### 3. Visual Accessibility

- Color contrast compliance
- Icon + text combinations
- Responsive text sizing

---

## Next Steps

1. **Create detailed wireframes** for each component type
2. **Define TypeScript interfaces** for all component props
3. **Plan integration testing** scenarios
4. **Design responsive behavior** for different screen sizes
5. **Create Storybook stories** for component documentation

---

**Document Status**: ✅ Complete  
**Related Documents**: 
- [Resource Field Analysis](../01-discovery-analysis/Resource_Field_Analysis.md) - Metadata structures
- [Resource Management Design Principles](../01-discovery-analysis/Resource_Management_Design_Principles.md) - Design patterns
- [Technical Architecture](./technical-architecture.md) - Implementation details
- [Integration Plan](./integration-plan.md) - ALP integration strategy
