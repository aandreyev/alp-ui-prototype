<template>
  <Dialog :open="open" @update:open="$emit('close')">
    <DialogContent class="max-w-lg">
      <DialogHeader>
        <DialogTitle>Edit Draft Time Entry</DialogTitle>
        <DialogDescription>Complete required fields to enable confirmation.</DialogDescription>
      </DialogHeader>

      <div class="space-y-3">
        <div>
          <label class="text-sm font-medium">Date/Time</label>
          <Input type="datetime-local" v-model="form.dateLocal" />
        </div>
        <div>
          <label class="text-sm font-medium">Duration (minutes)</label>
          <Input type="number" min="0" v-model.number="form.durationMinutes" />
        </div>
        <div>
          <label class="text-sm font-medium">Matter ID</label>
          <Input v-model="form.matterId" placeholder="e.g. 12345" />
        </div>
        <div>
          <label class="text-sm font-medium">Description</label>
          <Textarea v-model="form.description" rows="3" />
          <p v-if="!form.description && entry?.aiGeneratedDescription" class="text-xs text-muted-foreground mt-1">AI suggestion: {{ entry.aiGeneratedDescription }}</p>
        </div>
      </div>

      <DialogFooter>
        <div class="flex w-full justify-between items-center">
          <Button variant="outline" @click="$emit('close')">Cancel</Button>
          <Button :disabled="!isComplete" @click="save">Save</Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/lib/registry/new-york/ui/dialog'
import { Input } from '@/lib/registry/new-york/ui/input'
import { Textarea } from '@/lib/registry/new-york/ui/textarea'
import { Button } from '@/lib/registry/new-york/ui/button'
import type { DraftTimeEntry } from './composables/useDraftTimeEntries'

interface Props {
  open: boolean
  entry: DraftTimeEntry | null
}
const props = defineProps<Props>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'save', entry: DraftTimeEntry): void }>()

const form = reactive({
  id: '',
  dateLocal: '',
  durationMinutes: 0,
  matterId: '',
  description: ''
})

watch(() => props.entry, e => {
  if (!e) return
  form.id = e.id
  form.dateLocal = e.date ? new Date(e.date).toISOString().slice(0,16) : ''
  form.durationMinutes = e.durationMinutes || 0
  form.matterId = e.matterId || ''
  form.description = e.description || ''
}, { immediate: true })

const isComplete = computed(() => {
  return Boolean(form.dateLocal && form.durationMinutes > 0 && form.matterId && (form.description || props.entry?.aiGeneratedDescription))
})

function save() {
  if (!props.entry) return
  const updated: DraftTimeEntry = {
    ...props.entry,
    date: new Date(form.dateLocal).toISOString(),
    durationMinutes: form.durationMinutes,
    matterId: form.matterId,
    description: form.description
  }
  emit('save', updated)
}
</script>


