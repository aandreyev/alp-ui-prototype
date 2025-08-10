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
  - `isOpen`: Boolean (standard modal open prop)
  - `resource`: Resource data
  - `cardProps`: Props to pass to ResourceCard

#### 3. ComponentResourcesModal (Organism Component)
- **Purpose**: Complex modal for browsing/filtering multiple resources
- **Reusability**: Used for component-level resource management
- **Composition**: Contains multiple ResourceCards + search/filter functionality
- **Props**: 
  - `isOpen`: Boolean
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
  <Modal :is-open="isOpen" @close="$emit('close')">
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
  <Modal :is-open="isOpen" @close="$emit('close')">
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

---

## Data Binding and Reactivity Standards (Project-wide)

For consistent, bug-free forms and modals, follow these rules (see VUE_DATA_BINDING_PATTERNS.md for full details):

### UI kit bindings
- Input/Textarea/Select must use modelValue and emit update:modelValue.
  - Don’t pass value; it won’t render with our components.
- Example:
```vue
<Input :modelValue="value" @update:modelValue="v => $emit('update:field', 'field', v)" />
<Select :modelValue="type" @update:modelValue="v => $emit('update:field', 'type', v)"></Select>
```

### Read-only fields
- Even read-only Inputs require modelValue to display values:
```vue
<Input :modelValue="formatDate(resource.updatedAt)" readonly />
```

### Parent-owns-data pattern
- Parent owns the full form object; children emit update:field with path + value.
- Update nested paths in the parent; do not mutate props in children.

### Reactivity pitfalls and fixes
- Don’t replace shared objects bound to many children (e.g., formData.value = newObj).
  - Prefer Object.assign(formData.value, newValues) to preserve bindings.
  - If replacing is unavoidable, re-key the subtree to force remount:
```vue
<DialogContent :key="`${mode}-${resource?.id ?? 'new'}`" />
```

### Dropdown consistency
- Our Select is Radix-based; always use modelValue/update:modelValue.
- Ensure data enums/strings match SelectItem values, or the control will fallback to defaults.

### Modal API conventions
- Public modal components should expose isOpen (Boolean) and a close event.
- Internally, forward to base Dialog open/@update:open.

### Type safety and unions
- Use a single source of truth for unions like ResourceType. Import from the module that defines the configuration map to avoid indexing errors.

### Fixtures and test harnesses
- Centralize mock data in src/alp-data and lazy-load via dynamic import in test harness components.
- Keep fixtures aligned with enum values used in Selects.

### Event naming
- Use consistent Vue event patterns: update:modelValue, update:field, close, created, updated.

## Migration Checklist (for any new or refactored UI)
- [ ] Input/Textarea/Select use modelValue/update:modelValue
- [ ] Children never mutate props; emit updates instead
- [ ] Parent updates nested fields safely (no prop mutation)
- [ ] Avoid replacing large reactive objects; mutate or re-key
- [ ] Modal prop is isOpen; emits close
- [ ] Enum values in data match SelectItem values
- [ ] Read-only fields bind via modelValue
- [ ] Union types imported from their canonical module
- [ ] Mock data lives in src/alp-data and is lazy-loaded in harnesses
