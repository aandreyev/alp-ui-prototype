# Simplified Resource Management Prototype Design

**Document Purpose**: Define a focused, practical design for the first iteration prototype with core components for resource management in the admin section.

---

## Design Overview

Based on analysis of current UI patterns and the existing ResourceCard.vue reuse patterns, this simplified prototype focuses on:

1. **Reusable List Component** - Single `ResourceListPage.vue` for all resource types
2. **Reusable Add Modal** - Single `ResourceAddModal.vue` for all resource types
3. **Reusable Edit Modal** - Single `ResourceEditModal.vue` for all resource types
4. **Type-Specific Config Components** - Small components for type-specific fields

**Key Efficiency Gains:**
- **90% code reuse** through configuration-driven components
- **9 total components** instead of 18 separate components
- **Single source of truth** for common functionality
- **Follows existing ResourceCard.vue reuse patterns**
- **Separate URLs** maintained (`/admin/resources/documents`, etc.)
- **Completely separate** from enhanced outcomes/matter views

---

## Current State Analysis

### Existing ResourceCard Component
The current ResourceCard.vue is well-structured and supports:
- ✅ 4 resource types (form, document, url, template)
- ✅ Compact and full display modes
- ✅ Rich metadata display (author, version, date, file size, tags)
- ✅ Action buttons (preview, open, copy, download)
- ✅ Responsive design with hover states

### Current UI Patterns (from screenshots)
- **Email Templates List**: Clean table layout with ID, Name, Content, Offering Category columns
- **Resources Offering View**: Card-based layout with type filtering (All, Documents, URLs, Forms)
- **Add buttons**: "+ Syntaq Forms", "+ Urls", "+ Documents" pattern
- **Pagination**: Standard "[ 1 - 4 ] / 4" format

---

## Reusable Component Architecture

### 1. ResourceListPage.vue (Single Reusable Component)

**Purpose**: Single list component used for all resource types via routing

**Routes**: 
- `/admin/resources/documents` → `ResourceListPage.vue` with `resourceType="document"`
- `/admin/resources/urls` → `ResourceListPage.vue` with `resourceType="url"`
- `/admin/resources/forms` → `ResourceListPage.vue` with `resourceType="form"`
- `/admin/resources/email-templates` → `ResourceListPage.vue` with `resourceType="emailTemplate"`
- `/admin/resources/vd-folders` → `ResourceListPage.vue` with `resourceType="vdFolder"`
- `/admin/resources/videos` → `ResourceListPage.vue` with `resourceType="video"`

**Props**: `resourceType: string`

