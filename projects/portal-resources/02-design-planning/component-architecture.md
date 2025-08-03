# Component Architecture - Portal Resources

## Architecture Overview

The Portal Resources system follows a hierarchical component structure that mirrors the business domain (Offering → Outcome → Component) while integrating seamlessly with existing ALP UI patterns.

## Component Hierarchy

```
MatterResourcesTab (Main Container)
├── VDOfferingFolders (External Links Section)
├── ResourceHierarchy (Business Structure Display)
│   ├── OfferingSection
│   │   ├── OutcomeSection
│   │   │   └── ComponentSection
│   │   │       └── ResourceCard[]
│   │   └── ResourceCard[] (Outcome-level)
│   └── ResourceCard[] (Offering-level)
├── ResourceFilters (Filter Controls)
└── ResourceModal (Detail View)
    ├── ResourceDetails
    ├── ResourceActions
    └── RelatedResources
```

---

## Core Components

### 1. **MatterResourcesTab.vue** (Main Container)
**Purpose**: Primary container component integrating into ALP Matter detail tabs

**Responsibilities**:
- Tab integration with existing ALP tab system
- Overall layout and state management
- Coordination between child components
- Loading states and error handling

**Props**:
```typescript
interface Props {
  matterId: string
  offeringId?: string  // Current offering context
  outcomeId?: string   // Current outcome context
  componentId?: string // Current component context
}
```

**State Management**:
- Resources data (from JSON test files)
- Current filter state
- Modal visibility state
- Loading/error states

**Layout Structure**:
```vue
<template>
  <div class="resources-tab">
    <ResourcesHeader />
    <VDOfferingFolders :offering="currentOffering" />
    <ResourceFilters v-model="filterState" />
    <ResourceHierarchy 
      :resources="filteredResources"
      :offering="currentOffering"
      @resource-click="openResourceModal"
    />
    <ResourceModal 
      v-if="modalVisible"
      :resource="selectedResource"
      @close="closeModal"
    />
  </div>
</template>
```

### 2. **VDOfferingFolders.vue** (External Links)
**Purpose**: Display direct links to SharePoint VD Offering Folders

**Responsibilities**:
- Show offering-specific SharePoint folders
- Handle external link navigation (new tab/window)
- Display appropriate external link indicators

**Props**:
```typescript
interface Props {
  offering: Offering
}

interface Offering {
  id: string
  name: string
  vdFolderUrl?: string
}
```

**Design Pattern**:
- Card-based display with external link styling
- Prominent placement at top of resources
- Clear visual indication of external navigation

### 3. **ResourceHierarchy.vue** (Business Structure)
**Purpose**: Display resources organized by business hierarchy

**Responsibilities**:
- Render Offering → Outcome → Component structure
- Handle expand/collapse states
- Manage resource organization and display
- Route resource interactions to parent

**Props**:
```typescript
interface Props {
  offering: OfferingWithResources
  resources: Resource[]
  expandedSections?: string[]
}

interface OfferingWithResources {
  id: string
  name: string
  outcomes: OutcomeWithResources[]
  resources: Resource[]  // Offering-level resources
}
```

**State Management**:
- Section expand/collapse states
- Current view level (Offering/Outcome/Component)
- Resource grouping and organization

### 4. **ResourceCard.vue** (Individual Resource)
**Purpose**: Display individual resource with actions

**Responsibilities**:
- Resource metadata display
- Quick action buttons
- Type-specific styling and icons
- Click handling for modal opening

**Props**:
```typescript
interface Props {
  resource: Resource
  showHierarchyPath?: boolean
  compact?: boolean
}

interface Resource {
  id: string
  name: string
  type: 'form' | 'document' | 'url' | 'template'
  description?: string
  url?: string
  metadata: ResourceMetadata
  hierarchyLevel: 'offering' | 'outcome' | 'component'
  associatedWith: {
    offeringId: string
    outcomeId?: string
    componentId?: string
  }
}
```

**Action Buttons**:
- **Preview**: Quick preview in modal
- **Open**: Open resource directly
- **Copy Link**: Copy resource URL
- **Download**: Download if applicable

### 5. **ResourceModal.vue** (Detail View)
**Purpose**: Modal dialog for detailed resource information and actions

**Responsibilities**:
- Detailed resource information display
- Full action set (preview, open, copy, download)
- Related resources suggestions
- Consistent modal behavior with ALP patterns

**Props**:
```typescript
interface Props {
  resource: Resource
  relatedResources?: Resource[]
  visible: boolean
}
```

**Modal Structure**:
- Header: Resource name and type
- Body: Description, metadata, hierarchy path
- Actions: Primary and secondary action buttons
- Footer: Related resources or additional options

