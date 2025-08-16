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
  matterOutcomeDescription?: string
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
  // Optional fields to align with full time entry modal
  staffName?: string
  rate?: number
  billableType?: 'Billable' | 'NonBillable' | 'NonChargeable' | 'ProBono'
  gstType?: 'GST' | 'GST_EXPORT' | 'BAS_EXCLUDED'
  matterComponentDescription?: string
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
    return Boolean(
      e.date && 
      e.durationMinutes > 0 && 
      e.matterId && 
      e.matterOutcomeId && 
      e.matterComponentId && 
      e.staffName &&
      e.rate != null && e.rate > 0 &&
      (e.description || e.aiGeneratedDescription)
    )
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
      // Mark as confirmed and process to formal time entry system
      const confirmedEntry = { 
        ...entries.value[i], 
        status: 'confirmed' as const, 
        processedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      // Log the confirmation for demonstration
      console.log('Time entry confirmed and processed:', confirmedEntry)
      
      // Remove from draft entries list
      entries.value.splice(i, 1)
      
      // In a real system, this would send the entry to the formal time tracking system
      // await timeEntriesService.createTimeEntry(confirmedEntry)
    }
  }

  function bulkIgnore() {
    entries.value = entries.value.map(e => selectedIds.value.has(e.id) ? { ...e, status: 'ignored' } : e)
    clearSelection()
  }

  function createTentativeMerge(): DraftTimeEntry | null {
    const selectedEntries = entries.value.filter(e => selectedIds.value.has(e.id))
    
    if (selectedEntries.length < 2) {
      console.log('Need at least 2 entries to merge')
      return null
    }
    
    // Take the first entry as the base
    const baseEntry = selectedEntries[0]
    
    // Sum up all duration units
    const totalDuration = selectedEntries.reduce((sum, entry) => sum + (entry.durationMinutes || 0), 0)
    
    // Merge descriptions
    const descriptions = selectedEntries
      .map(entry => entry.description || entry.aiGeneratedDescription)
      .filter(desc => desc && desc.trim() !== '')
    
    const mergedDescription = descriptions.length > 0 
      ? descriptions.join('; ') + ' [To be processed by AI]'
      : '[To be processed by AI]'
    
    // Create merged entry
    const mergedEntry: DraftTimeEntry = {
      ...baseEntry,
      id: `merged-${Date.now()}`,
      durationMinutes: totalDuration,
      description: mergedDescription,
      isMergedEntry: true,
      mergedSourceIds: selectedEntries.map(e => e.id),
      mergedSourceMetadata: {
        originalEntries: selectedEntries.length,
        mergedAt: new Date().toISOString(),
        sourceTypes: [...new Set(selectedEntries.map(e => e.sourceType))]
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft'
    }
    
    console.log('Creating tentative merge for entries:', selectedEntries.map(e => e.id))
    
    return mergedEntry
  }

  function commitMerge(mergedEntry: DraftTimeEntry) {
    // Remove original entries and add the merged one
    const selectedEntryIds = mergedEntry.mergedSourceIds || []
    entries.value = entries.value.filter(e => !selectedEntryIds.includes(e.id))
    
    // Add/update merged entry
    const existingIndex = entries.value.findIndex(e => e.id === mergedEntry.id)
    if (existingIndex !== -1) {
      entries.value[existingIndex] = mergedEntry
    } else {
      entries.value.unshift(mergedEntry)
    }
    
    // Clear selection
    clearSelection()
    
    console.log('Merge committed, original entries removed')
  }

  function cancelMerge(mergedEntryId: string) {
    // Remove the tentative merged entry if it exists
    entries.value = entries.value.filter(e => e.id !== mergedEntryId)
    
    // Clear selection
    clearSelection()
    
    console.log('Merge cancelled, original entries restored')
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
    createTentativeMerge,
    commitMerge,
    cancelMerge,
    syncAll,
    syncSource,
    load,
  }
}


