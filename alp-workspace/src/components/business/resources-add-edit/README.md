# Portal Resources Components

## Overview

This directory contains the Vue.js components for the Portal Resources Management System, designed to provide "point-of-need" resource delivery for legal matters within the ALP application.

## Business Context

The Portal Resources system addresses the key business objective: **To make resources available to users at the "point of need"** - the most appropriate resource at the most appropriate time during matter execution.

### Key Features
- **Hierarchical Resource Display**: Resources organized by Offering → Outcome → Component structure
- **VD Offering Folders**: Direct links to SharePoint offering-specific resources
- **Resource Types**: Forms, Documents, URLs, Templates
- **Point-of-Need Access**: Contextual resource delivery within matter workflow
- **Dynamic Resource Linking**: Resources always reflect current offering structure

## Component Architecture

### Core Components

#### `MatterResourcesTab.vue` (Main Container)
- **Purpose**: Primary container component integrating into ALP Matter detail tabs
- **Responsibilities**: Tab integration, state management, data loading, error handling
- **Props**: `matterId: string`
- **Key Features**: Loading states, error handling, resource filtering, modal coordination

#### `ResourceCard.vue` (Individual Resource Display)
- **Purpose**: Display individual resource with metadata and actions
- **Responsibilities**: Resource presentation, quick actions, type-specific styling
- **Props**: `resource: Resource`, `showHierarchyPath?: boolean`, `compact?: boolean`
- **Key Features**: Resource type icons, metadata display, hover actions

<!-- SharePoint links: If needed, expose offering `vdFolderUrl` or `sharePointUrl` in the parent view; no dedicated component in this stack. -->

#### `ResourceHierarchy.vue` (Business Structure Display)
- **Purpose**: Display resources organized by business hierarchy
- **Responsibilities**: Hierarchical display, expand/collapse states, resource organization
- **Props**: `outcomes: MatterElementWithResources[]`
- **Key Features**: Collapsible sections, resource counting, empty states

#### `ResourceFilters.vue` (Filter Controls)
- **Purpose**: Provide filtering and search functionality
- **Responsibilities**: Filter state management, search functionality
- **Props**: `modelValue: ResourceFilterState`, `totalResources: number`
- **Key Features**: Type filtering, search, clear filters, result counts

#### `ResourceModal.vue` (Detail View)
- **Purpose**: Modal dialog for detailed resource information and actions
- **Responsibilities**: Detailed resource display, action handling, related resources
- **Props**: `resource: Resource`, `visible: boolean`, `hierarchyPath?: string`
- **Key Features**: Resource metadata, quick actions, related resources

## Data Architecture

### Simplified Linking Strategy

The system follows a simplified data layer approach where:

1. **Matter Elements**: Copied from offering structure at matter creation (names never change)
2. **Resource Links**: Each matter element has `linkedOfferingElementId` pointing to current offering element
3. **Resource Fetching**: UI fetches resources for linked offering elements (always current)
4. **Background Updates**: Links updated when offerings are redesigned (handled by data layer)

### TypeScript Interfaces

```typescript
interface MatterElement {
  id: string
  matterId: string
  type: 'outcome' | 'component'
  name: string // Never changes
  linkedOfferingElementId?: string // Updated by background process
}

interface Resource {
  id: string
  name: string
  type: 'form' | 'document' | 'url' | 'template'
  url?: string
  metadata: ResourceMetadata
}
```

### Test Data Structure

```
/alp-data/resources/
├── all-resources.json         # Unified catalog of all resources
├── loadAllResources.ts        # Loader for unified resources
├── matter-elements.json       # Matter structure with offering links
└── offerings.json             # Offering metadata including VD folder URLs

/alp-data/resource-association/
├── simplified-offerings-structure.json  # Offerings/outcomes/components with resource ID references
└── loadSimplifiedOfferings.ts           # Resolves structure + catalog into associatedResources arrays
```

## Integration Patterns

### ALP Tab Integration

The resources tab integrates seamlessly with existing ALP Matter detail tabs:

```vue
<!-- Added to existing matter tab navigation -->
<router-link to="/matters/123/resources">
  <FolderOpen class="w-4 h-4" />
  Resources
  <Badge>{{ resourceCount }}</Badge>
</router-link>
```

### Styling Consistency

- **shadcn/ui (New York variant)**: Consistent with existing ALP UI components
- **Tailwind CSS**: Uses existing ALP utility classes and color scheme
- **Lucide Icons**: Same icon library as rest of ALP application
- **Responsive Design**: Desktop-first responsive patterns matching ALP

## Usage Examples

### Basic Resource Tab

```vue
<template>
  <MatterResourcesTab :matter-id="matterId" />
</template>
```

### Standalone Resource Card

```vue
<template>
  <ResourceCard 
    :resource="resource"
    :show-hierarchy-path="true"
    :hierarchy-path="'Outcome → Component'"
    @click="handleResourceClick"
    @action="handleResourceAction"
  />
</template>
```

### Resource Modal

```vue
<template>
  <ResourceModal 
    :resource="selectedResource"
    :visible="modalVisible"
    :hierarchy-path="resourcePath"
    @close="closeModal"
    @action="handleAction"
  />
</template>
```

## Development Guidelines

### Component Standards
- **Vue 3 Composition API**: All components use `<script setup>` syntax
- **TypeScript**: Strict typing for all props, events, and data
- **Accessibility**: WCAG 2.1 AA compliance with proper ARIA labels
- **Error Handling**: Graceful error states and fallbacks

### Performance Considerations
- **Lazy Loading**: Components and data loaded on-demand
- **Virtual Scrolling**: For large resource sets (future enhancement)
- **Resource Caching**: Browser-level caching for resource metadata
- **Optimistic UI**: Immediate feedback for user actions

### Testing Strategy
- **Unit Tests**: Component logic and data transformations
- **Integration Tests**: Resource loading and state management
- **E2E Tests**: Complete user workflows through resources tab

## Future Enhancements

### Planned Features
1. **Resource Versioning**: Track and display resource version history
2. **Bulk Actions**: Select and perform actions on multiple resources
3. **Resource Analytics**: Track resource usage and effectiveness
4. **Custom Resource Types**: Support for additional resource types
5. **Advanced Search**: Full-text search across resource content

### Extension Points
- **Resource Type Plugins**: Add support for new resource types
- **Action Plugins**: Custom actions for specific resource types
- **Integration Hooks**: Connect with external systems (beyond SharePoint)

## Troubleshooting

### Common Issues

**Resources not loading**
- Check matter ID is valid
- Verify test data files are present
- Check browser console for import errors

**Modal not opening**
- Ensure ResourceModal component is imported
- Check click event handlers are properly bound
- Verify resource data structure

**Styling issues**
- Confirm shadcn/ui components are properly installed
- Check Tailwind CSS classes are available
- Verify component imports are correct

## Dependencies

### Required ALP Components
- `@/components/ui/button`
- `@/components/ui/card`
- `@/components/ui/dialog`
- `@/components/ui/badge`
- `@/components/ui/select`
- `@/components/ui/input`
- `@/components/ui/collapsible`

### External Dependencies
- `lucide-vue-next` - Icons
- `vue` - Framework
- `typescript` - Type safety

## Support

For questions about Portal Resources components:
1. Review this README and component JSDoc comments
2. Check existing ALP UI patterns for consistency
3. Refer to Phase 2 design documentation in `/projects/portal-resources/`
4. Test changes with provided test data scenarios