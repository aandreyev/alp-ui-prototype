# UI Design Patterns and Best Practices

## Component Reusability and Composition

### Core Principle: Atomic Design Pattern
We follow the atomic design methodology where smaller, reusable components are composed into larger, more complex components.

### Resource Components Architecture

#### 1. ResourceCard (Atomic Component)
- **Purpose**: Display resource details with consistent styling and actions
- **Reusability**: Used everywhere a resource needs to be displayed
- **Props**: 
  - `resource`: The resource data
  - `compact`: Boolean for compact vs full display
  - `showHierarchyPath`: Boolean to show/hide hierarchy
  - `actions`: Array of available actions (preview, open, edit, etc.)
- **Events**: Emits click and action events for parent handling

#### 2. ResourceModal (Molecular Component)
- **Purpose**: Simple modal wrapper that displays a ResourceCard
- **Reusability**: Used for individual resource detail views
- **Composition**: Contains ResourceCard + modal wrapper
- **Props**: 
  - `visible`: Boolean
  - `resource`: Resource data
  - `cardProps`: Props to pass to ResourceCard

#### 3. ComponentResourcesModal (Organism Component)
- **Purpose**: Complex modal for browsing/filtering multiple resources
- **Reusability**: Used for component-level resource management
- **Composition**: Contains multiple ResourceCards + search/filter functionality
- **Props**: 
  - `visible`: Boolean
  - `component`: Component data with resources
  - `searchable`: Boolean for search functionality

### Design Pattern Rules

#### ✅ DO:
1. **Reuse ResourceCard everywhere** resources are displayed
2. **Pass configuration via props** rather than creating variants
3. **Compose larger components** from smaller ones
4. **Emit events upward** for parent handling
5. **Keep components focused** on single responsibility

#### ❌ DON'T:
1. **Hard-code resource display logic** in multiple places
2. **Create duplicate resource layouts** 
3. **Mix display and business logic** in the same component
4. **Create component-specific resource displays** when ResourceCard exists

### Implementation Examples

#### Good: Using ResourceCard in a modal
```vue
<template>
  <Modal :visible="visible" @close="$emit('close')">
    <ResourceCard 
      :resource="resource" 
      :compact="false"
      @action="handleAction"
    />
  </Modal>
</template>
```

#### Bad: Hard-coding resource display
```vue
<template>
  <Modal :visible="visible" @close="$emit('close')">
    <div class="resource-display">
      <h3>{{ resource.name }}</h3>
      <p>{{ resource.description }}</p>
      <!-- Duplicated layout logic -->
    </div>
  </Modal>
</template>
```

### Benefits of This Pattern

1. **Consistency**: All resource displays look and behave the same
2. **Maintainability**: Changes to resource display only need to be made in one place
3. **Testability**: Smaller components are easier to test
4. **Flexibility**: Props allow customization without duplication
5. **Scalability**: New features can be added to ResourceCard and benefit all uses

### Current Implementation Status

- ✅ ResourceCard: Well-designed atomic component
- ❌ EnhancedOutcomesTab: Hard-codes resource display instead of using ResourceCard
- ❌ ResourceDetailModal: Should be simplified to just wrap ResourceCard
- ✅ ComponentResourcesModal: Good example of composition

### Next Steps

1. Refactor EnhancedOutcomesTab to use ResourceCard components
2. Simplify ResourceDetailModal to be a simple wrapper around ResourceCard
3. Ensure all future resource displays use ResourceCard
4. Document component props and events clearly
