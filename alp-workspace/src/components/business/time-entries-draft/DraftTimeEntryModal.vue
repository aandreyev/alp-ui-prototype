<template>
  <Dialog :open="open" @update:open="$emit('close')">
    <DialogContent class="max-w-4xl">
      <DialogHeader>
        <DialogTitle>Edit Draft Time Entry</DialogTitle>
        <DialogDescription>Complete required fields to enable confirmation.</DialogDescription>
      </DialogHeader>

      <div class="space-y-6">
        <!-- Matter, Outcome, Component Selectors -->
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="text-sm font-medium block mb-2">Matter</label>
            <select 
              v-model="form.selectedMatter" 
              @change="onMatterChange"
              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Matter...</option>
              <option 
                v-for="matter in availableMatters" 
                :key="matter.id" 
                :value="matter"
              >
                {{ matter.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="text-sm font-medium block mb-2">Outcome</label>
            <select 
              v-model="form.selectedOutcome" 
              @change="onOutcomeChange"
              :disabled="!form.selectedMatter"
              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
            >
              <option value="">Select Outcome...</option>
              <option 
                v-for="outcome in availableOutcomes" 
                :key="outcome.id" 
                :value="outcome"
              >
                {{ outcome.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="text-sm font-medium block mb-2">Component</label>
            <select 
              v-model="form.selectedComponent" 
              :disabled="!form.selectedOutcome"
              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
            >
              <option value="">Select Component...</option>
              <option 
                v-for="component in availableComponents" 
                :key="component.id" 
                :value="component"
              >
                {{ component.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- Date/Time and Duration Row -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium block mb-2">Date/Time</label>
            <Input type="datetime-local" v-model="form.dateLocal" />
          </div>
          <div>
            <label class="text-sm font-medium block mb-2">Duration (units)</label>
            <Input type="number" min="0" v-model.number="form.durationUnits" />
          </div>
        </div>

        <!-- Staff and Rate Row -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium block mb-2">Staff</label>
            <select 
              v-model="form.selectedStaff" 
              @change="onStaffChange"
              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Staff...</option>
              <option 
                v-for="staff in availableStaff" 
                :key="staff.id" 
                :value="staff"
              >
                {{ staff.name }} ({{ staff.title }})
              </option>
            </select>
          </div>
          <div>
            <label class="text-sm font-medium block mb-2">Rate (Hourly)</label>
            <Input type="number" min="0" step="1" v-model.number="form.rate" />
          </div>
        </div>

        <!-- Billable and GST Type Row -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium block mb-2">Billable</label>
            <select v-model="form.billableType" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="Billable">Billable</option>
              <option value="NonBillable">Non Billable</option>
              <option value="NonChargeable">Non Chargeable</option>
              <option value="ProBono">Pro Bono</option>
            </select>
          </div>
          <div>
            <label class="text-sm font-medium block mb-2">GST Type</label>
            <select v-model="form.gstType" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="GST">GST (10%)</option>
              <option value="GST_EXPORT">GST Export (0%)</option>
              <option value="BAS_EXCLUDED">BAS Excluded (0%)</option>
            </select>
          </div>
        </div>

        <!-- Description -->
        <div>
          <label class="text-sm font-medium block mb-2">Description</label>
          <Textarea v-model="form.description" rows="4" />
          <p v-if="!form.description && entry?.aiGeneratedDescription" class="text-xs text-muted-foreground mt-1">
            AI suggestion: {{ entry.aiGeneratedDescription }}
          </p>
        </div>
      </div>

      <DialogFooter>
        <div class="flex w-full justify-between items-center">
          <div>
            <Button variant="outline" @click="$emit('close')">Cancel</Button>
          </div>
          <div class="flex gap-2">
            <Button variant="destructive" @click="ignore">Ignore</Button>
            <Button v-if="isComplete" variant="default" @click="confirm">Confirm</Button>
            <Button :disabled="!canSave" @click="save">Save</Button>
          </div>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, reactive, watch, ref, onMounted } from 'vue'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/lib/registry/new-york/ui/dialog'
import { Input } from '@/lib/registry/new-york/ui/input'
import { Textarea } from '@/lib/registry/new-york/ui/textarea'
import { Button } from '@/lib/registry/new-york/ui/button'
import type { DraftTimeEntry } from './composables/useDraftTimeEntries'

interface Matter {
  id: string
  name: string
  client: string
  outcomes: Outcome[]
}

interface Outcome {
  id: string
  name: string
  description: string
  components: Component[]
}

interface Component {
  id: string
  name: string
  description: string
}

interface Staff {
  id: string
  name: string
  title: string
  rate: number
}

interface Props {
  open: boolean
  entry: DraftTimeEntry | null
}
const props = defineProps<Props>()
const emit = defineEmits<{ 
  (e: 'close'): void; 
  (e: 'save', entry: DraftTimeEntry): void;
  (e: 'ignore', entryId: string): void;
  (e: 'confirm', entry: DraftTimeEntry): void;
}>()

const availableMatters = ref<Matter[]>([])
const availableOutcomes = ref<Outcome[]>([])
const availableComponents = ref<Component[]>([])
const availableStaff = ref<Staff[]>([])

const form = reactive({
  id: '',
  dateLocal: '',
  durationUnits: 0,
  selectedMatter: null as Matter | null,
  selectedOutcome: null as Outcome | null,
  selectedComponent: null as Component | null,
  selectedStaff: null as Staff | null,
  description: '',
  rate: undefined as number | undefined,
  billableType: 'Billable' as 'Billable' | 'NonBillable' | 'NonChargeable' | 'ProBono',
  gstType: 'GST' as 'GST' | 'GST_EXPORT' | 'BAS_EXCLUDED'
})

// Load mock matter data
async function loadMatterData() {
  try {
    const module = await import('@/alp-data/time-entries/mock-matter-data.json')
    availableMatters.value = module.default || []
  } catch (error) {
    console.error('Failed to load matter data:', error)
    availableMatters.value = []
  }
}

// Load mock staff data
async function loadStaffData() {
  try {
    const module = await import('@/alp-data/time-entries/mock-staff-data.json')
    availableStaff.value = module.default || []
  } catch (error) {
    console.error('Failed to load staff data:', error)
    availableStaff.value = []
  }
}

// Handle matter selection change
function onMatterChange() {
  availableOutcomes.value = form.selectedMatter?.outcomes || []
  form.selectedOutcome = null
  form.selectedComponent = null
  availableComponents.value = []
}

// Handle outcome selection change  
function onOutcomeChange() {
  availableComponents.value = form.selectedOutcome?.components || []
  form.selectedComponent = null
}

// Handle staff selection change
function onStaffChange() {
  if (form.selectedStaff) {
    form.rate = form.selectedStaff.rate
  }
}

// Initialize form when entry changes
watch(() => props.entry, e => {
  if (!e) return
  form.id = e.id
  form.dateLocal = e.date ? new Date(e.date).toISOString().slice(0,16) : ''
  form.durationUnits = e.durationMinutes || 0  // Map from existing durationMinutes to durationUnits
  form.description = e.description || ''
  form.rate = e.rate
  form.billableType = (e.billableType as any) || 'Billable'
  form.gstType = (e.gstType as any) || 'GST'
  
  // Try to set selected staff based on entry data
  if (e.staffName) {
    const staff = availableStaff.value.find(s => s.name === e.staffName)
    if (staff) {
      form.selectedStaff = staff
    }
  }
  
  // Try to set selected matter/outcome/component based on entry data
  if (e.matterId) {
    const matter = availableMatters.value.find(m => m.id === e.matterId)
    if (matter) {
      form.selectedMatter = matter
      onMatterChange()
      
      if (e.matterOutcomeId) {
        const outcome = availableOutcomes.value.find(o => o.id === e.matterOutcomeId)
        if (outcome) {
          form.selectedOutcome = outcome
          onOutcomeChange()
          
          if (e.matterComponentId) {
            const component = availableComponents.value.find(c => c.id === e.matterComponentId)
            if (component) {
              form.selectedComponent = component
            }
          }
        }
      }
    }
  }
}, { immediate: true })

const isComplete = computed(() => {
  return Boolean(
    form.dateLocal && 
    form.durationUnits > 0 && 
    form.selectedMatter && 
    form.selectedOutcome && 
    form.selectedComponent &&
    form.selectedStaff &&
    form.rate != null && form.rate > 0 &&
    (form.description || props.entry?.aiGeneratedDescription)
  )
})

const canSave = computed(() => {
  // Allow saving as long as there's at least some data entered
  return Boolean(
    form.dateLocal || 
    form.durationUnits > 0 || 
    form.selectedMatter || 
    form.description ||
    form.selectedStaff ||
    form.rate != null
  )
})

function save() {
  if (!props.entry) return
  
  const updated: DraftTimeEntry = {
    ...props.entry,
    date: form.dateLocal ? new Date(form.dateLocal).toISOString() : props.entry.date,
    durationMinutes: form.durationUnits || props.entry.durationMinutes,  // Use existing value if not set
    matterId: form.selectedMatter?.id || props.entry.matterId,
    matterOutcomeId: form.selectedOutcome?.id || props.entry.matterOutcomeId,
    matterComponentId: form.selectedComponent?.id || props.entry.matterComponentId,
    description: form.description || props.entry.description,
    staffName: form.selectedStaff?.name || props.entry.staffName,
    rate: form.rate ?? props.entry.rate,  // Use nullish coalescing to preserve 0 values
    billableType: form.billableType || props.entry.billableType,
    gstType: form.gstType || props.entry.gstType,
    matterOutcomeDescription: form.selectedOutcome?.description || props.entry.matterOutcomeDescription,
    matterComponentDescription: form.selectedComponent?.description || props.entry.matterComponentDescription,
    updatedAt: new Date().toISOString()
  }
  
  emit('save', updated)
}

function ignore() {
  if (!props.entry) return
  emit('ignore', props.entry.id)
  emit('close')
}

function confirm() {
  if (!props.entry) return
  
  // First save the current form data, then confirm
  const updated: DraftTimeEntry = {
    ...props.entry,
    date: form.dateLocal ? new Date(form.dateLocal).toISOString() : props.entry.date,
    durationMinutes: form.durationUnits || props.entry.durationMinutes,
    matterId: form.selectedMatter?.id || props.entry.matterId,
    matterOutcomeId: form.selectedOutcome?.id || props.entry.matterOutcomeId,
    matterComponentId: form.selectedComponent?.id || props.entry.matterComponentId,
    description: form.description || props.entry.description,
    staffName: form.selectedStaff?.name || props.entry.staffName,
    rate: form.rate ?? props.entry.rate,
    billableType: form.billableType || props.entry.billableType,
    gstType: form.gstType || props.entry.gstType,
    matterOutcomeDescription: form.selectedOutcome?.description || props.entry.matterOutcomeDescription,
    matterComponentDescription: form.selectedComponent?.description || props.entry.matterComponentDescription,
    updatedAt: new Date().toISOString()
  }
  
  // Emit the updated entry for confirmation
  emit('confirm', updated)
  emit('close')
}

onMounted(() => {
  loadMatterData()
  loadStaffData()
})
</script>


