<template>
  <div class="email-template-config space-y-4">
    <!-- Template Type -->
    <div>
      <label class="text-sm font-medium text-foreground">Template Type</label>
      <Select 
        :modelValue="data?.templateType ?? 'other'"
        @update:modelValue="$emit('update:field', 'templateType', $event)"
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="welcome">Welcome Email</SelectItem>
          <SelectItem value="notification">Notification</SelectItem>
          <SelectItem value="legal-notice">Legal Notice</SelectItem>
          <SelectItem value="reminder">Reminder</SelectItem>
          <SelectItem value="confirmation">Confirmation</SelectItem>
          <SelectItem value="follow-up">Follow-up</SelectItem>
          <SelectItem value="newsletter">Newsletter</SelectItem>
          <SelectItem value="invoice">Invoice</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Author -->
    <div>
      <label class="text-sm font-medium text-foreground">Author</label>
      <Input 
        :modelValue="data?.author ?? ''"
        @update:modelValue="$emit('update:field', 'author', $event)"
        placeholder="Template author"
      />
    </div>

    <!-- Subject Line -->
    <div>
      <label class="text-sm font-medium text-foreground">Subject Line *</label>
      <Input 
        :modelValue="data?.subjectLine ?? ''"
        @update:modelValue="$emit('update:field', 'subjectLine', $event)"
        placeholder="Email subject line"
        :class="validationErrors?.subjectLine ? 'border-destructive' : ''"
      />
      <p v-if="validationErrors?.subjectLine" class="text-sm text-destructive mt-1">
        {{ validationErrors.subjectLine }}
      </p>
        <p class="text-xs text-muted-foreground mt-1">
          Use variables like <code v-text="'{{clientName}}'"></code> for personalization
        </p>
    </div>

    <!-- Email Content -->
    <div>
      <label class="text-sm font-medium text-foreground">Email Content *</label>
      <Textarea 
        :modelValue="data?.emailContent ?? ''"
        @update:modelValue="$emit('update:field', 'emailContent', $event)"
        placeholder="Email template content (HTML supported)"
        rows="8"
        :class="validationErrors?.emailContent ? 'border-destructive' : ''"
      />
      <p v-if="validationErrors?.emailContent" class="text-sm text-destructive mt-1">
        {{ validationErrors.emailContent }}
      </p>
      <div class="flex items-center justify-between mt-1">
        <p class="text-xs text-muted-foreground">
          HTML tags and variables supported
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          @click="togglePreview"
        >
          <Eye class="w-4 h-4 mr-2" />
          {{ showPreview ? 'Hide' : 'Preview' }}
        </Button>
      </div>
    </div>

    <!-- Email Preview -->
    <div v-if="showPreview && data?.emailContent" class="bg-muted/30 rounded-lg p-4">
      <h4 class="text-sm font-medium mb-3">Email Preview</h4>
      <div class="border rounded-lg bg-white p-4">
        <div class="border-b pb-3 mb-3">
          <div class="text-sm text-muted-foreground mb-1">Subject:</div>
          <div class="font-medium">{{ data?.subjectLine || 'No subject' }}</div>
        </div>
        <div class="prose prose-sm max-w-none" v-html="renderEmailContent()"></div>
      </div>
    </div>

    <!-- Version -->
    <div>
      <label class="text-sm font-medium text-foreground">Version</label>
      <Input 
        :modelValue="data?.version ?? '1.0'"
        @update:modelValue="$emit('update:field', 'version', $event)"
        placeholder="1.0"
        class="w-24"
      />
      <p class="text-xs text-muted-foreground mt-1">
        e.g., 1.0, 1.1, 2.0
      </p>
    </div>

    <!-- Template Variables Helper -->
    <div class="bg-muted/30 rounded-lg p-4">
      <h4 class="text-sm font-medium mb-3">Available Variables</h4>
      <div class="grid grid-cols-2 gap-2 text-xs">
        <div class="flex items-center gap-2">
          <code class="bg-muted px-1 rounded" v-text="'{{clientName}}'"></code>
          <span class="text-muted-foreground">Client name</span>
        </div>
        <div class="flex items-center gap-2">
          <code class="bg-muted px-1 rounded" v-text="'{{matterNumber}}'"></code>
          <span class="text-muted-foreground">Matter number</span>
        </div>
        <div class="flex items-center gap-2">
          <code class="bg-muted px-1 rounded" v-text="'{{lawyerName}}'"></code>
          <span class="text-muted-foreground">Lawyer name</span>
        </div>
        <div class="flex items-center gap-2">
          <code class="bg-muted px-1 rounded" v-text="'{{firmName}}'"></code>
          <span class="text-muted-foreground">Firm name</span>
        </div>
        <div class="flex items-center gap-2">
          <code class="bg-muted px-1 rounded" v-text="'{{date}}'"></code>
          <span class="text-muted-foreground">Current date</span>
        </div>
        <div class="flex items-center gap-2">
          <code class="bg-muted px-1 rounded" v-text="'{{dueDate}}'"></code>
          <span class="text-muted-foreground">Due date</span>
        </div>
      </div>
    </div>

    <!-- Auto-populated properties -->
    <div v-if="data?.lastUpdated" class="bg-muted/30 rounded-lg p-4">
      <h4 class="text-sm font-medium mb-3">Template Properties</h4>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span class="text-muted-foreground">Last Updated:</span>
          <span class="ml-2 font-medium">{{ formatDate(data.lastUpdated) }}</span>
        </div>
        <div>
          <span class="text-muted-foreground">Content Length:</span>
          <span class="ml-2 font-medium">{{ getContentLength() }} characters</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Eye } from 'lucide-vue-next'

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

interface Props {
  data: any
  validationErrors?: Record<string, string>
}

interface Emits {
  (e: 'update:field', field: string, value: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const showPreview = ref(false)

/**
 * Toggle email preview
 */
function togglePreview() {
  showPreview.value = !showPreview.value
}

/**
 * Render email content with sample variable substitution
 */
function renderEmailContent(): string {
  let content = props.data?.emailContent || ''
  
  // Replace common variables with sample data for preview
  const sampleData = {
    '{{clientName}}': 'John Smith',
    '{{matterNumber}}': 'MAT-2024-001',
    '{{lawyerName}}': 'Sarah Johnson',
    '{{firmName}}': 'ALP Legal',
    '{{date}}': new Date().toLocaleDateString(),
    '{{dueDate}}': new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
  }
  
  Object.entries(sampleData).forEach(([variable, value]) => {
    content = content.replace(new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), value)
  })
  
  // Basic HTML sanitization for preview (in production, use a proper sanitizer)
  content = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  
  return content
}

/**
 * Get content length
 */
function getContentLength(): number {
  return (props.data?.emailContent || '').length
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  if (!dateString) return 'Unknown'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}
</script>

<style scoped>
.prose {
  color: inherit;
}

.prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
  color: inherit;
  margin-top: 1em;
  margin-bottom: 0.5em;
}

.prose p {
  margin-bottom: 1em;
}

.prose ul, .prose ol {
  margin-bottom: 1em;
  padding-left: 1.5em;
}

.prose strong {
  font-weight: 600;
}

.prose em {
  font-style: italic;
}
</style>