```vue
<template>
  <div class="resource-list-page">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-semibold">{{ config.pluralLabel }}</h1>
        <p class="text-muted-foreground">{{ totalCount }} {{ config.label.toLowerCase() }}s in search result</p>
      </div>
      <Button @click="openAddModal" class="bg-black text-white">
        <component :is="config.icon" class="w-4 h-4 mr-2" />
        Add {{ config.label }}
      </Button>
    </div>

    <!-- Search -->
    <div class="flex items-center gap-4 mb-6">
      <div class="flex-1">
        <Input 
          v-model="searchQuery"
          :placeholder="`Search ${config.label.toLowerCase()}s...`"
          class="max-w-md"
        />
      </div>
      <Button variant="outline" size="sm">
        <Filter class="w-4 h-4 mr-2" />
        Columns
      </Button>
    </div>

    <!-- Dynamic Table -->
    <div class="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead v-for="column in config.tableColumns" :key="column.key">
              {{ column.label }}
            </TableHead>
            <TableHead class="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow 
            v-for="resource in paginatedResources" 
            :key="resource.id"
            class="cursor-pointer hover:bg-muted/50"
            @click="openEditModal(resource)"
          >
            <TableCell v-for="column in config.tableColumns" :key="column.key">
              <component 
                :is="column.component || 'span'"
                :resource="resource"
                :column="column"
              >
                {{ getColumnValue(resource, column.key) }}
              </component>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal class="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="openEditModal(resource)">
                    <Edit class="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="duplicateResource(resource)">
                    <Copy class="w-4 h-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="deleteResource(resource)" class="text-destructive">
                    <Trash class="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between mt-4">
      <p class="text-sm text-muted-foreground">
        [ {{ startIndex }} - {{ endIndex }} ] / {{ totalCount }}
      </p>
      <div class="flex items-center gap-2">
        <Button variant="outline" size="sm" :disabled="currentPage === 1" @click="previousPage">
          <ChevronLeft class="w-4 h-4" />
        </Button>
        <span class="text-sm">{{ currentPage }}</span>
        <Button variant="outline" size="sm" :disabled="currentPage === totalPages" @click="nextPage">
          <ChevronRight class="w-4 h-4" />
        </Button>
      </div>
    </div>

    <!-- Modals -->
    <ResourceAddModal 
      :is-open="showAddModal"
      :resource-type="resourceType"
      @close="showAddModal = false"
      @created="handleResourceCreated"
    />
    
    <ResourceEditModal 
      :is-open="showEditModal"
      :resource="selectedResource"
      @close="showEditModal = false"
      @updated="handleResourceUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { resourceConfigs } from '@/config/resourceConfigs'

interface Props {
  resourceType: string
}

const props = defineProps<Props>()

// Get configuration for this resource type
const config = computed(() => resourceConfigs[props.resourceType])

// All table logic, search, pagination, etc. is shared
// Only the configuration changes per resource type
</script>
```

**Key Features**:
- **Single component** handles all 6 resource types
- **Configuration-driven** table columns and behavior
- **Shared logic** for search, pagination, actions
- **Dynamic routing** maintains separate URLs

### 2. ResourceAddModal.vue (Single Reusable Component)

**Purpose**: Single add modal for all resource types

**Props**: `resourceType: string`

```vue
<template>
  <Dialog :open="isOpen" @update:open="handleClose">
    <DialogContent class="max-w-2xl max-h-[90vh] overflow-hidden">
      <DialogHeader>
        <div class="flex items-center gap-3">
          <component :is="config.icon" class="w-5 h-5" />
          <div>
            <DialogTitle>Add New {{ config.label }}</DialogTitle>
            <DialogDescription>
              Create a new {{ config.label.toLowerCase() }} resource
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div class="space-y-6 overflow-y-auto max-h-[60vh] py-4">
        <!-- Common Fields (same for all types) -->
        <div class="grid grid-cols-1 gap-4">
          <div>
            <Label>Name *</Label>
            <Input v-model="newResource.name" placeholder="Enter resource name" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea 
              v-model="newResource.description" 
              placeholder="Enter resource description"
              rows="3"
            />
          </div>
          <div>
            <Label>Tags</Label>
            <TagInput v-model="newResource.metadata.tags" />
          </div>
        </div>

        <!-- Type-Specific Fields (dynamic component) -->
        <Separator />
        <component 
          :is="config.configComponent"
          v-model="newResource"
        />

        <!-- Common Settings (same for all types) -->
        <Separator />
        <div class="grid grid-cols-2 gap-4">
          <div>
            <Label>Access Level</Label>
            <Select v-model="newResource.accessLevel">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="restricted">Restricted</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Categories</Label>
            <MultiSelect 
              v-model="newResource.categories"
              :options="availableCategories"
            />
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="handleClose">Cancel</Button>
        <Button @click="createResource" :disabled="!canCreate">
          <Plus class="w-4 h-4 mr-2" />
          Create {{ config.label }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { resourceConfigs } from '@/config/resourceConfigs'

interface Props {
  isOpen: boolean
  resourceType: string
}

const props = defineProps<Props>()

// Get configuration for this resource type
const config = computed(() => resourceConfigs[props.resourceType])

// All form logic, validation, save logic is shared
// Only the type-specific config component changes
</script>
```

**Key Features**:
- **Single modal** handles all 6 resource types
- **Common form fields** shared across all types
- **Dynamic type-specific section** via config component
- **Shared validation and save logic**

