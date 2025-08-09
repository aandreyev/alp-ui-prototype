<template>
  <div class="email-template-config space-y-4">
    <!-- Email Subject -->
    <div>
      <label class="text-sm font-medium text-foreground">Subject Line *</label>
      <Input 
        :value="modelValue.subject || ''"
        @input="updateField('subject', $event.target.value)"
        placeholder="Enter email subject"
        :class="validationErrors?.subject ? 'border-destructive' : ''"
      />
      <p v-if="validationErrors?.subject" class="text-sm text-destructive mt-1">
        {{ validationErrors.subject }}
      </p>
    </div>

    <!-- Template Type -->
    <div>
      <label class="text-sm font-medium text-foreground">Template Type</label>
      <Select 
        :value="modelValue.templateType || 'notification'"
        @update:value="updateField('templateType', $event)"
      >
        <SelectTrigger class="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="notification">Notification</SelectItem>
          <SelectItem value="marketing">Marketing</SelectItem>
          <SelectItem value="legal">Legal</SelectItem>
          <SelectItem value="system">System</SelectItem>
          <SelectItem value="welcome">Welcome</SelectItem>
          <SelectItem value="reminder">Reminder</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Email Content -->
    <div>
      <label class="text-sm font-medium text-foreground">Email Content *</label>
      <div class="mt-1">
        <Textarea 
          :value="modelValue.htmlContent || ''"
          @input="updateField('htmlContent', $event.target.value)"
          placeholder="Enter email content (HTML supported)"
          rows="8"
          :class="validationErrors?.htmlContent ? 'border-destructive' : ''"
        />
        <div class="flex items-center justify-between mt-2">
          <div class="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              @click="insertVariable"
            >
              Insert Variable
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              @click="showPreview = !showPreview"
            >
              {{ showPreview ? 'Hide' : 'Show' }} Preview
            </Button>
          </div>
          <span class="text-xs text-muted-foreground">
            {{ (modelValue.htmlContent || '').length }} characters
          </span>
        </div>
      </div>
      <p v-if="validationErrors?.htmlContent" class="text-sm text-destructive mt-1">
        {{ validationErrors.htmlContent }}
      </p>
    </div>

    <!-- Email Preview -->
    <div v-if="showPreview" class="border rounded-lg p-4 bg-muted/30">
      <h4 class="text-sm font-medium mb-2">Preview</h4>
      <div class="border rounded bg-white p-3">
        <div class="text-sm font-medium border-b pb-2 mb-2">
          Subject: {{ modelValue.subject || 'No subject' }}
        </div>
        <div 
          class="text-sm prose prose-sm max-w-none"
          v-html="processedContent"
        />
      </div>
    </div>

    <!-- Template Variables -->
    <div>
      <label class="text-sm font-medium text-foreground">Template Variables</label>
      <div class="mt-2 space-y-2">
        <div v-for="(variable, index) in emailVariables" :key="index" class="flex items-center gap-2">
          <Input 
            :value="variable.name"
            @input="updateVariable(index, 'name', $event.target.value)"
            placeholder="Variable name (e.g., clientName)"
            class="flex-1"
          />
          <Select 
            :value="variable.type"
            @update:value="updateVariable(index, 'type', $event)"
          >
            <SelectTrigger class="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="boolean">Boolean</SelectItem>
            </SelectContent>
          </Select>
          <div class="flex items-center">
            <input
              type="checkbox"
              :checked="variable.required"
              @change="updateVariable(index, 'required', $event.target.checked)"
              class="rounded border-gray-300"
            />
            <span class="ml-1 text-xs text-muted-foreground">Required</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            @click="removeVariable(index)"
            class="text-muted-foreground hover:text-destructive"
          >
            <X class="w-4 h-4" />
          </Button>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          @click="addVariable"
          class="w-full"
        >
          <Plus class="w-4 h-4 mr-2" />
          Add Variable
        </Button>
      </div>
    </div>

    <!-- Compliance Settings -->
    <div class="space-y-3">
      <h4 class="text-sm font-medium">Compliance Settings</h4>
      
      <div class="space-y-2">
        <div class="flex items-center space-x-2">
          <input
            id="includesUnsubscribe"
            type="checkbox"
            :checked="modelValue.includesUnsubscribe !== false"
            @change="updateField('includesUnsubscribe', $event.target.checked)"
            class="rounded border-gray-300"
          />
          <label for="includesUnsubscribe" class="text-sm text-foreground">
            Includes unsubscribe link
          </label>
        </div>
        
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
            id="canSpamCompliant"
            type="checkbox"
            :checked="modelValue.canSpamCompliant !== false"
            @change="updateField('canSpamCompliant', $event.target.checked)"
            class="rounded border-gray-300"
          />
          <label for="canSpamCompliant" class="text-sm text-foreground">
            CAN-SPAM compliant
          </label>
        </div>
      </div>
    </div>

    <!-- Template Analytics (if template has been used) -->
    <div v-if="templateAnalytics" class="bg-muted/30 rounded-lg p-4">
      <h4 class="text-sm font-medium mb-3">Template Performance</h4>
      <div class="grid grid-cols-4 gap-4 text-sm">
        <div>
          <span class="text-muted-foreground">Sent:</span>
          <span class="ml-2 font-medium">{{ templateAnalytics.sent }}</span>
        </div>
        <div>
          <span class="text-muted-foreground">Open Rate:</span>
          <span class="ml-2 font-medium">{{ templateAnalytics.openRate }}%</span>
        </div>
        <div>
          <span class="text-muted-foreground">Click Rate:</span>
          <span class="ml-2 font-medium">{{ templateAnalytics.clickRate }}%</span>
        </div>
        <div>
          <span class="text-muted-foreground">Bounce Rate:</span>
          <span class="ml-2 font-medium">{{ templateAnalytics.bounceRate }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, X } from 'lucide-vue-next'

