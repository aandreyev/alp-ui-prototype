<template>
  <div class="space-y-4">
    <!-- Toolbar -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <strong class="text-lg">{{ typeLabel }} Management</strong>
        <span class="text-xs rounded bg-muted px-2 py-0.5 text-muted-foreground">{{ resourceType.toUpperCase() }}</span>
        <span class="text-sm text-muted-foreground">{{ filteredResources.length }} items</span>
      </div>
      <div class="flex items-center gap-2">
        <!-- Search placeholder -->
        <div class="hidden md:block">
          <Input :modelValue="search" @update:modelValue="search = String($event)" placeholder="Search by name..." class="h-8 w-56" />
        </div>
        <!-- Tag filter placeholder -->
        <div class="hidden md:block text-xs text-muted-foreground">Tag filter (TBD)</div>
        <Button size="sm" @click="openCreate()">
          <span class="mr-2">+</span> New {{ typeLabelSingular }}
        </Button>
      </div>
    </div>
    <!-- List -->
    <div class="border rounded-lg divide-y">
      <div
        v-for="r in filteredResources"
        :key="r.id"
        class="p-4 flex items-center justify-between hover:bg-muted/40 cursor-pointer"
        @click="openEdit(r)"
      >
        <div class="min-w-0">
          <div class="font-medium truncate">{{ r.name }}</div>
          <div class="text-xs text-muted-foreground truncate">
            {{ r.description || '\u00A0' }}
          </div>
          <div v-if="r.metadata?.tags?.length" class="flex gap-1 mt-1">
            <span v-for="t in r.metadata.tags.slice(0,3)" :key="t" class="bg-muted px-1 rounded text-xs">{{ t }}</span>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <div class="text-xs text-muted-foreground">
            {{ formatDate(r.updatedAt) }}
          </div>
          <div class="flex items-center gap-1">
            <Button variant="outline" size="sm" @click.stop="preview(r)">Preview</Button>
            <Button variant="outline" size="sm" @click.stop="openEdit(r)">Details</Button>
            <Button variant="destructive" size="sm" @click.stop="remove(r)">Delete</Button>
          </div>
        </div>
      </div>
      <div v-if="!filteredResources.length" class="p-8 text-center text-muted-foreground text-sm">
        No {{ typeLabel.toLowerCase() }} found.
      </div>
    </div>

    <!-- Modal -->
    <SimplifiedResourceModal
      :is-open="modal.isOpen"
      :mode="modal.mode"
  :resource-type="modalResourceType"
      :resource="modal.resource"
      @close="modal.isOpen = false"
      @created="onCreated"
      @updated="onUpdated"
    />

    <!-- Delete confirmation dialog -->
    <ConfirmDialog
      v-model:open="confirmState.open"
      title="Remove resource"
      :description="confirmDescription"
      confirmText="Remove"
      cancelText="Cancel"
      @confirm="performRemove"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Button } from '@/lib/registry/new-york/ui/button'
import { Input } from '@/lib/registry/new-york/ui/input'
import { loadAllResources } from '@/alp-data/resources/loadAllResources'
import type { Resource, ResourceType } from '@/alp-types/resources.types'
import SimplifiedResourceModal from '@/components/business/resources-add-edit/SimplifiedResourceModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'

// Accept resourceType from parent (use global canonical type)
const props = defineProps<{ resourceType: ResourceType }>()

const allResources = ref<Resource[]>([])
const search = ref('')
const filteredResources = computed(() => {
  const term = search.value.trim().toLowerCase()
  const filterType: ResourceType = (props.resourceType === 'template' ? 'document' : props.resourceType)
  return allResources.value
    .filter(r => r.type === filterType)
    .filter(r => !term || r.name.toLowerCase().includes(term) || (r.description || '').toLowerCase().includes(term))
})

const modal = ref<{ isOpen: boolean; mode: 'create'|'edit'; resource: Resource|null }>({
  isOpen: false,
  mode: 'create',
  resource: null,
})

// Labels
const typeLabel = computed(() => {
  const map: Record<ResourceType, string> = {
    document: 'Documents',
    url: 'URLs',
    form: 'Forms',
    emailTemplate: 'Email Templates',
    video: 'Videos',
    vdFolder: 'SharePoint Folders',
    template: 'Templates'
  }
  return map[props.resourceType]
})
const typeLabelSingular = computed(() => typeLabel.value.replace(/s$/,'').replace('URLs','URL'))

type ModalResourceType = Exclude<ResourceType, 'template'>
const modalResourceType = computed<ModalResourceType>(() => (props.resourceType === 'template' ? 'document' : props.resourceType) as ModalResourceType)

// Load initial data (fixture for prototype)
async function loadData() {
  const data = await loadAllResources<Resource>()
  allResources.value = data.map(r => ({ ...r }))
}

onMounted(loadData)
watch(() => props.resourceType, () => { /* keep list reactive */ })

// Modal helpers
function openCreate() {
  modal.value = { isOpen: true, mode: 'create', resource: null }
}
function openEdit(resource: Resource) {
  modal.value = { isOpen: true, mode: 'edit', resource }
}

function onCreated(resource: any) {
  allResources.value.unshift(resource)
}
function onUpdated(resource: any) {
  const i = allResources.value.findIndex(r => r.id === resource.id)
  if (i !== -1) allResources.value[i] = resource
}

function preview(resource: Resource) {
  // Basic preview behavior based on type; can be extended
  if (resource.type === 'url' && resource.url) {
    window.open(resource.url, '_blank')
    return
  }
  // For others, just log for now or hook into existing preview patterns
  console.log('Preview resource:', resource)
}

// Styled confirmation dialog state and handlers (align with offering designer)
const confirmState = ref<{ open: boolean; resource: Resource | null }>({ open: false, resource: null })
const confirmDescription = computed(() => confirmState.value.resource ? `Are you sure you want to remove "${confirmState.value.resource.name}"?` : '')

function remove(resource: Resource) {
  confirmState.value = { open: true, resource }
}

function performRemove() {
  const res = confirmState.value.resource
  if (!res) return
  allResources.value = allResources.value.filter(r => r.id !== res.id)
  confirmState.value.open = false
}

// Utils
function formatDate(dateString?: string) {
  if (!dateString) return '—'
  const d = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(d)
}
</script>
