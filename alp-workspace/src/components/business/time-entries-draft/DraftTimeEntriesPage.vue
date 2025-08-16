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

    <!-- Active Entries -->
    <div class="border rounded-lg overflow-hidden">
      <div class="flex items-center justify-between p-3 border-b">
        <div class="text-sm text-muted-foreground">{{ selectedCount }} selected</div>
        <div class="flex items-center gap-2">
          <Button variant="outline" size="sm" :disabled="selectedCount===0" @click="bulkIgnore">Bulk Ignore</Button>
          <Button variant="outline" size="sm" :disabled="selectedCount<2" @click="handleMergeSelected">Merge Selected</Button>
        </div>
      </div>
      <div class="divide-y">
        <div v-for="e in activeEntries" :key="e.id" class="p-3 flex items-center gap-3">
          <Checkbox :checked="selectedIds.has(e.id)" @update:checked="toggleSelect(e.id)" />
          <div class="w-28 text-sm">{{ formatDate(e.date) }}</div>
          <div class="w-24 text-xs rounded px-2 py-0.5 bg-muted text-muted-foreground">{{ e.sourceType }}</div>
          <div class="w-20 text-sm">{{ e.durationMinutes }}u</div>
          <div class="w-24 text-sm">{{ e.matterId || '—' }}</div>
          <div class="flex-1 text-sm truncate">{{ e.description || e.aiGeneratedDescription || '—' }}</div>
          <div class="w-24">
            <span v-if="computeComplete(e)" class="text-xs text-green-600">Complete</span>
            <span v-else class="text-xs text-amber-600">Draft</span>
          </div>
          <div class="flex items-center gap-1">
            <Button variant="outline" size="sm" @click.stop="openEdit(e)">Edit</Button>
            <Button variant="outline" size="sm" @click.stop="markIgnored(e.id)">Ignore</Button>
            <Button v-if="computeComplete(e)" size="sm" @click.stop="confirmFromList(e)">Confirm</Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Ignored Entries Section -->
    <div v-if="ignoredEntries.length > 0" class="border rounded-lg overflow-hidden bg-gray-50">
      <div class="flex items-center justify-between p-3 border-b bg-gray-100">
        <div class="text-sm font-medium text-gray-600">Ignored Entries ({{ ignoredEntries.length }})</div>
      </div>
      <div class="divide-y">
        <div v-for="e in ignoredEntries" :key="e.id" class="p-3 flex items-center gap-3 opacity-60">
          <div class="w-28 text-sm">{{ formatDate(e.date) }}</div>
          <div class="w-24 text-xs rounded px-2 py-0.5 bg-gray-300 text-gray-600">{{ e.sourceType }}</div>
          <div class="w-20 text-sm">{{ e.durationMinutes }}u</div>
          <div class="w-24 text-sm">{{ e.matterId || '—' }}</div>
          <div class="flex-1 text-sm truncate">{{ e.description || e.aiGeneratedDescription || '—' }}</div>
          <div class="w-24">
            <span class="text-xs text-gray-500">Ignored</span>
          </div>
          <div class="flex items-center gap-1">
            <Button variant="outline" size="sm" @click.stop="unignoreEntry(e.id)">Edit</Button>
          </div>
        </div>
      </div>
    </div>

    <DraftTimeEntryModal 
      :open="modalOpen" 
      :entry="activeEntry" 
      @close="onModalClose" 
      @save="onSave" 
      @ignore="onIgnore"
      @confirm="onConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { Button } from '@/lib/registry/new-york/ui/button'
import { Checkbox } from '@/lib/registry/new-york/ui/checkbox'
import DraftTimeEntryModal from './DraftTimeEntryModal.vue'
import { useDraftTimeEntries, type DraftTimeEntry } from './composables/useDraftTimeEntries'

