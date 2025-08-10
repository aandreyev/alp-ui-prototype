<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <AlertTriangle class="w-5 h-5 text-red-600" />
          {{ title || 'Are you sure?' }}
        </DialogTitle>
        <DialogDescription>
          {{ description || 'This action cannot be undone.' }}
        </DialogDescription>
      </DialogHeader>

      <div class="mt-2">
        <slot />
      </div>

      <DialogFooter>
        <div class="flex items-center justify-end gap-2 w-full">
          <Button variant="outline" @click="onCancel">{{ cancelText || 'Cancel' }}</Button>
          <Button :class="'bg-red-600 text-white hover:bg-red-700'" @click="onConfirm">
            <Trash2 class="w-4 h-4 mr-2" />
            {{ confirmText || 'Delete' }}
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  </template>

<script setup lang="ts">
import { Button } from '@/lib/registry/new-york/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/lib/registry/new-york/ui/dialog'
import { AlertTriangle, Trash2 } from 'lucide-vue-next'

interface Props {
  open: boolean
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
}
const props = defineProps<Props>()
const emit = defineEmits<{
  'update:open': [open: boolean]
  confirm: []
  cancel: []
}>()

const onCancel = () => {
  emit('cancel')
  emit('update:open', false)
}
const onConfirm = () => {
  emit('confirm')
  emit('update:open', false)
}
</script>

<style scoped>
</style>
