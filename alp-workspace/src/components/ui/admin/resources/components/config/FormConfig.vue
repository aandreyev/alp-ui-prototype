<template>
  <div class="form-config space-y-4">
    <!-- Syntaq Form Selection -->
    <div>
      <label class="text-sm font-medium text-foreground">Syntaq Form *</label>
      <div class="mt-1 space-y-2">
        <div class="relative">
          <Input 
            :value="modelValue.syntaqFormId || ''"
            @input="updateField('syntaqFormId', $event.target.value)"
            placeholder="Enter Syntaq Form ID (e.g., FORM-123)"
            :class="validationErrors?.syntaqFormId ? 'border-destructive' : ''"
          />
          <Button 
            variant="outline" 
            size="sm"
            class="absolute right-1 top-1/2 transform -translate-y-1/2 h-8"
            @click="openFormBrowser"
          >
            Browse
          </Button>
        </div>
        
        <!-- Form Preview -->
        <div v-if="formPreview" class="border rounded-lg p-3 bg-muted/30">
          <div class="flex items-start gap-3">
            <FormInput class="w-5 h-5 mt-0.5 text-primary" />
            <div class="flex-1">
              <p class="text-sm font-medium">{{ formPreview.title }}</p>
              <p class="text-xs text-muted-foreground">
                {{ formPreview.fieldCount }} fields • Version {{ formPreview.version }}
              </p>
              <div v-if="formPreview.isPublished" class="flex items-center gap-1 mt-1">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-xs text-green-600">Published</span>
              </div>
              <div v-else class="flex items-center gap-1 mt-1">
                <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span class="text-xs text-yellow-600">Draft</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p v-if="validationErrors?.syntaqFormId" class="text-sm text-destructive mt-1">
        {{ validationErrors.syntaqFormId }}
      </p>
    </div>

    <!-- Form Category -->
    <div>
      <label class="text-sm font-medium text-foreground">Form Category</label>
      <Select 
        :value="modelValue.formCategory || ''"
        @update:value="updateField('formCategory', $event)"
      >
        <SelectTrigger>
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="client-intake">Client Intake</SelectItem>
          <SelectItem value="case-management">Case Management</SelectItem>
          <SelectItem value="document-collection">Document Collection</SelectItem>
          <SelectItem value="feedback">Feedback & Surveys</SelectItem>
          <SelectItem value="contact">Contact Forms</SelectItem>
          <SelectItem value="application">Application</SelectItem>
          <SelectItem value="questionnaire">Questionnaire</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Form Settings -->
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="text-sm font-medium text-foreground">Estimated Completion Time</label>
        <div class="flex items-center gap-2">
          <Input 
            type="number"
            :value="estimatedMinutes"
            @input="setEstimatedTime($event.target.value)"
            placeholder="5"
            min="1"
            max="120"
            class="w-20"
          />
          <span class="text-sm text-muted-foreground">minutes</span>
        </div>
      </div>
      
      <div>
        <label class="text-sm font-medium text-foreground">Required Fields</label>
        <Input 
          type="number"
          :value="modelValue.requiredFieldCount || 0"
          @input="updateField('requiredFieldCount', parseInt($event.target.value) || 0)"
          placeholder="0"
          min="0"
          readonly
          class="bg-muted"
        />
        <p class="text-xs text-muted-foreground mt-1">
          Auto-detected from form structure
        </p>
      </div>
    </div>

    <!-- Integration Settings -->
    <div class="space-y-3">
      <h4 class="text-sm font-medium">Integration Settings</h4>
      
      <div class="space-y-3">
        <div class="flex items-center space-x-2">
          <input
            id="crmIntegration"
            type="checkbox"
            :checked="modelValue.crmIntegration || false"
            @change="updateField('crmIntegration', $event.target.checked)"
            class="rounded border-gray-300"
          />
          <label for="crmIntegration" class="text-sm text-foreground">
            Integrate with CRM system
          </label>
        </div>
        
        <div v-if="modelValue.crmIntegration" class="pl-6">
          <label class="text-sm font-medium text-foreground">Webhook URL</label>
          <Input 
            :value="modelValue.webhookUrl || ''"
            @input="updateField('webhookUrl', $event.target.value)"
            placeholder="https://your-crm.com/webhook/forms"
            class="mt-1"
          />
        </div>
      </div>
    </div>

    <!-- Compliance Settings -->
    <div class="space-y-3">
      <h4 class="text-sm font-medium">Compliance & Privacy</h4>
      
      <div class="space-y-3">
        <div class="flex items-center space-x-2">
          <input
            id="gdprCompliant"
            type="checkbox"
            :checked="modelValue.gdprCompliant !== false"
            @change="updateField('gdprCompliant', $event.target.checked)"
            class="rounded border-gray-300"
          />
          <label for="gdprCompliant" class="text-sm text-foreground">
            GDPR compliant
          </label>
        </div>
        
        <div class="flex items-center space-x-2">
          <input
            id="consentRequired"
            type="checkbox"
            :checked="modelValue.consentRequired || false"
            @change="updateField('consentRequired', $event.target.checked)"
            class="rounded border-gray-300"
          />
          <label for="consentRequired" class="text-sm text-foreground">
            Explicit consent required
          </label>
        </div>
        
        <div>
          <label class="text-sm font-medium text-foreground">Data Retention Period</label>
          <Select 
            :value="dataRetentionDisplay"
            @update:value="setDataRetention($event)"
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
              <SelectItem value="365">1 year</SelectItem>
              <SelectItem value="1095">3 years</SelectItem>
              <SelectItem value="2555">7 years</SelectItem>
              <SelectItem value="permanent">Permanent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>

    <!-- Form Analytics (if form exists) -->
    <div v-if="formAnalytics" class="bg-muted/30 rounded-lg p-4">
      <h4 class="text-sm font-medium mb-3">Form Analytics</h4>
      <div class="grid grid-cols-3 gap-4 text-sm">
        <div>
          <span class="text-muted-foreground">Submissions:</span>
          <span class="ml-2 font-medium">{{ formAnalytics.submissions }}</span>
        </div>
        <div>
          <span class="text-muted-foreground">Completion Rate:</span>
          <span class="ml-2 font-medium">{{ formAnalytics.completionRate }}%</span>
        </div>
        <div>
          <span class="text-muted-foreground">Avg. Time:</span>
          <span class="ml-2 font-medium">{{ formAnalytics.avgTime }}m</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { FormInput } from 'lucide-vue-next'

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