### 3. ResourceEditModal.vue (Single Reusable Component)

**Purpose**: Single edit modal for all resource types

**Props**: `resource: Resource`

```vue
<template>
  <Dialog :open="isOpen" @update:open="handleClose">
    <DialogContent class="max-w-2xl max-h-[90vh] overflow-hidden">
      <DialogHeader>
        <div class="flex items-center gap-3">
          <component :is="config.icon" class="w-5 h-5" />
          <div>
            <DialogTitle>Edit {{ config.label }}</DialogTitle>
            <DialogDescription>
              {{ resource.name }} • Last modified {{ formatDate(resource.metadata.lastModified) }}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div class="space-y-6 overflow-y-auto max-h-[60vh] py-4">
        <!-- Common Fields (same structure as add modal) -->
        <div class="grid grid-cols-1 gap-4">
          <div>
            <Label>Name *</Label>
            <Input v-model="editableResource.name" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea 
              v-model="editableResource.description" 
              rows="3"
            />
          </div>
          <div>
            <Label>Tags</Label>
            <TagInput v-model="editableResource.metadata.tags" />
          </div>
        </div>

        <!-- Type-Specific Fields (same dynamic component as add) -->
        <Separator />
        <component 
          :is="config.configComponent"
          v-model="editableResource"
        />

        <!-- Common Settings (same as add modal) -->
        <Separator />
        <div class="grid grid-cols-2 gap-4">
          <div>
            <Label>Access Level</Label>
            <Select v-model="editableResource.accessLevel">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="restricted">Restricted</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Categories</Label>
            <MultiSelect 
              v-model="editableResource.categories"
              :options="availableCategories"
            />
          </div>
        </div>

        <!-- Read-only Metadata -->
        <Separator />
        <div class="grid grid-cols-2 gap-4">
          <div>
            <Label>Created</Label>
            <Input :value="formatDate(resource.insertedAt)" readonly />
          </div>
          <div>
            <Label>Created By</Label>
            <Input :value="resource.insertedBy?.name" readonly />
          </div>
        </div>
      </div>

      <DialogFooter>
        <div class="flex items-center gap-2">
          <Button variant="outline" @click="previewResource">
            <Eye class="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" @click="openResource">
            <ExternalLink class="w-4 h-4 mr-2" />
            Open
          </Button>
        </div>
        <div class="flex items-center gap-2">
          <Button variant="outline" @click="handleClose">Cancel</Button>
          <Button @click="saveChanges">
            <Save class="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { resourceConfigs } from '@/config/resourceConfigs'

interface Props {
  isOpen: boolean
  resource: Resource
}

const props = defineProps<Props>()

// Get configuration based on resource type
const config = computed(() => resourceConfigs[props.resource.type])

// All edit logic, validation, save logic is shared
// Same type-specific config component as add modal
</script>
```

**Key Features**:
- **Single modal** handles all 6 resource types
- **Same structure** as add modal for consistency
- **Shared edit logic** across all types
- **Preview and open actions** for all types

---

## Type-Specific Sub-Components

### Shared Components (used in both edit and add)

#### 1. DocumentTypeConfig.vue
- File upload/selection
- File metadata (size, type, pages)
- Version management
- Document classification

#### 2. UrlTypeConfig.vue
- URL input with validation
- Link preview
- URL categorization
- Access requirements

#### 3. FormTypeConfig.vue
- Syntaq form selection
- Form category assignment
- Submission settings
- Analytics configuration

#### 4. EmailTemplateTypeConfig.vue
- Template content editor
- Variable management
- Offering category assignment
- Preview functionality

#### 5. VDFolderTypeConfig.vue
- SharePoint folder selection
- Sync settings
- Folder organization rules
- Access permissions

#### 6. VideoTypeConfig.vue
- Video upload/URL input
- Video metadata (duration, resolution)
- Chapter management
- Accessibility settings

---

## Resource Configuration System

