<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div class="grid gap-4">
      <!-- Client Name -->
      <div class="space-y-2">
        <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Client Name *
        </label>
        <input
          v-model="formData.name"
          type="text"
          class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Enter client name"
          required
        />
      </div>

      <!-- Email -->
      <div class="space-y-2">
        <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Email *
        </label>
        <input
          v-model="formData.email"
          type="email"
          class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="client@email.com"
          required
        />
      </div>

      <!-- Phone -->
      <div class="space-y-2">
        <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Phone
        </label>
        <input
          v-model="formData.phone"
          type="tel"
          class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="+61 400 000 000"
        />
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
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Prospect">Prospect</option>
        </select>
      </div>

      <!-- Contact Person -->
      <div class="space-y-2">
        <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Contact Person
        </label>
        <input
          v-model="formData.contactPerson"
          type="text"
          class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Primary contact person"
        />
      </div>
    </div>

    <!-- Form Actions -->
    <div class="flex justify-end gap-2 pt-4">
      <Button type="button" variant="outline" @click="$emit('cancel')">
        Cancel
      </Button>
      <Button type="submit">
        {{ mode === 'create' ? 'Create Client' : 'Update Client' }}
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Button } from '@/lib/registry/new-york/ui/button'
import type { Client } from '@/types'

interface Props {
  client?: Client
  mode: 'create' | 'edit'
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'create'
})

const emit = defineEmits<{
  save: [client: Client]
  cancel: []
}>()

// Form data
const formData = ref<Partial<Client>>({
  id: 0,
  name: '',
  email: '',
  phone: '',
  status: 'Active',
  contactPerson: '',
  createdDate: new Date().toISOString().split('T')[0],
  totalBilled: 0
})

// Watch for prop changes
watch(() => props.client, (client) => {
  if (client) {
    formData.value = { ...client }
  }
}, { immediate: true })

const handleSubmit = () => {
  // Generate ID for new clients
  if (props.mode === 'create') {
    formData.value.id = Date.now()
    formData.value.createdDate = new Date().toISOString().split('T')[0]
  }

  // Emit the save event
  emit('save', formData.value as Client)
}
</script>