// Types
import type { CreateFormResource } from '@/alp-types/admin-resources.types'

interface Props {
  modelValue: CreateFormResource & { type: 'form' }
  validationErrors?: Record<string, string>
}

interface Emits {
  (e: 'update:field', field: string, value: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const formPreview = ref<any>(null)

// Computed
const estimatedMinutes = computed(() => {
  if (!props.modelValue.estimatedCompletionTime) return ''
  return Math.ceil(props.modelValue.estimatedCompletionTime / 60).toString()
})

const dataRetentionDisplay = computed(() => {
  const days = props.modelValue.dataRetentionPeriod
  if (!days) return '365' // default 1 year
  if (days >= 2555) return 'permanent'
  return days.toString()
})

const formAnalytics = computed(() => {
  if (props.modelValue.syntaqFormId && formPreview.value) {
    return {
      submissions: props.modelValue.submissionCount || 0,
      completionRate: Math.floor(Math.random() * 30) + 70, // Mock 70-100%
      avgTime: Math.floor(Math.random() * 10) + 5 // Mock 5-15 minutes
    }
  }
  return null
})

/**
 * Update field value
 */
function updateField(field: string, value: any) {
  emit('update:field', field, value)
}

/**
 * Set estimated completion time in seconds
 */
function setEstimatedTime(minutes: string) {
  const mins = parseInt(minutes) || 0
  updateField('estimatedCompletionTime', mins * 60)
}

/**
 * Set data retention period
 */
function setDataRetention(value: string) {
  if (value === 'permanent') {
    updateField('dataRetentionPeriod', undefined)
  } else {
    updateField('dataRetentionPeriod', parseInt(value))
  }
}

/**
 * Open form browser (mock)
 */
function openFormBrowser() {
  // In real implementation, this would open a form selection dialog
  // For demo, we'll simulate selecting a form
  const mockFormId = `FORM-${Math.floor(Math.random() * 1000)}`
  updateField('syntaqFormId', mockFormId)
  
  // Mock form preview data
  setTimeout(() => {
    formPreview.value = {
      title: `Client Intake Form ${mockFormId}`,
      fieldCount: Math.floor(Math.random() * 20) + 5,
      version: '2.1',
      isPublished: Math.random() > 0.3
    }
    
    // Update form metadata
    updateField('fieldCount', formPreview.value.fieldCount)
    updateField('formVersion', formPreview.value.version)
    updateField('isPublished', formPreview.value.isPublished)
    updateField('requiredFieldCount', Math.floor(formPreview.value.fieldCount * 0.6))
  }, 100)
}

// Watch for form ID changes
watch(() => props.modelValue.syntaqFormId, (newFormId) => {
  if (newFormId && !formPreview.value) {
    // Mock loading form data
    setTimeout(() => {
      formPreview.value = {
        title: `Form ${newFormId}`,
        fieldCount: Math.floor(Math.random() * 20) + 5,
        version: '1.0',
        isPublished: Math.random() > 0.5
      }
    }, 200)
  } else if (!newFormId) {
    formPreview.value = null
  }
})
</script>

<style scoped>
.form-config {
  /* Component-specific styles if needed */
}
</style>