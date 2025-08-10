# Vue 3 Data Binding Best Practices

## Overview
This document defines ALP’s standard patterns for data binding in Vue 3, with a focus on complex forms and parent-child component relationships. It’s tailored to our UI kit components (Input, Textarea, Select, etc.).

## Core Principles

### 1. Single Source of Truth
- Parent components own and manage the data
- Child components receive data via props
- Child components emit events to request changes
- Never mutate props directly in child components

### 2. Immutability
- Props are read-only in children
- Create local copies only when necessary for internal state
- Emit events with new values rather than mutating existing ones
- Avoid replacing reactive objects passed to many children; mutate keys instead (details below)

### 3. Clear Contracts
- Define explicit TypeScript interfaces for props and emits
- Use descriptive event names that indicate the action
- Document expected data shapes

## Standard Patterns

### Pattern 1: Simple v-model with Computed Properties

**Parent Component:**
```vue
<template>
  <ChildComponent v-model="parentData.field" />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const parentData = ref({
  field: 'value'
})
</script>
```

**Child Component:**
```vue
<template>
  <input v-model="localValue" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const localValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>
```

### Pattern 2: Complex Object with Field Updates (parent owns object)

**Parent Component:**
```vue
<template>
  <ChildComponent 
    :data="formData"
    @update:field="handleFieldUpdate"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface FormData {
  name: string
  description: string
  metadata: {
    tags: string[]
  }
}

const formData = ref<FormData>({
  name: '',
  description: '',
  metadata: {
    tags: []
  }
})

const handleFieldUpdate = (field: string, value: any) => {
  // Handle nested fields
  const keys = field.split('.')
  let target: any = formData.value
  
  for (let i = 0; i < keys.length - 1; i++) {
    if (!target[keys[i]]) {
      target[keys[i]] = {}
    }
    target = target[keys[i]]
  }
  
  target[keys[keys.length - 1]] = value
}
</script>
```

**Child Component (use modelValue/update:modelValue with our Input/Textarea):**
```vue
<template>
  <div>
    <Input 
      :modelValue="data.name ?? ''"
      @update:modelValue="$emit('update:field', 'name', $event)"
    />
    <Textarea
      :modelValue="data.description ?? ''"
      @update:modelValue="$emit('update:field', 'description', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { Input } from '@/lib/registry/new-york/ui/input'
import { Textarea } from '@/lib/registry/new-york/ui/textarea'
interface Props {
  data: {
    name: string
    description: string
    metadata: {
      tags: string[]
    }
  }
}

interface Emits {
  (e: 'update:field', field: string, value: any): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>
```

### Pattern 3: Multiple v-models (Vue 3.4+)

**Parent Component:**
```vue
<template>
  <ChildComponent 
    v-model:name="formData.name"
    v-model:description="formData.description"
    v-model:tags="formData.tags"
  />
</template>
```

**Child Component:**
```vue
<script setup lang="ts">
interface Props {
  name: string
  description: string
  tags: string[]
}

interface Emits {
  (e: 'update:name', value: string): void
  (e: 'update:description', value: string): void
  (e: 'update:tags', value: string[]): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>
```

## Form Component Best Practices

### 1. Input/Textarea Components (ALP UI Kit)
```vue
<!-- ❌ Don’t pass plain value to our Input/Textarea; they use modelValue -->
<Input :value="value" /> <!-- Won’t display -->

<!-- ✅ Do this: use modelValue / update:modelValue -->
<Input 
  :modelValue="model"
  @update:modelValue="val => emit('update:modelValue', val)"
/>

<!-- ✅ Using v-model sugar in child wrappers is fine too -->
<Input v-model="localValue" />
<script setup lang="ts">
import { computed } from 'vue'
import { Input } from '@/lib/registry/new-york/ui/input'
const props = defineProps<{ modelValue?: string | number }>()
const emit = defineEmits<{ (e:'update:modelValue', v:string|number):void }>()
const localValue = computed({ get: () => props.modelValue ?? '', set: v => emit('update:modelValue', v) })
</script>
```

### 2. Select Components (Radix Vue based)
```vue
<!-- ❌ Avoid value/update:value in our kit -->
<Select :value="type" @update:value="..." />

<!-- ✅ Use modelValue / update:modelValue (works with our wrapper) -->
<Select 
  :modelValue="data.type ?? 'other'"
  @update:modelValue="$emit('update:field', 'type', $event)"
>
  <SelectTrigger><SelectValue /></SelectTrigger>
  <SelectContent>
    <SelectItem value="one">One</SelectItem>
    <SelectItem value="two">Two</SelectItem>
  </SelectContent>
</Select>
```

### 3. Complex Components (Tags, File Upload, etc.)
```vue
<!-- ✅ Good: If component supports modelValue -->
<TagInput 
  :modelValue="data.tags || []"
  @update:modelValue="$emit('update:field', 'tags', $event)"
/>

<!-- ✅ Legacy components may use value/update:value; prefer migrating when touched -->
<LegacyTagInput 
  :value="data.tags || []"
  @update:value="$emit('update:field', 'tags', $event)"
/>
```

