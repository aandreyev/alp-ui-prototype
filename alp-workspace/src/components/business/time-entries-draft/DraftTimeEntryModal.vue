<template>
  <Dialog :open="open" @update:open="$emit('close')">
    <DialogContent class="max-w-lg">
      <DialogHeader>
        <DialogTitle>Edit Draft Time Entry</DialogTitle>
        <DialogDescription>Complete required fields to enable confirmation.</DialogDescription>
      </DialogHeader>

      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-sm font-medium">Date/Time</label>
            <Input type="datetime-local" v-model="form.dateLocal" />
          </div>
          <div>
            <label class="text-sm font-medium">Duration (minutes)</label>
            <Input type="number" min="0" v-model.number="form.durationMinutes" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-sm font-medium">Matter ID</label>
            <Input v-model="form.matterId" placeholder="e.g. 12345" />
          </div>
          <div>
            <label class="text-sm font-medium">Staff</label>
            <Input v-model="form.staffName" placeholder="Staff name" />
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="text-sm font-medium">Rate (Hourly)</label>
            <Input type="number" min="0" v-model.number="form.rate" />
          </div>
          <div>
            <label class="text-sm font-medium">Billable</label>
            <select v-model="form.billableType" class="border rounded px-2 h-9 w-full">
              <option value="Billable">Billable</option>
              <option value="NonBillable">Non Billable</option>
              <option value="NonChargeable">Non Chargeable</option>
              <option value="ProBono">Pro Bono</option>
            </select>
          </div>
          <div>
            <label class="text-sm font-medium">GST Type</label>
            <select v-model="form.gstType" class="border rounded px-2 h-9 w-full">
              <option value="GST">GST (10%)</option>
              <option value="GST_EXPORT">GST Export (0%)</option>
              <option value="BAS_EXCLUDED">BAS Excluded (0%)</option>
            </select>
          </div>
        </div>

        <div>
          <label class="text-sm font-medium">Description</label>
          <Textarea v-model="form.description" rows="4" />
          <p v-if="!form.description && entry?.aiGeneratedDescription" class="text-xs text-muted-foreground mt-1">AI suggestion: {{ entry.aiGeneratedDescription }}</p>
        </div>

        <div class="grid grid-cols-1 gap-3">
          <div>
            <label class="text-sm font-medium">Outcome (description)</label>
            <Textarea v-model="form.matterOutcomeDescription" rows="2" placeholder="Outcome description this entry relates to" />
          </div>
          <div>
            <label class="text-sm font-medium">Component (description)</label>
            <Textarea v-model="form.matterComponentDescription" rows="2" placeholder="Component description this entry relates to" />
          </div>
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
  description: '',
  staffName: '',
  rate: undefined as number | undefined,
  billableType: 'Billable' as 'Billable' | 'NonBillable' | 'NonChargeable' | 'ProBono',
  gstType: 'GST' as 'GST' | 'GST_EXPORT' | 'BAS_EXCLUDED'
})

watch(() => props.entry, e => {
  if (!e) return
  form.id = e.id
  form.dateLocal = e.date ? new Date(e.date).toISOString().slice(0,16) : ''
  form.durationMinutes = e.durationMinutes || 0
  form.matterId = e.matterId || ''
  form.description = e.description || ''
  form.staffName = e.staffName || ''
  form.rate = e.rate
  form.billableType = (e.billableType as any) || 'Billable'
  form.gstType = (e.gstType as any) || 'GST'
  ;(form as any).matterOutcomeDescription = e.matterOutcomeDescription || ''
  ;(form as any).matterComponentDescription = e.matterComponentDescription || ''
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
    description: form.description,
    staffName: form.staffName,
    rate: form.rate,
    billableType: form.billableType,
    gstType: form.gstType,
    matterOutcomeDescription: (form as any).matterOutcomeDescription || undefined,
    matterComponentDescription: (form as any).matterComponentDescription || undefined
  }
  emit('save', updated)
}
</script>