const {
  entries,
  selectedIds,
  toggleSelect,
  clearSelection,
  computeComplete,
  markIgnored,
  updateEntry,
  confirmEntry,
  bulkIgnore,
  createTentativeMerge,
  commitMerge,
  cancelMerge,
  syncAll,
  syncSource,
  load,
} = useDraftTimeEntries()

onMounted(load)

const selectedCount = computed(() => selectedIds.value.size)
const currentTentativeMerge = ref<string | null>(null) // Track tentative merge ID

// Separate active and ignored entries
const activeEntries = computed(() => {
  let filtered = entries.value.filter(e => e.status !== 'ignored')
  
  // If we have a tentative merge, hide the original entries that are being merged
  if (currentTentativeMerge.value) {
    const mergedEntry = entries.value.find(e => e.id === currentTentativeMerge.value)
    if (mergedEntry?.mergedSourceIds) {
      filtered = filtered.filter(e => !mergedEntry.mergedSourceIds!.includes(e.id))
    }
  }
  
  return filtered
})
const ignoredEntries = computed(() => entries.value.filter(e => e.status === 'ignored'))

const modalOpen = ref(false)
const activeEntry = ref<DraftTimeEntry | null>(null)

function openEdit(e: DraftTimeEntry) {
  activeEntry.value = e
  modalOpen.value = true
}

function onModalClose() {
  // If this was a tentative merge and it's being closed without action, cancel it
  if (currentTentativeMerge.value && activeEntry.value?.id === currentTentativeMerge.value) {
    cancelMerge(currentTentativeMerge.value)
    currentTentativeMerge.value = null
  }
  modalOpen.value = false
}

function onSave(e: DraftTimeEntry) {
  // If this is a tentative merge, commit it
  if (currentTentativeMerge.value === e.id) {
    commitMerge(e)
    currentTentativeMerge.value = null
  } else {
    updateEntry(e)
  }
  modalOpen.value = false
}

function onIgnore(entryId: string) {
  // If this is a tentative merge, cancel it and restore originals
  if (currentTentativeMerge.value === entryId) {
    cancelMerge(entryId)
    currentTentativeMerge.value = null
  } else {
    markIgnored(entryId)
  }
  modalOpen.value = false
}

function onConfirm(entry: DraftTimeEntry) {
  console.log(`Confirming time entry: ${entry.description || entry.aiGeneratedDescription} (${entry.durationMinutes} units)`)
  
  // If this is a tentative merge, commit it first
  if (currentTentativeMerge.value === entry.id) {
    commitMerge(entry)
    currentTentativeMerge.value = null
    // Now confirm the committed entry
    confirmEntry(entry.id)
  } else {
    // First update the entry with the complete data, then confirm it
    updateEntry(entry)
    confirmEntry(entry.id)
  }
  modalOpen.value = false
}

function confirmFromList(entry: DraftTimeEntry) {
  console.log(`Confirming time entry from list: ${entry.description || entry.aiGeneratedDescription} (${entry.durationMinutes} units)`)
  confirmEntry(entry.id)
}

function handleMergeSelected() {
  const mergedEntry = createTentativeMerge()
  if (mergedEntry) {
    // Track this as a tentative merge
    currentTentativeMerge.value = mergedEntry.id
    
    // Add the tentative merged entry to the entries list (but keep originals)
    entries.value.unshift(mergedEntry)
    
    // Open the modal with the merged entry for editing
    activeEntry.value = mergedEntry
    modalOpen.value = true
  }
}

function unignoreEntry(entryId: string) {
  const i = entries.value.findIndex(e => e.id === entryId)
  if (i !== -1) {
    entries.value[i] = { 
      ...entries.value[i], 
      status: 'draft', 
      updatedAt: new Date().toISOString() 
    }
    // Open the entry for editing immediately
    openEdit(entries.value[i])
  }
}
function formatDate(iso?: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  return new Intl.DateTimeFormat('en-AU', { dateStyle: 'medium', timeStyle: 'short' }).format(d)
}
</script>