### 6. **ResourceFilters.vue** (Filter Controls)
**Purpose**: Filter controls for resource display

**Responsibilities**:
- Resource type filtering
- Search functionality
- Filter state management
- Clear/reset functionality

**Filter Types**:
- **All Resources**: Default view
- **By Type**: Forms, Documents, URLs, Templates
- **By Level**: Offering, Outcome, Component
- **Search**: Text-based resource search

---

## Data Flow Architecture

### State Management Pattern

```typescript
// Composable for resource management
const useResourcesData = (matterId: string) => {
  const resources = ref<Resource[]>([])
  const offering = ref<OfferingWithResources>()
  const loading = ref(false)
  const error = ref<string>()

  const loadResources = async () => {
    // Load from JSON test data
  }

  const filterResources = (filterState: FilterState) => {
    // Apply filters to resources
  }

  return {
    resources,
    offering,
    loading,
    error,
    loadResources,
    filterResources
  }
}
```

### Event Flow

1. **Initial Load**:
   - `MatterResourcesTab` loads matter-specific resources
   - Data fetched from JSON files in `/alp-workspace/src/alp-data/`
   - Hierarchical structure built from flat resource list

2. **User Interactions**:
   - Filter changes → Update displayed resources
   - Resource card click → Open modal with resource details
   - VD folder click → Navigate to external SharePoint
   - Resource action → Execute specific resource action

3. **State Updates**:
   - All state changes flow through parent component
   - Child components emit events for state changes
   - Reactive updates cascade down component tree

---

## Integration Patterns

### ALP Tab Integration

```vue
<!-- Existing ALP Matter Detail View -->
<template>
  <div class="matter-detail">
    <MatterHeader />
    <TabNavigation>
      <Tab name="overview" />
      <Tab name="info" />
      <Tab name="outcomes" />
      <Tab name="resources" /> <!-- NEW -->
      <!-- other tabs -->
    </TabNavigation>
    
    <router-view />
  </div>
</template>
```

### Route Configuration

```typescript
// Add to existing matter routes
{
  path: '/matters/:id/resources',
  component: MatterResourcesTab,
  props: true
}
```

### Styling Integration

**Consistency Requirements**:
- Follow existing ALP card patterns for ResourceCard
- Use existing modal patterns for ResourceModal
- Match tab styling for main container
- Maintain existing color scheme and typography

**Tailwind Classes**:
- Standard ALP spacing: `p-6`, `space-y-4`
- Card styling: `bg-white rounded-lg shadow-sm border`
- Button patterns: Existing ALP button variants
- Typography: Existing heading and text classes

---

## Component Reusability

### Shared Components

**ResourceCard.vue**:
- Reusable across hierarchy levels
- Configurable display modes (full, compact)
- Consistent action patterns

**ResourceModal.vue**:
- Standard modal wrapper from ALP
- Resource-specific content area
- Reusable action button patterns

### Extension Points

**Future Resource Types**:
- Plugin architecture for new resource types
- Configurable action sets per resource type
- Extensible metadata display

**Integration Opportunities**:
- ResourceCard could be used in other ALP areas
- ResourceModal pattern applicable to other entity types
- Filter patterns reusable for other list views

---

## Error Handling Architecture

### Error Boundaries

```vue
<!-- MatterResourcesTab error handling -->
<template>
  <div class="resources-tab">
    <div v-if="error" class="error-state">
      <ErrorMessage :error="error" @retry="loadResources" />
    </div>
    <div v-else-if="loading" class="loading-state">
      <ResourcesSkeleton />
    </div>
    <div v-else>
      <!-- Normal content -->
    </div>
  </div>
</template>
```

### Resource Access Errors

**SharePoint Link Failures**:
- Modal with specific error message
- Retry option where appropriate
- Alternative access suggestions (VD folders)

**Resource Not Found**:
- Graceful degradation in hierarchy display
- Clear messaging about unavailable resources
- Option to refresh or report issue

---

## Performance Considerations

### Lazy Loading

**Resource Data**:
- Load resources only when Resources tab accessed
- Progressive loading for large resource sets
- Skeleton states during loading

**Modal Content**:
- Resource details loaded on modal open
- Related resources loaded asynchronously
- Modal content caching for repeat access

### Optimization Strategies

**Virtual Scrolling**: For large resource lists
**Computed Properties**: For filtered/sorted resources
**Component Caching**: Cache resource cards for performance
**Debounced Search**: Optimize search performance

---

This component architecture provides a solid foundation for Phase 3 implementation while ensuring consistency with existing ALP patterns and optimal user experience for the defined journeys.