// UI Components
import { Button } from '@/lib/registry/new-york/ui/button'
import { Input } from '@/lib/registry/new-york/ui/input'
import { Textarea } from '@/lib/registry/new-york/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/lib/registry/new-york/ui/select'

// Types
import type { CreateEmailTemplateResource, EmailVariable } from '@/alp-types/admin-resources.types'

interface Props {
  modelValue: CreateEmailTemplateResource & { type: 'emailTemplate' }
  validationErrors?: Record<string, string>
}

interface Emits {
  (e: 'update:field', field: string, value: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const showPreview = ref(false)

// Computed
const emailVariables = computed(() => props.modelValue.variables || [])

const processedContent = computed(() => {
  let content = props.modelValue.htmlContent || ''
  
  // Replace variables with sample values for preview
  emailVariables.value.forEach(variable => {
    const placeholder = getSampleValue(variable)
    content = content.replace(
      new RegExp(`{{\\s*${variable.name}\\s*}}`, 'g'),
      `<span class="bg-yellow-100 px-1 rounded">${placeholder}</span>`
    )
  })
  
  return content
})

const templateAnalytics = computed(() => {
  if (props.modelValue.sendCount && props.modelValue.sendCount > 0) {
    return {
      sent: props.modelValue.sendCount,
      openRate: Math.floor(Math.random() * 30) + 15, // Mock 15-45%
      clickRate: Math.floor(Math.random() * 15) + 2, // Mock 2-17%
      bounceRate: Math.floor(Math.random() * 8) + 1 // Mock 1-9%
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
 * Add new variable
 */
function addVariable() {
  const newVariable: EmailVariable = {
    name: '',
    type: 'text',
    required: false
  }
  
  const variables = [...emailVariables.value, newVariable]
  updateField('variables', variables)
  updateVariableLists(variables)
}

/**
 * Remove variable
 */
function removeVariable(index: number) {
  const variables = emailVariables.value.filter((_, i) => i !== index)
  updateField('variables', variables)
  updateVariableLists(variables)
}

/**
 * Update variable property
 */
function updateVariable(index: number, property: string, value: any) {
  const variables = [...emailVariables.value]
  variables[index] = { ...variables[index], [property]: value }
  updateField('variables', variables)
  updateVariableLists(variables)
}

/**
 * Update required/optional variable lists
 */
function updateVariableLists(variables: EmailVariable[]) {
  const required = variables.filter(v => v.required && v.name).map(v => v.name)
  const optional = variables.filter(v => !v.required && v.name).map(v => v.name)
  
  updateField('requiredVariables', required)
  updateField('optionalVariables', optional)
}

/**
 * Insert variable into content
 */
function insertVariable() {
  if (emailVariables.value.length === 0) {
    // Add a sample variable first
    addVariable()
    return
  }
  
  // For demo, insert the first variable
  const firstVar = emailVariables.value[0]
  if (firstVar?.name) {
    const currentContent = props.modelValue.htmlContent || ''
    const newContent = currentContent + `{{${firstVar.name}}}`
    updateField('htmlContent', newContent)
  }
}

/**
 * Get sample value for variable preview
 */
function getSampleValue(variable: EmailVariable): string {
  switch (variable.type) {
    case 'text':
      return variable.name === 'clientName' ? 'John Doe' : 'Sample Text'
    case 'number':
      return '42'
    case 'date':
      return new Date().toLocaleDateString()
    case 'boolean':
      return 'Yes'
    default:
      return 'Sample'
  }
}
</script>

<style scoped>
.email-template-config {
  /* Component-specific styles if needed */
}

.prose {
  max-width: none;
}

.prose p {
  margin: 0.5rem 0;
}
</style>