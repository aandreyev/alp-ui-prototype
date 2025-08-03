<template>
  <div class="resource-filters">
    <Card>
      <CardContent class="p-4">
        <div class="flex items-center gap-4">
          <!-- Type Filter -->
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium">Type:</label>
            <Select v-model="localFilters.type">
              <SelectTrigger class="w-32">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="form">Forms</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
                <SelectItem value="url">URLs</SelectItem>
                <SelectItem value="template">Templates</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <!-- Level Filter -->
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium">Level:</label>
            <Select v-model="localFilters.level">
              <SelectTrigger class="w-32">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="offering">Offering</SelectItem>
                <SelectItem value="outcome">Outcome</SelectItem>
                <SelectItem value="component">Component</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <!-- Search -->
          <div class="flex items-center gap-2 flex-1">
            <label class="text-sm font-medium">Search:</label>
            <div class="relative flex-1 max-w-sm">
              <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                v-model="localFilters.search"
                placeholder="Search resources..."
                class="pl-10"
              />
            </div>
          </div>
          
          <!-- Results Count -->
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{{ totalResources }} resources</span>
            <Button 
              v-if="hasActiveFilters"
              variant="ghost" 
              size="sm"
              @click="clearFilters"
              class="h-8 px-2"
            >
              <X class="w-3 h-3 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { Search, X } from 'lucide-vue-next'

import type { ResourceFilterState } from '@/alp-types/resources.types'
import { Card, CardContent } from '@/lib/registry/new-york/ui/card'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/lib/registry/new-york/ui/select'
import { Input } from '@/lib/registry/new-york/ui/input'
import { Button } from '@/lib/registry/new-york/ui/button'

// Props
interface Props {
  modelValue: ResourceFilterState
  totalResources: number
}

const props = defineProps<Props>()

// Events
const emit = defineEmits<{
  'update:modelValue': [value: ResourceFilterState]
}>()

// Local reactive copy of filters
const localFilters = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Computed properties
const hasActiveFilters = computed(() => {
  return localFilters.value.type !== 'all' || 
         localFilters.value.level !== 'all' || 
         localFilters.value.search !== ''
})

// Methods
const clearFilters = () => {
  localFilters.value = {
    type: 'all',
    level: 'all', 
    search: ''
  }
}

// Watch for changes and emit updates
watch(localFilters, (newFilters) => {
  emit('update:modelValue', newFilters)
}, { deep: true })
</script>

<style scoped>
.resource-filters {
  /* Component-specific styles */
}
</style>