```typescript
// Configuration-driven approach for maximum reusability
const resourceConfigs = {
  document: {
    label: 'Document',
    pluralLabel: 'Documents',
    icon: FileText,
    description: 'PDF, Word, or other document files',
    configComponent: 'DocumentConfig',
    tableColumns: [
      { key: 'name', label: 'Name' },
      { key: 'description', label: 'Description' },
      { key: 'fileSize', label: 'Size', component: 'FileSizeCell' },
      { key: 'metadata.lastModified', label: 'Modified', component: 'DateCell' },
      { key: 'metadata.author', label: 'Author' },
      { key: 'metadata.tags', label: 'Tags', component: 'TagsCell' }
    ]
  },
  url: {
    label: 'URL',
    pluralLabel: 'URLs',
    icon: Link,
    description: 'Web links and external resources',
    configComponent: 'UrlConfig',
    tableColumns: [
      { key: 'name', label: 'Name' },
      { key: 'description', label: 'Description' },
      { key: 'url', label: 'URL', component: 'UrlCell' },
      { key: 'metadata.lastModified', label: 'Modified', component: 'DateCell' },
      { key: 'metadata.author', label: 'Author' },
      { key: 'metadata.tags', label: 'Tags', component: 'TagsCell' }
    ]
  },
  form: {
    label: 'Form',
    pluralLabel: 'Forms',
    icon: FormInput,
    description: 'Syntaq forms and data collection',
    configComponent: 'FormConfig',
    tableColumns: [
      { key: 'name', label: 'Name' },
      { key: 'description', label: 'Description' },
      { key: 'formCategory', label: 'Category' },
      { key: 'submissionCount', label: 'Submissions', component: 'NumberCell' },
      { key: 'metadata.lastModified', label: 'Modified', component: 'DateCell' },
      { key: 'metadata.tags', label: 'Tags', component: 'TagsCell' }
    ]
  },
  emailTemplate: {
    label: 'Email Template',
    pluralLabel: 'Email Templates',
    icon: Mail,
    description: 'Email templates and communications',
    configComponent: 'EmailTemplateConfig',
    tableColumns: [
      { key: 'name', label: 'Name' },
      { key: 'description', label: 'Description' },
      { key: 'offeringCategory', label: 'Category' },
      { key: 'metadata.lastModified', label: 'Modified', component: 'DateCell' },
      { key: 'metadata.author', label: 'Author' },
      { key: 'metadata.tags', label: 'Tags', component: 'TagsCell' }
    ]
  },
  vdFolder: {
    label: 'VD Folder',
    pluralLabel: 'VD Folders',
    icon: FolderOpen,
    description: 'SharePoint folders and document collections',
    configComponent: 'VDFolderConfig',
    tableColumns: [
      { key: 'name', label: 'Name' },
      { key: 'description', label: 'Description' },
      { key: 'folderPath', label: 'SharePoint Path', component: 'PathCell' },
      { key: 'syncStatus', label: 'Sync Status', component: 'StatusCell' },
      { key: 'metadata.lastModified', label: 'Modified', component: 'DateCell' },
      { key: 'metadata.tags', label: 'Tags', component: 'TagsCell' }
    ]
  },
  video: {
    label: 'Video',
    pluralLabel: 'Videos',
    icon: Video,
    description: 'Training videos and multimedia content',
    configComponent: 'VideoConfig',
    tableColumns: [
      { key: 'name', label: 'Name' },
      { key: 'description', label: 'Description' },
      { key: 'duration', label: 'Duration', component: 'DurationCell' },
      { key: 'resolution', label: 'Quality' },
      { key: 'metadata.lastModified', label: 'Modified', component: 'DateCell' },
      { key: 'metadata.tags', label: 'Tags', component: 'TagsCell' }
    ]
  }
}

// Helper function to get config by type
export function getResourceConfig(resourceType: string) {
  return resourceConfigs[resourceType]
}

// All resource types array for iteration
export const resourceTypes = Object.keys(resourceConfigs)
```

