<template>
  <div class="p-6 space-y-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <h1 class="text-2xl font-bold">Draft Time Entries</h1>
        <span class="text-xs rounded bg-muted px-2 py-0.5 text-muted-foreground">Prototype</span>
      </div>
      <div class="flex items-center gap-2">
        <Button variant="outline" size="sm" @click="syncAll">Sync All</Button>
        <Button variant="outline" size="sm" @click="() => syncSource('Calendar')">Calendar</Button>
        <Button variant="outline" size="sm" @click="() => syncSource('Email')">Email</Button>
        <Button variant="outline" size="sm" @click="() => syncSource('Timer')">Timer</Button>
        <Button variant="outline" size="sm" @click="() => syncSource('API')">API</Button>
      </div>
    </div>

    <div class="border rounded-lg overflow-hidden">
      <div class="flex items-center justify-between p-3 border-b">
        <div class="text-sm text-muted-foreground">{{ selectedCount }} selected</div>
        <div class="flex items-center gap-2">
          <Button variant="outline" size="sm" :disabled="selectedCount===0" @click="bulkIgnore">Bulk Ignore</Button>
          <Button variant="outline" size="sm" :disabled="selectedCount<2" @click="tryMerge">Merge Selected</Button>
        </div>
      </div>
      <div class="divide-y">
        <div v-for="e in filtered" :key="e.id" class="p-3 flex items-center gap-3">
          <Checkbox :checked="selectedIds.has(e.id)" @update:checked="toggleSelect(e.id)" />
          <div class="w-28 text-sm">{{ formatDate(e.date) }}</div>
          <div class="w-24 text-xs rounded px-2 py-0.5 bg-muted text-muted-foreground">{{ e.sourceType }}</div>
          <div class="w-20 text-sm">{{ e.durationMinutes }}m</div>
          <div class="w-24 text-sm">{{ e.matterId || '—' }}</div>
          <div class="flex-1 text-sm truncate">{{ e.description || e.aiGeneratedDescription || '—' }}</div>
          <div class="w-24">
            <span v-if="e.status==='ignored'" class="text-xs text-muted-foreground">Ignored</span>
            <span v-else-if="computeComplete(e)" class="text-xs text-green-600">Complete</span>
            <span v-else class="text-xs text-amber-600">Draft</span>
          </div>
          <div class="flex items-center gap-1">
            <Button variant="outline" size="sm" @click.stop="openEdit(e)">Edit</Button>
            <Button variant="outline" size="sm" @click.stop="confirmIgnore(e)">Ignore</Button>
            <Button size="sm" :disabled="!computeComplete(e)" @click.stop="confirmConfirm(e)">Confirm</Button>
          </div>
        </div>
      </div>
    </div>

    <DraftTimeEntryModal :open="modalOpen" :entry="activeEntry" @close="modalOpen=false" @save="onSave" />

    <ConfirmDialog v-model:open="confirmState.open" :description="confirmState.desc" title="Confirm Action" confirmText="Confirm" cancelText="Cancel" @confirm="performConfirmAction" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { Button } from '@/lib/registry/new-york/ui/button'
import { Checkbox } from '@/lib/registry/new-york/ui/checkbox'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import DraftTimeEntryModal from './DraftTimeEntryModal.vue'
import { useDraftTimeEntries, type DraftTimeEntry } from './composables/useDraftTimeEntries'

const {
  entries,
  filtered,
  selectedIds,
  toggleSelect,
  clearSelection,
  computeComplete,
  markIgnored,
  updateEntry,
  confirmEntry,
  bulkIgnore,
  tryMerge,
  syncAll,
  syncSource,
  load,
} = useDraftTimeEntries()

onMounted(load)

const selectedCount = computed(() => selectedIds.value.size)

const modalOpen = ref(false)
const activeEntry = ref<DraftTimeEntry | null>(null)

function openEdit(e: DraftTimeEntry) {
  activeEntry.value = e
  modalOpen.value = true
}
function onSave(e: DraftTimeEntry) {
  updateEntry(e)
  modalOpen.value = false
}

const confirmState = ref<{ open: boolean; desc: string; action: 'ignore'|'confirm'|null; id: string|null }>({ open: false, desc: '', action: null, id: null })
function confirmIgnore(e: DraftTimeEntry) {
  confirmState.value = { open: true, desc: `Ignore draft entry from ${e.sourceType}?`, action: 'ignore', id: e.id }
}
function confirmConfirm(e: DraftTimeEntry) {
  confirmState.value = { open: true, desc: `Confirm this entry to formal time entry?`, action: 'confirm', id: e.id }
}
function performConfirmAction() {
  const a = confirmState.value
  if (!a.id || !a.action) return
  if (a.action === 'ignore') markIgnored(a.id)
  if (a.action === 'confirm') confirmEntry(a.id)
  confirmState.value.open = false
}

function formatDate(iso?: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  return new Intl.DateTimeFormat('en-AU', { dateStyle: 'medium', timeStyle: 'short' }).format(d)
}
</script>


