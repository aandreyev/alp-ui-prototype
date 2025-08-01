<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div class="grid gap-4">
      <!-- Matter Name -->
      <div class="space-y-2">
        <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Matter Name *
        </label>
        <input
          v-model="formData.name"
          type="text"
          class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Enter matter name"
          required
        />
      </div>

      <!-- Client Selection -->
      <div class="space-y-2">
        <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Client *
        </label>
        <select
          v-model="formData.client.name"
          class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          required
        >
          <option value="">Select a client</option>
          <option value="John Smith">John Smith</option>
          <option value="Robert & Mary Wilson">Robert & Mary Wilson</option>
          <option value="ABC Corporation">ABC Corporation</option>
          <option value="XYZ Legal Services">XYZ Legal Services</option>
        </select>
      </div>

      <!-- Status -->
      <div class="space-y-2">
        <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Status
        </label>
        <select
          v-model="formData.status"
          class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="Open">Open</option>
          <option value="On Hold">On Hold</option>
          <option value="Closed">Closed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <!-- Priority -->
      <div class="space-y-2">
        <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Priority
        </label>
        <select
          v-model="formData.priority"
          class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Urgent">Urgent</option>
        </select>
      </div>

      <!-- Coordinator -->
      <div class="space-y-2">
        <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Coordinator
        </label>
        <select
          v-model="formData.coordinator.name"
          class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="Sarah Johnson">Sarah Johnson</option>
          <option value="Michael Chen">Michael Chen</option>
          <option value="Emma Thompson">Emma Thompson</option>
          <option value="David Wilson">David Wilson</option>
        </select>
      </div>

      <!-- Budget -->
      <div class="space-y-2">
        <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Estimated Budget
        </label>
        <input
          v-model.number="formData.estimatedBudget"
          type="number"
          min="0"
          step="100"
          class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="0"
        />
      </div>

      <!-- Due Date -->
      <div class="space-y-2">
        <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Due Date
        </label>
        <input
          v-model="formData.dueDate"
          type="date"
          class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
    </div>

    <!-- Form Actions -->
    <div class="flex justify-end gap-2 pt-4">
      <Button type="button" variant="outline" @click="$emit('cancel')">
        Cancel
      </Button>
      <Button type="submit">
        {{ mode === 'create' ? 'Create Matter' : 'Update Matter' }}
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Button } from '@/lib/registry/new-york/ui/button'
import type { Matter } from '@/types'

interface Props {
  matter?: Matter
  mode: 'create' | 'edit'
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'create'
})

const emit = defineEmits<{
  save: [matter: Matter]
  cancel: []
}>()

// Form data
const formData = ref<Partial<Matter>>({
  id: 0,
  name: '',
  client: { name: '', email: '' },
  status: 'Open',
  priority: 'Medium',
  coordinator: { name: 'Sarah Johnson', initials: 'SJ', email: 'sarah@alp.com' },
  progress: { completed: 0, total: 1 },
  estimatedBudget: 0,
  actualCosts: 0,
  dueDate: '',
  offerings: []
})

// Watch for prop changes
watch(() => props.matter, (matter) => {
  if (matter) {
    formData.value = { ...matter }
  }
}, { immediate: true })

// Update coordinator initials when name changes
watch(() => formData.value.coordinator?.name, (name) => {
  if (name && formData.value.coordinator) {
    const names = name.split(' ')
    const initials = names.map(n => n.charAt(0)).join('').toUpperCase()
    formData.value.coordinator.initials = initials
    formData.value.coordinator.email = `${name.toLowerCase().replace(' ', '.')}@alp.com`
  }
})

const handleSubmit = () => {
  // Generate ID for new matters
  if (props.mode === 'create') {
    formData.value.id = Date.now()
  }

  // Set default client email if not provided
  if (formData.value.client && !formData.value.client.email) {
    formData.value.client.email = `${formData.value.client.name.toLowerCase().replace(' ', '.')}@email.com`
  }

  // Emit the save event
  emit('save', formData.value as Matter)
}
</script>
