<template>
  <div class="resource-hierarchy space-y-4">
    <!-- Offering Level Resources -->
    <div v-if="offeringResources.length > 0" class="offering-section">
      <div class="flex items-center gap-2 mb-3">
        <Building class="w-4 h-4 text-muted-foreground" />
        <h3 class="font-medium text-sm">Offering Level Resources</h3>
        <Badge variant="secondary" class="text-xs">{{ offeringResources.length }}</Badge>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ml-6">
        <ResourceCard 
          v-for="resource in offeringResources" 
          :key="resource.id"
          :resource="resource"
          @click="handleResourceClick"
          @action="handleResourceAction"
        />
      </div>
    </div>

    <!-- Outcomes -->
    <div v-for="outcome in outcomes" :key="outcome.id" class="outcome-section">
      <Collapsible v-model:open="expandedOutcomes[outcome.id]" class="space-y-3">
        <CollapsibleTrigger class="flex items-center gap-2 w-full text-left p-3 rounded-lg hover:bg-muted/50 transition-colors">
          <ChevronRight 
            class="w-4 h-4 transition-transform duration-200"
            :class="{ 'rotate-90': expandedOutcomes[outcome.id] }"
          />
          <Target class="w-4 h-4 text-muted-foreground" />
          <span class="font-medium">{{ outcome.name }}</span>
          <Badge variant="outline" class="ml-auto text-xs">
            {{ getTotalResourcesForOutcome(outcome) }} resources
          </Badge>
        </CollapsibleTrigger>
        
        <CollapsibleContent class="space-y-4 ml-6">
          <!-- Outcome Level Resources -->
          <div v-if="outcome.resources?.length" class="outcome-resources">
            <div class="flex items-center gap-2 mb-3">
              <Target class="w-3 h-3 text-muted-foreground" />
              <h4 class="font-medium text-sm">Outcome Resources</h4>
              <Badge variant="secondary" class="text-xs">{{ outcome.resources.length }}</Badge>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ml-4">
              <ResourceCard 
                v-for="resource in outcome.resources" 
                :key="resource.id"
                :resource="resource"
                :hierarchy-path="`${outcome.name}`"
                :show-hierarchy-path="true"
                @click="handleResourceClick"
                @action="handleResourceAction"
              />
            </div>
          </div>

          <!-- Components -->
          <div v-for="component in outcome.children" :key="component.id" class="component-section ml-4">
            <Collapsible v-model:open="expandedComponents[component.id]">
              <CollapsibleTrigger class="flex items-center gap-2 w-full text-left p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <ChevronRight 
                  class="w-3 h-3 transition-transform duration-200"
                  :class="{ 'rotate-90': expandedComponents[component.id] }"
                />
                <CheckSquare class="w-3 h-3 text-muted-foreground" />
                <span class="text-sm">{{ component.name }}</span>
                <Badge variant="outline" class="ml-auto text-xs">
                  {{ component.resources?.length || 0 }} resources
                </Badge>
              </CollapsibleTrigger>
              
              <CollapsibleContent v-if="component.resources?.length" class="mt-3 ml-6">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <ResourceCard 
                    v-for="resource in component.resources" 
                    :key="resource.id"
                    :resource="resource"
                    :hierarchy-path="`${outcome.name} → ${component.name}`"
                    :show-hierarchy-path="true"
                    @click="handleResourceClick"
                    @action="handleResourceAction"
                  />
                </div>
              </CollapsibleContent>
              
              <!-- Empty component state -->
              <CollapsibleContent v-else class="mt-3 ml-6">
                <div class="text-center py-6 text-muted-foreground">
                  <FileX class="mx-auto h-8 w-8 mb-2" />
                  <p class="text-sm">No resources available for this component</p>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  ChevronRight, 
  Target, 
  CheckSquare, 
  Building,
  FileX
} from 'lucide-vue-next'

import type { MatterElementWithResources, Resource } from '@/alp-types/resources.types'
import { Badge } from '@/lib/registry/new-york/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/lib/registry/new-york/ui/collapsible'
import ResourceCard from './ResourceCard.vue'

// Props
interface Props {
  outcomes: MatterElementWithResources[]
  offeringResources?: Resource[]
}

const props = withDefaults(defineProps<Props>(), {
  offeringResources: () => []
})

// Events
const emit = defineEmits<{
  'resource-click': [resource: Resource]
  'resource-action': [action: string, resource: Resource]
}>()

// State for expanded sections
const expandedOutcomes = ref<Record<string, boolean>>({})
const expandedComponents = ref<Record<string, boolean>>({})

// Initialize expanded state (expand first outcome and its first component by default)
if (props.outcomes.length > 0) {
  expandedOutcomes.value[props.outcomes[0].id] = true
  if (props.outcomes[0].children?.length) {
    expandedComponents.value[props.outcomes[0].children[0].id] = true
  }
}

// Computed
const offeringResources = computed(() => props.offeringResources || [])

// Methods
const getTotalResourcesForOutcome = (outcome: MatterElementWithResources): number => {
  const outcomeResources = outcome.resources?.length || 0
  const componentResources = outcome.children?.reduce((sum, component) => 
    sum + (component.resources?.length || 0), 0) || 0
  return outcomeResources + componentResources
}

const handleResourceClick = (resource: Resource) => {
  emit('resource-click', resource)
}

const handleResourceAction = (action: string, resource: Resource) => {
  emit('resource-action', action, resource)
}
</script>

<style scoped>
.resource-hierarchy {
  /* Component-specific styles */
}

.outcome-section,
.component-section {
  border-left: 2px solid theme('colors.border');
  position: relative;
}

.outcome-section::before,
.component-section::before {
  content: '';
  position: absolute;
  left: -6px;
  top: 20px;
  width: 10px;
  height: 2px;
  background-color: theme('colors.border');
}
</style>