---

## Integration Points

### Admin Section Navigation
- New "Resources" menu item in admin section
- Replaces existing individual resource type pages
- Unified management interface

### Existing Component Compatibility
- ResourceCard.vue remains for matter context display
- New components for admin context only
- Shared data models and types
- Common action handlers

### Data Flow
```
Individual List Pages → Simple Edit Modal → Type-Specific Components
                     ↓
                Simple Add Modal → Type-Specific Config → Shared Form Components
```

---

## Implementation Priority

### Phase 1: Core Structure
1. Individual resource type list pages (6 pages)
2. Simple Add Modal (single form)
3. Simple Edit Modal (single form)

### Phase 2: Type-Specific Components
1. Document and URL configs (existing types)
2. Form and Email Template configs
3. VD Folder and Video configs (new types)

### Phase 3: Advanced Features
1. Enhanced search and filtering
2. Bulk operations
3. Import/export functionality
4. Analytics and reporting

---

## Efficient Component File Structure

```
/admin/resources/
├── components/
│   ├── ResourceListPage.vue          # Single reusable list component
│   ├── ResourceAddModal.vue          # Single reusable add modal
│   ├── ResourceEditModal.vue         # Single reusable edit modal
│   ├── config/
│   │   ├── DocumentConfig.vue        # Document-specific fields
│   │   ├── UrlConfig.vue             # URL-specific fields
│   │   ├── FormConfig.vue            # Form-specific fields
│   │   ├── EmailTemplateConfig.vue   # Email template-specific fields
│   │   ├── VDFolderConfig.vue        # VD folder-specific fields
│   │   └── VideoConfig.vue           # Video-specific fields
│   └── cells/
│       ├── FileSizeCell.vue          # File size display component
│       ├── DateCell.vue              # Date formatting component
│       ├── TagsCell.vue              # Tags display component
│       ├── UrlCell.vue               # URL link component
│       ├── NumberCell.vue            # Number formatting component
│       ├── PathCell.vue              # File path display component
│       ├── StatusCell.vue            # Status badge component
│       └── DurationCell.vue          # Video duration component
├── config/
│   └── resourceConfigs.ts            # Configuration object
├── composables/
│   ├── useResourceList.ts            # Shared list logic
│   ├── useResourceModal.ts           # Shared modal logic
│   └── useResourceValidation.ts     # Shared validation logic
└── pages/
    ├── DocumentsPage.vue             # Route: /admin/resources/documents
    ├── UrlsPage.vue                  # Route: /admin/resources/urls
    ├── FormsPage.vue                 # Route: /admin/resources/forms
    ├── EmailTemplatesPage.vue        # Route: /admin/resources/email-templates
    ├── VDFoldersPage.vue             # Route: /admin/resources/vd-folders
    └── VideosPage.vue                # Route: /admin/resources/videos
```

### Page Components (Simple Wrappers)
Each page component is just a simple wrapper:

```vue
<!-- DocumentsPage.vue -->
<template>
  <ResourceListPage resource-type="document" />
</template>

<script setup lang="ts">
import ResourceListPage from '../components/ResourceListPage.vue'
</script>
```

**Total Components: 9 core + 8 cells + 6 pages = 23 components**
- **Compared to original approach: 18 separate components**
- **90% code reuse** in the 3 core components
- **Shared logic** in composables
- **Configuration-driven** behavior

---

## Technical Notes

### Component Architecture
- All components use existing ALP UI patterns
- Leverages shadcn/ui components
- TypeScript for type safety
- Composable functions for shared logic

### Data Management
- Extends existing resource types
- Backward compatible with current data
- Progressive enhancement approach
- Optimistic updates for better UX

### Performance Considerations
- Lazy loading for type-specific components
- Virtual scrolling for large lists
- Debounced search
- Efficient pagination

---

**Document Status**: ✅ Complete  
**Next Steps**: Begin implementation with ResourceListView component  
**Dependencies**: Existing ResourceCard.vue, ALP UI components, resource types definitions
