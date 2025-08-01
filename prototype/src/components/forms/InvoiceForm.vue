<template>
  <div class="space-y-4">
    <p class="text-sm text-muted-foreground">Invoice form placeholder - to be implemented</p>
    <div class="flex justify-end gap-2">
      <Button variant="outline" @click="$emit('cancel')">Cancel</Button>
      <Button @click="handleSave">Save</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/lib/registry/new-york/ui/button'
import type { Invoice } from '@/types'

defineProps<{
  invoice?: Invoice
  mode: 'create' | 'edit'
}>()

const emit = defineEmits<{
  save: [invoice: Invoice]
  cancel: []
}>()

const handleSave = () => {
  emit('save', { id: Date.now() } as Invoice)
}
</script>
