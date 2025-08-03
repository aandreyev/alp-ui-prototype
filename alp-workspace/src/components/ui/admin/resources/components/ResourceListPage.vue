<template>
  <div class="resource-list-page">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-semibold text-foreground">{{ config.pluralLabel }}</h1>
        <p class="text-muted-foreground">
          {{ totalCount }} {{ config.label.toLowerCase() }}{{ totalCount === 1 ? '' : 's' }} found
        </p>
      </div>
      <Button @click="openAddModal" class="bg-primary text-primary-foreground hover:bg-primary/90">
        <component :is="config.icon" class="w-4 h-4 mr-2" />
        Add {{ config.label }}
      </Button>
    </div>

    <!-- Search and Filters -->
    <div class="flex items-center gap-4 mb-6">
      <div class="flex-1">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            :value="searchQuery"
            @input="updateSearch($event.target.value)"
            :placeholder="config.searchPlaceholder"
            class="pl-10 max-w-md"
          />
        </div>
      </div>
      <Button variant="outline" size="sm" @click="showFilters = !showFilters">
        <Filter class="w-4 h-4 mr-2" />
        Filters
      </Button>
      <Button variant="outline" size="sm" @click="refresh">
        <RotateCcw class="w-4 h-4 mr-2" />
        Refresh
      </Button>
    </div>

    <!-- Filters Panel (Collapsible) -->
    <div v-if="showFilters" class="bg-muted/50 border rounded-lg p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="text-sm font-medium text-foreground">Access Level</label>
          <Select :value="filters.accessLevels[0] || 'all'" @update:value="updateAccessLevel">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="restricted">Restricted</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label class="text-sm font-medium text-foreground">Categories</label>
          <Input 
            placeholder="Filter by category..."
            @input="updateCategoryFilter($event.target.value)"
          />
        </div>
        <div>
          <label class="text-sm font-medium text-foreground">Tags</label>
          <Input 
            placeholder="Filter by tags..."
            @input="updateTagFilter($event.target.value)"
          />
        </div>
      </div>
      <div class="flex items-center justify-between mt-4">
        <Button variant="outline" size="sm" @click="clearFilters">
          <X class="w-4 h-4 mr-2" />
          Clear Filters
        </Button>
        <span class="text-sm text-muted-foreground">
          {{ totalCount }} results
        </span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span class="text-muted-foreground">Loading {{ config.label.toLowerCase() }}s...</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="border border-destructive/20 bg-destructive/10 rounded-lg p-6">
      <div class="flex items-center gap-3">
        <AlertCircle class="w-5 h-5 text-destructive" />
        <div>
          <h3 class="font-medium text-destructive">Error Loading Resources</h3>
          <p class="text-sm text-destructive/80 mt-1">{{ error }}</p>
        </div>
      </div>
      <Button variant="outline" size="sm" @click="refresh" class="mt-4">
        <RotateCcw class="w-4 h-4 mr-2" />
        Try Again
      </Button>
    </div>

    <!-- Empty State -->
    <div v-else-if="isEmpty" class="text-center py-12">
      <component :is="config.icon" class="w-12 h-12 text-muted-foreground mx-auto mb-4" />
      <h3 class="text-lg font-medium text-foreground mb-2">No {{ config.pluralLabel }} Found</h3>
      <p class="text-muted-foreground mb-6">{{ config.emptyStateMessage }}</p>
      <Button @click="openAddModal">
        <component :is="config.icon" class="w-4 h-4 mr-2" />
        Add Your First {{ config.label }}
      </Button>
    </div>

    <!-- Resources Table -->
    <div v-else class="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              v-for="column in config.tableColumns" 
              :key="column.key"
              :class="[
                column.width ? `w-[${column.width}]` : '',
                column.sortable ? 'cursor-pointer hover:bg-muted/50' : ''
              ]"
              @click="column.sortable ? updateSorting(column.key) : null"
            >
              <div class="flex items-center gap-2">
                {{ column.label }}
                <div v-if="column.sortable" class="flex flex-col">
                  <ChevronUp 
                    :class="[
                      'w-3 h-3',
                      sorting.field === column.key && sorting.direction === 'asc' 
                        ? 'text-primary' 
                        : 'text-muted-foreground'
                    ]" 
                  />
                  <ChevronDown 
                    :class="[
                      'w-3 h-3 -mt-1',
                      sorting.field === column.key && sorting.direction === 'desc' 
                        ? 'text-primary' 
                        : 'text-muted-foreground'
                    ]" 
                  />
                </div>
              </div>
            </TableHead>
            <TableHead class="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow 
            v-for="resource in resources" 
            :key="resource.id"
            class="cursor-pointer hover:bg-muted/50"
            @click="openEditModal(resource)"
          >
            <TableCell v-for="column in config.tableColumns" :key="column.key">
              <component 
                v-if="column.component"
                :is="column.component"
                :resource="resource"
                :column="column"
                :value="getColumnValue(resource, column.key)"
              />
              <span v-else>
                {{ getColumnValue(resource, column.key) }}
              </span>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" @click.stop>
                    <MoreHorizontal class="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    v-for="action in config.actions" 
                    :key="action"
                    @click="handleResourceAction(resource, action)"
                  >
                    <component :is="getActionIcon(action)" class="w-4 h-4 mr-2" />
                    {{ getActionLabel(action) }}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator v-if="config.actions.includes('delete')" />
                  <DropdownMenuItem 
                    v-if="config.actions.includes('delete')"
                    @click="confirmDelete(resource)" 
                    class="text-destructive"
                  >
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
    <div v-if="hasResults" class="flex items-center justify-between mt-6">
      <p class="text-sm text-muted-foreground">
        [ {{ startIndex }} - {{ endIndex }} ] / {{ totalCount }}
      </p>
      <div class="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          :disabled="currentPage === 1" 
          @click="previousPage"
        >
          <ChevronLeft class="w-4 h-4" />
        </Button>
        <span class="text-sm font-medium px-2">{{ currentPage }}</span>
        <Button 
          variant="outline" 
          size="sm" 
          :disabled="currentPage === totalPages" 
          @click="nextPage"
        >
          <ChevronRight class="w-4 h-4" />
        </Button>
      </div>
    </div>

    <!-- Add Modal -->
    <ResourceAddModal 
      :is-open="showAddModal"
      :resource-type="resourceType"
      @close="showAddModal = false"
      @created="handleResourceCreated"
    />
    
    <!-- Edit Drawer (slides from right) -->
    <ResourceEditDrawer 
      :is-open="showEditModal"
      :resource="selectedResource"
      @close="showEditModal = false"
      @updated="handleResourceUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  Search, 
  Filter, 
  RotateCcw, 
  X, 
  AlertCircle, 
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  ExternalLink,
  Copy,
  Download,
  Play,
  Edit,
  Trash,
  RotateCw
} from 'lucide-vue-next'

