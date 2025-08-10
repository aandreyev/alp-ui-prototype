<template>
  <div class="form-config space-y-4">
    <!-- Syntaq Form ID -->
    <div>
      <label class="text-sm font-medium text-foreground">Syntaq Form ID *</label>
      <Input 
        :modelValue="data?.syntaqFormId ?? ''"
        @update:modelValue="$emit('update:field', 'syntaqFormId', $event)"
        placeholder="e.g., FORM_CLIENT_INTAKE_001"
        :class="validationErrors?.syntaqFormId ? 'border-destructive' : ''"
      />
      <p v-if="validationErrors?.syntaqFormId" class="text-sm text-destructive mt-1">
        {{ validationErrors.syntaqFormId }}
      </p>
      <p class="text-xs text-muted-foreground mt-1">
        Enter the unique Syntaq form identifier
      </p>
    </div>

    <!-- Form Category -->
    <div>
      <label class="text-sm font-medium text-foreground">Form Category</label>
      <Select 
        :modelValue="data?.formCategory ?? 'other'"
        @update:modelValue="$emit('update:field', 'formCategory', $event)"
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="client-intake">Client Intake</SelectItem>
          <SelectItem value="document-collection">Document Collection</SelectItem>
          <SelectItem value="survey">Survey</SelectItem>
          <SelectItem value="feedback">Feedback</SelectItem>
          <SelectItem value="assessment">Assessment</SelectItem>
          <SelectItem value="application">Application</SelectItem>
          <SelectItem value="registration">Registration</SelectItem>
          <SelectItem value="consent">Consent Form</SelectItem>
          <SelectItem value="questionnaire">Questionnaire</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Form Preview (if Syntaq Form ID is provided) -->
    <div v-if="data?.syntaqFormId" class="bg-muted/30 rounded-lg p-4">
      <h4 class="text-sm font-medium mb-3">Form Details</h4>
      <div class="flex items-center gap-3 mb-3">
        <FileCheck class="w-5 h-5 text-primary" />
        <div class="flex-1">
          <p class="text-sm font-medium">{{ data?.syntaqFormId }}</p>
          <p class="text-xs text-muted-foreground">{{ getCategoryLabel(data?.formCategory) }}</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          @click="previewForm"
          :disabled="loading"
        >
          <Eye class="w-4 h-4 mr-2" />
          {{ loading ? 'Loading...' : 'Preview' }}
        </Button>
      </div>
      
      <!-- Form Properties -->
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span class="text-muted-foreground">Form ID:</span>
          <span class="ml-2 font-medium">{{ data?.syntaqFormId }}</span>
        </div>
        <div>
          <span class="text-muted-foreground">Category:</span>
          <span class="ml-2 font-medium">{{ getCategoryLabel(data?.formCategory) }}</span>
        </div>
      </div>
      
      <!-- Mock form statistics (would come from Syntaq API) -->
      <div v-if="formStats" class="mt-3 grid grid-cols-3 gap-4 text-sm">
        <div>
          <span class="text-muted-foreground">Fields:</span>
          <span class="ml-2 font-medium">{{ formStats.fieldCount }}</span>
        </div>
        <div>
          <span class="text-muted-foreground">Submissions:</span>
          <span class="ml-2 font-medium">{{ formStats.submissionCount }}</span>
        </div>
        <div>
          <span class="text-muted-foreground">Status:</span>
          <span class="ml-2 font-medium" :class="formStats.isActive ? 'text-green-600' : 'text-orange-600'">
            {{ formStats.isActive ? 'Active' : 'Draft' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { FileCheck, Eye } from 'lucide-vue-next'

// UI Components
import { Button } from '@/lib/registry/new-york/ui/button'
import { Input } from '@/lib/registry/new-york/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/lib/registry/new-york/ui/select'

interface Props {
  data: any
  validationErrors?: Record<string, string>
}

interface Emits {
  (e: 'update:field', field: string, value: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const loading = ref(false)
const formStats = ref<any>(null)

/**
 * Get category label for display
 */
function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    'client-intake': 'Client Intake',
    'document-collection': 'Document Collection',
    'survey': 'Survey',
    'feedback': 'Feedback',
    'assessment': 'Assessment',
    'application': 'Application',
    'registration': 'Registration',
    'consent': 'Consent Form',
    'questionnaire': 'Questionnaire',
    'other': 'Other'
  }
  return labels[category] || 'Other'
}

/**
 * Preview form in Syntaq
 */
async function previewForm() {
  if (!props.data.syntaqFormId) return
  
  loading.value = true
  
  try {
    // Simulate Syntaq API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // In real implementation, this would open Syntaq form preview
    console.log('Opening Syntaq form preview:', props.data.syntaqFormId)
    
    // Mock opening in new window
    // window.open(`https://syntaq.com/forms/${props.data.syntaqFormId}/preview`, '_blank')
    
  } catch (error) {
    console.error('Failed to preview form:', error)
  } finally {
    loading.value = false
  }
}

/**
 * Load form statistics from Syntaq API (mock)
 */
async function loadFormStats() {
  if (!props.data.syntaqFormId) {
    formStats.value = null
    return
  }
  
  try {
    // Simulate API call to get form stats
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Mock form statistics
    formStats.value = {
      fieldCount: Math.floor(Math.random() * 20) + 5,
      submissionCount: Math.floor(Math.random() * 500),
      isActive: Math.random() > 0.3,
      lastModified: new Date().toISOString()
    }
    
    console.log('Form stats loaded:', formStats.value)
  } catch (error) {
    console.error('Failed to load form stats:', error)
    formStats.value = null
  }
}

// Watch for Syntaq Form ID changes to load stats
watch(() => props.data.syntaqFormId, (newId) => {
  if (newId) {
    loadFormStats()
  } else {
    formStats.value = null
  }
}, { immediate: true })
</script>