### 4. Read-only display fields
Even for read-only inputs, bind with modelValue so values render:
```vue
<Input :modelValue="formatDate(resource.updatedAt)" readonly />
```

## TypeScript Best Practices

### 1. Define Clear Interfaces
```typescript
// ✅ Good: Explicit interface definition
interface ResourceFormData {
  id?: string
  name: string
  description?: string
  type: ResourceType
  url?: string
  metadata: {
    tags: string[]
    author?: string
    version?: string
  }
}

// ✅ Good: Explicit emit interface
interface ResourceFormEmits {
  (e: 'update:field', field: string, value: any): void
  (e: 'save', data: ResourceFormData): void
  (e: 'cancel'): void
}
```

### 2. Use Generic Types When Appropriate
```typescript
// ✅ Good: Reusable generic form component
interface FormFieldProps<T> {
  modelValue: T
  field: string
  label: string
  required?: boolean
}

interface FormFieldEmits<T> {
  (e: 'update:modelValue', value: T): void
}
```

## Common Pitfalls to Avoid

### 1. ❌ Mutating Props
```vue
<!-- Never do this -->
<script setup>
props.data.name = 'New Name' // ❌ Direct mutation
</script>
```

### 2. ❌ Two-Way Binding to Props
```vue
<!-- Avoid this pattern -->
<input v-model="props.data.name" /> <!-- ❌ Will cause warnings -->
```

### 3. ❌ Inconsistent Event Names
```vue
<!-- Bad: Inconsistent naming -->
@updateField="..." 
@field-change="..."
@onFieldUpdate="..."

<!-- Good: Consistent pattern -->
@update:field="..."
@update:name="..."
@update:description="..."
```

### 4. ❌ Missing Null Checks
### 5. ❌ Replacing reactive objects passed to many children
```ts
// Avoid: replacing the whole object breaks child bindings
formData.value = { ...newValues } // ❌

// Do: mutate keys or Object.assign into existing ref
Object.assign(formData.value, newValues) // ✅

// If you must replace, re-key the subtree to force remount
<DialogContent :key="`${mode}-${resource?.id ?? 'new'}`" />
```

### 6. ❌ Using value on ALP UI kit components
Our Input/Textarea/Select expect modelValue. Passing value won’t display.

```vue
<!-- Bad: No null safety -->
<input :value="props.data.nested.field" />

<!-- Good: Null-safe access -->
<input :value="props.data?.nested?.field || ''" />
```

## Implementation Checklist

When implementing parent-child data binding:

- [ ] Parent owns all data in reactive refs
- [ ] Child components receive data via props
- [ ] Child components emit events for all changes
- [ ] Props are never mutated directly
- [ ] For ALP UI kit components, always bind with modelValue / update:modelValue
- [ ] Don’t replace reactive objects used by many children; mutate or re-key
- [ ] TypeScript interfaces are defined for props and emits
- [ ] Null/undefined values are handled gracefully
- [ ] Event names follow consistent patterns
- [ ] Complex nested updates are handled properly
- [ ] Form validation is managed at appropriate level
- [ ] Loading and error states are properly communicated

## Testing Data Binding

### 1. Unit Tests Should Verify:
- Props are correctly passed to child components
- Events are emitted with correct payloads
- Parent state updates when child emits events
- No prop mutations occur

### 2. Integration Tests Should Verify:
- Form data flows correctly through component tree
- User interactions trigger appropriate updates
- Validation works across parent-child boundaries
- Save/cancel operations work correctly

## Migration Guide

### From Anti-Pattern to Best Practice

**Before (Anti-Pattern):**
```vue
<!-- Parent -->
<ChildComponent :model-value="formData" @update:field="updateField" />

<!-- Child -->
<Input :value="modelValue.url" @input="updateField('url', $event.target.value)" />
```

**After (Best Practice):**
```vue
<!-- Parent -->
<ChildComponent :data="formData" @update:field="handleFieldUpdate" />

<!-- Child -->
<Input :modelValue="data.url ?? ''" @update:modelValue="$emit('update:field', 'url', $event)" />
```

## Notes for reviewers
- If a field doesn’t prefill, check for modelValue vs value mismatch
- For dropdowns, ensure Select uses modelValue/update:modelValue
- Read-only Inputs still require modelValue to display
- When switching between create/edit or different items, prefer mutating the existing form object or re-key the container to refresh children

## Summary

Following these patterns ensures:
1. **Predictable data flow** - Always parent → child → parent
2. **Maintainable code** - Clear contracts and consistent patterns
3. **Type safety** - Full TypeScript support
4. **Testability** - Easy to unit test components in isolation
5. **Debugging** - Clear data flow makes debugging easier
6. **Performance** - Avoids unnecessary re-renders and watchers