// UI Components
import { Button } from '@/lib/registry/new-york/ui/button'
import { Input } from '@/lib/registry/new-york/ui/input'
// import { Label } from '@/lib/registry/new-york/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/lib/registry/new-york/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/lib/registry/new-york/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/lib/registry/new-york/ui/dropdown-menu'

// Types and Composables
import type { Resource, ResourceType } from '@/alp-types/admin-resources.types'
import { getResourceConfig } from '../config/resourceConfigs'
import { useResourceList } from '../composables/useResourceList'

// Import modal and drawer components
import ResourceAddModal from './ResourceAddModal.vue'
import ResourceEditDrawer from './ResourceEditDrawer.vue'

interface Props {
  resourceType: ResourceType
}

const props = defineProps<Props>()

// Get configuration for this resource type
const config = computed(() => getResourceConfig(props.resourceType))

// Use resource list composable
const {
  resources,
  loading,
  error,
  searchQuery,
  filters,
  sorting,
  currentPage,
  totalCount,
  totalPages,
  startIndex,
  endIndex,
  hasResults,
  isEmpty,
  updateSearch,
  updateFilters,
  updateSorting,
  goToPage,
  nextPage,
  previousPage,
  clearFilters,
  refresh,
  deleteResource,
  duplicateResource
} = useResourceList({
  resourceType: computed(() => props.resourceType)
})

