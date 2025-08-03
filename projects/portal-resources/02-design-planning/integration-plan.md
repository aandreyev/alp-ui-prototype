# Integration Plan - Portal Resources

## Integration Strategy Overview

This plan details how Portal Resources integrates into the existing ALP system while maintaining consistency, performance, and user experience standards.

## Phase 3 Implementation Roadmap

### Sprint 1: Foundation & Core Components
**Goal**: Establish basic structure and core components

#### Tasks:
1. **Environment Setup**
   - Set up `/alp-workspace/src/components/business/resources/` directory
   - Create base TypeScript interfaces
   - Set up test data structure in `/alp-workspace/src/alp-data/resources/`

2. **Core Component Development**
   - `MatterResourcesTab.vue` - Basic container with tab integration
   - `ResourceCard.vue` - Individual resource display component
   - Basic routing integration

3. **Test Data Creation**
   - Create "Unfair Dismissal" test data set
   - Offering → Outcome → Component hierarchy
   - Sample resources for each level

**Deliverables**:
- ✅ Basic Resources tab functional in Matter detail view
- ✅ Resource cards display test data
- ✅ Tab navigation works with existing ALP routing

### Sprint 2: Hierarchy & Organization
**Goal**: Implement business hierarchy display and organization

#### Tasks:
1. **Hierarchical Display**
   - `ResourceHierarchy.vue` - Business structure component
   - Expand/collapse functionality
   - Level-appropriate resource display

2. **VD Offering Folders**
   - `VDOfferingFolders.vue` - External SharePoint links
   - External link handling patterns
   - Mock SharePoint URL integration

3. **Data Management**
   - Resource data loading composable
   - Hierarchy building logic
   - State management integration

**Deliverables**:
- ✅ Resources organized by Offering → Outcome → Component
- ✅ VD Offering Folders link to mock SharePoint
- ✅ Hierarchical navigation works intuitively

### Sprint 3: Interactions & Filtering
**Goal**: Add user interactions and resource management

#### Tasks:
1. **Modal System**
   - `ResourceModal.vue` - Resource detail modal
   - Integration with ALP modal patterns
   - Resource action buttons (Preview, Open, Copy, Download)

2. **Filtering System**
   - `ResourceFilters.vue` - Filter controls
   - Resource type filtering
   - Search functionality
   - Filter state management

3. **User Interactions**
   - Click handling for resources
   - External link navigation
   - Modal open/close behavior

**Deliverables**:
- ✅ Resource modals show detailed information
- ✅ Filtering works for resource types
- ✅ External links open appropriately

### Sprint 4: Polish & Validation
**Goal**: Refine user experience and prepare for validation

#### Tasks:
1. **UI Polish**
   - Responsive design implementation
   - Loading states and skeleton screens
   - Error handling and messaging

2. **Performance Optimization**
   - Lazy loading implementation
   - Resource caching
   - Component optimization

3. **Validation Preparation**
   - User testing scenarios
   - Documentation completion
   - Stakeholder demo preparation

**Deliverables**:
- ✅ Production-ready UI with error handling
- ✅ Performance optimized for large resource sets
- ✅ Ready for user validation testing

---

## Technical Integration Points

### 1. ALP Router Integration

#### Current ALP Routing Structure:
```typescript
// Existing matter routes
/matters/{matterId}/overview
/matters/{matterId}/info  
/matters/{matterId}/outcomes
/matters/{matterId}/time-entry
```

#### Resources Integration:
```typescript
// New route addition
/matters/{matterId}/resources

// Router configuration
{
  path: '/matters/:matterId/resources',
  name: 'matter-resources',
  component: () => import('@/components/business/resources/MatterResourcesTab.vue'),
  props: route => ({ 
    matterId: route.params.matterId 
  })
}
```

### 2. Tab Navigation Integration

#### Existing Tab Component Enhancement:
```vue
<!-- MatterTabs.vue modification -->
<template>
  <nav class="matter-tabs">
    <router-link 
      v-for="tab in enhancedTabs" 
      :to="tab.route"
      class="tab-item"
    >
      <component :is="tab.icon" />
      {{ tab.label }}
      <Badge v-if="tab.count" variant="secondary">
        {{ tab.count }}
      </Badge>
    </router-link>
  </nav>
</template>

<script setup lang="ts">
const enhancedTabs = computed(() => [
  // ... existing tabs
  {
    key: 'resources',
    label: 'Resources',
    icon: FolderOpen,
    route: `/matters/${matterId.value}/resources`,
    count: resourceCount.value
  }
])
</script>
```

### 3. Component Library Integration

#### shadcn/ui Component Usage:
```typescript
// Components to integrate from existing ALP
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem } from '@/components/ui/select'

// Icons from Lucide (existing in ALP)
import { 
  FolderOpen, 
  FileText, 
  Link, 
  Download, 
  ExternalLink,
  Filter,
  Search
} from 'lucide-vue-next'
```

---

## Data Integration Strategy

### 1. Test Data Structure

#### File Organization:
```
/alp-workspace/src/alp-data/resources/
├── offerings.json          # Offering definitions
├── outcomes.json           # Outcomes for offerings  
├── components.json         # Components for outcomes
├── resources.json          # Resource definitions
├── associations.json       # Resource-to-hierarchy mappings
└── matter-mappings.json    # Matter-to-offering associations
```

#### Example Test Data:

