import { ref, computed } from 'vue'

export interface DraftTimeEntry {
  id: string
  userId: string
  sourceType: 'Calendar' | 'Email' | 'Timer' | 'API'
  sourceId: string
  date: string
  durationMinutes: number
  description: string | null
  matterId: string | null
  matterComponentId: string | null
  matterOutcomeId: string | null
  status: 'draft' | 'ignored' | 'complete' | 'confirmed'
  aiGeneratedDescription: string | null
  originalContext: Record<string, any>
  isMergedEntry: boolean
  mergedSourceIds: string[]
  mergedSourceMetadata: Record<string, any>
  createdAt: string
  updatedAt: string
  processedAt: string | null
  isDeleted: boolean
}

async function loadMock(): Promise<DraftTimeEntry[]> {
  const mod: any = await import('@/alp-data/time-entries/draft-time-entries.json')
  return (mod.default || []) as DraftTimeEntry[]
}

export function useDraftTimeEntries() {
  const entries = ref<DraftTimeEntry[]>([])
  const selectedIds = ref<Set<string>>(new Set())

  const filtered = computed(() => entries.value)

  function toggleSelect(id: string) {
    if (selectedIds.value.has(id)) selectedIds.value.delete(id)
    else selectedIds.value.add(id)
  }

  function clearSelection() { selectedIds.value.clear() }

  function computeComplete(e: DraftTimeEntry): boolean {
    return Boolean(e.date && e.durationMinutes > 0 && e.matterId && (e.description || e.aiGeneratedDescription))
  }

  function markIgnored(id: string) {
    const i = entries.value.findIndex(e => e.id === id)
    if (i !== -1) entries.value[i] = { ...entries.value[i], status: 'ignored', updatedAt: new Date().toISOString() }
  }

  function updateEntry(updated: DraftTimeEntry) {
    const i = entries.value.findIndex(e => e.id === updated.id)
    if (i !== -1) entries.value[i] = { ...updated, status: computeComplete(updated) ? 'complete' : 'draft' }
  }

  function confirmEntry(id: string) {
    const i = entries.value.findIndex(e => e.id === id)
    if (i !== -1 && computeComplete(entries.value[i])) {
      entries.value.splice(i, 1)
    }
  }

  function bulkIgnore() {
    entries.value = entries.value.map(e => selectedIds.value.has(e.id) ? { ...e, status: 'ignored' } : e)
    clearSelection()
  }

  function tryMerge() {
    // Stub: In future, open merge preview. For now, no-op.
    console.log('Merge requested for', Array.from(selectedIds.value))
  }

  async function syncAll() { console.log('Sync all sources') }
  async function syncSource(source: DraftTimeEntry['sourceType']) { console.log('Sync', source) }

  async function load() { entries.value = await loadMock() }

  return {
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
  }
}