// Local state
const showFilters = ref(false)
const showAddModal = ref(false)
const showEditModal = ref(false)
const selectedResource = ref<Resource | null>(null)

/**
 * Get nested property value from object
 */
function getColumnValue(resource: Resource, path: string): any {
  return path.split('.').reduce((obj: any, key: string) => obj?.[key], resource) || ''
}

/**
 * Handle filter updates
 */
function updateAccessLevel(level: string) {
  if (level === 'all') {
    updateFilters({ accessLevels: [] })
  } else {
    updateFilters({ accessLevels: [level] })
  }
}

function updateCategoryFilter(category: string) {
  updateFilters({ categories: category ? [category] : [] })
}

function updateTagFilter(tag: string) {
  updateFilters({ tags: tag ? [tag] : [] })
}

/**
 * Modal handlers
 */
function openAddModal() {
  showAddModal.value = true
}

function openEditModal(resource: Resource) {
  // create shallow copy to ensure reactivity update
  selectedResource.value = { ...resource }
  showEditModal.value = true
}

function handleResourceCreated(resource: Resource) {
  showAddModal.value = false
  refresh() // Refresh the list to show new resource
}

function handleResourceUpdated(resource: Resource) {
  showEditModal.value = false
  selectedResource.value = null
  refresh() // Refresh the list to show updated resource
}

/**
 * Resource actions
 */
async function handleResourceAction(resource: Resource, action: string) {
  switch (action) {
    case 'preview':
      // TODO: Implement preview functionality
      console.log('Preview resource:', resource)
      break
    case 'open':
      if (resource.type === 'url') {
        window.open(resource.url, '_blank')
      } else {
        // TODO: Implement open functionality for other types
        console.log('Open resource:', resource)
      }
      break
    case 'download':
      // TODO: Implement download functionality
      console.log('Download resource:', resource)
      break
    case 'play':
      // TODO: Implement video play functionality
      console.log('Play video:', resource)
      break
    case 'sync':
      // TODO: Implement SharePoint sync functionality
      console.log('Sync folder:', resource)
      break
    case 'edit':
      openEditModal(resource)
      break
    case 'duplicate':
      try {
        await duplicateResource(resource)
      } catch (error) {
        console.error('Failed to duplicate resource:', error)
      }
      break
    case 'copy':
      // TODO: Implement copy functionality
      console.log('Copy resource:', resource)
      break
  }
}

async function confirmDelete(resource: Resource) {
  if (confirm(`Are you sure you want to delete "${resource.name}"?`)) {
    try {
      await deleteResource(resource.id)
    } catch (error) {
      console.error('Failed to delete resource:', error)
    }
  }
}

/**
 * Action helpers
 */
function getActionIcon(action: string) {
  const icons: Record<string, any> = {
    preview: Eye,
    open: ExternalLink,
    download: Download,
    play: Play,
    sync: RotateCw,
    edit: Edit,
    duplicate: Copy,
    copy: Copy
  }
  return icons[action] || Eye
}

function getActionLabel(action: string): string {
  const labels: Record<string, string> = {
    preview: 'Preview',
    open: 'Open',
    download: 'Download', 
    play: 'Play',
    sync: 'Sync',
    edit: 'Edit',
    duplicate: 'Duplicate',
    copy: 'Copy'
  }
  return labels[action] || action.charAt(0).toUpperCase() + action.slice(1)
}

// Initialize component
onMounted(() => {
  // Component will auto-load data via useResourceList composable
})
</script>

<style scoped>
/* Add any component-specific styles here */
.resource-list-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
</style>