**matter-elements.json**:
```json
[
  {
    "id": "matter-outcome-001",
    "matterId": "matter-123",
    "type": "outcome", 
    "name": "Understanding your rights and deciding best claim",
    "sequence": 1,
    "linkedOfferingElementId": "offering-outcome-001",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  {
    "id": "matter-component-001",
    "matterId": "matter-123",
    "type": "component",
    "name": "Understanding your position",
    "parentId": "matter-outcome-001",
    "sequence": 1,
    "linkedOfferingElementId": "offering-component-001", 
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

**offering-resources.json** (resources linked to offering elements):
```json
[
  {
    "offeringElementId": "offering-component-001",
    "resources": [
      {
        "id": "resource-001",
        "name": "Position Analysis Form",
        "type": "form",
        "url": "https://syntaq.example.com/forms/position-analysis"
      }
    ]
  }
]
```

### 2. Data Loading Implementation

```typescript
// /alp-workspace/src/composables/useResourcesData.ts
export const useResourcesData = (matterId: string) => {
  const { data: testData, loading, error } = useAsyncData(
    `resources-${matterId}`,
    async () => {
      // Load all test data files
      const [offerings, outcomes, components, resources, associations] = 
        await Promise.all([
          $fetch('/alp-data/resources/offerings.json'),
          $fetch('/alp-data/resources/outcomes.json'),
          $fetch('/alp-data/resources/components.json'),
          $fetch('/alp-data/resources/resources.json'),
          $fetch('/alp-data/resources/associations.json')
        ])

      // Build hierarchical structure for specific matter
      return buildResourceHierarchy(
        offerings, 
        outcomes, 
        components, 
        resources, 
        associations, 
        matterId
      )
    }
  )

  return { 
    resourceData: testData, 
    loading, 
    error 
  }
}
```

---

## Styling Integration

### 1. Tailwind CSS Consistency

#### Color Scheme Alignment:
```css
/* Use existing ALP color variables */
.resource-card {
  @apply bg-background border-border text-foreground;
}

.resource-card-hover {
  @apply hover:bg-accent hover:text-accent-foreground;
}

.external-link {
  @apply text-blue-600 hover:text-blue-800;
}
```

#### Component Styling Patterns:
```vue
<!-- Follow existing ALP card patterns -->
<Card class="resource-card hover:shadow-md transition-shadow">
  <CardHeader class="pb-3">
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-2">
        <component :is="resourceIcon" class="w-4 h-4 text-muted-foreground" />
        <h3 class="font-medium text-sm">{{ resource.name }}</h3>
      </div>
      <Badge variant="outline" class="text-xs">
        {{ resource.type }}
      </Badge>
    </div>
  </CardHeader>
  
  <CardContent class="pt-0">
    <p class="text-muted-foreground text-xs line-clamp-2">
      {{ resource.description }}
    </p>
  </CardContent>
</Card>
```

### 2. Responsive Design Implementation

```vue
<!-- Mobile-first responsive patterns -->
<div class="resources-container">
  <!-- Desktop: 3-column grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <ResourceCard v-for="resource in resources" :key="resource.id" />
  </div>
  
  <!-- Mobile: Stack hierarchy -->
  <div class="block lg:hidden">
    <Accordion type="single" collapsible>
      <AccordionItem v-for="outcome in outcomes" :value="outcome.id">
        <AccordionTrigger>{{ outcome.name }}</AccordionTrigger>
        <AccordionContent>
          <!-- Mobile resource display -->
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
</div>
```

---

## Performance Integration

### 1. Code Splitting Strategy

```typescript
// Lazy load resource components
const MatterResourcesTab = defineAsyncComponent(() => 
  import('@/components/business/resources/MatterResourcesTab.vue')
)

const ResourceModal = defineAsyncComponent(() =>
  import('@/components/business/resources/ResourceModal.vue')
)

// Route-level code splitting
{
  path: '/matters/:matterId/resources',
  component: () => import('@/views/matter/ResourcesView.vue')
}
```

### 2. Caching Integration

```typescript
// Integrate with existing ALP caching patterns
const useResourceCache = () => {
  const cacheStore = useStore('resourceCache')
  
  const getCachedResources = (matterId: string) => {
    return cacheStore.get(`matter-resources-${matterId}`)
  }

  const setCachedResources = (matterId: string, data: any) => {
    cacheStore.set(`matter-resources-${matterId}`, data, { ttl: 300000 }) // 5 min
  }

  return { getCachedResources, setCachedResources }
}
```

---

## Error Handling Integration

### 1. ALP Error Pattern Consistency

```typescript
// Use existing ALP error handling patterns
const useResourceErrorHandling = () => {
  const { showErrorToast, logError } = useALPErrorHandling()

  const handleResourceError = (error: ResourceError) => {
    // Log error with ALP logging system
    logError('Resource Error', error)

    // Show user-friendly toast
    switch (error.type) {
      case 'LOAD_FAILED':
        showErrorToast('Failed to load resources. Please refresh.')
        break
      case 'EXTERNAL_LINK_FAILED':
        showErrorToast('External link failed. Link copied to clipboard.')
        break
      default:
        showErrorToast('An unexpected error occurred.')
    }
  }

  return { handleResourceError }
}
```

---

## Testing Integration

### 1. Component Testing Strategy

```typescript
// Test setup following ALP patterns
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import MatterResourcesTab from '@/components/business/resources/MatterResourcesTab.vue'

describe('MatterResourcesTab', () => {
  const wrapper = mount(MatterResourcesTab, {
    global: {
      plugins: [createTestingPinia()],
      stubs: ['router-link', 'router-view']
    },
    props: {
      matterId: 'test-matter-123'
    }
  })

  it('renders resources tab correctly', () => {
    expect(wrapper.find('[data-testid="resources-tab"]').exists()).toBe(true)
  })

  it('loads resources on mount', () => {
    // Test resource loading behavior
  })
})
```

---

This integration plan ensures seamless implementation while maintaining ALP consistency and providing clear milestones for the 4-week development timeline.