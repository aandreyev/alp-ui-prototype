<template>
  <div class="tag-input">
    <!-- Tags Display -->
    <div v-if="tags.length > 0" class="flex flex-wrap gap-1 mb-2">
      <Badge 
        v-for="(tag, index) in tags" 
        :key="index"
        variant="secondary" 
        class="text-xs flex items-center gap-1"
      >
        {{ tag }}
        <button
          type="button"
          @click="removeTag(index)"
          class="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
        >
          <X class="w-3 h-3" />
        </button>
      </Badge>
    </div>
    
    <!-- Input -->
    <div class="relative">
      <Input
        ref="inputRef"
        v-model="inputValue"
        :placeholder="tags.length === 0 ? placeholder : ''"
        @keydown="handleKeydown"
        @blur="handleBlur"
        class="pr-8"
      />
      <button
        v-if="inputValue"
        type="button"
        @click="addCurrentTag"
        class="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
      >
        <Plus class="w-4 h-4" />
      </button>
    </div>
    
    <!-- Helper Text -->
    <p v-if="showHelperText" class="text-xs text-muted-foreground mt-1">
      Press Enter, Tab, or comma to add tags
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { X, Plus } from 'lucide-vue-next'
import { Input } from '@/lib/registry/new-york/ui/input'
import { Badge } from '@/lib/registry/new-york/ui/badge'

interface Props {
  value?: string[]
  placeholder?: string
  maxTags?: number
  allowDuplicates?: boolean
  showHelperText?: boolean
}

interface Emits {
  (e: 'update:value', tags: string[]): void
}

const props = withDefaults(defineProps<Props>(), {
  value: () => [],
  placeholder: 'Add tags...',
  maxTags: 10,
  allowDuplicates: false,
  showHelperText: true
})

const emit = defineEmits<Emits>()

// Local state
const inputValue = ref('')
const inputRef = ref<HTMLInputElement>()

// Computed
const tags = computed(() => props.value || [])

const canAddMoreTags = computed(() => {
  return tags.value.length < props.maxTags
})

/**
 * Add a tag to the list
 */
function addTag(tag: string) {
  const trimmedTag = tag.trim()
  
  if (!trimmedTag) return
  if (!canAddMoreTags.value) return
  if (!props.allowDuplicates && tags.value.includes(trimmedTag)) return
  
  const newTags = [...tags.value, trimmedTag]
  emit('update:value', newTags)
}

/**
 * Remove a tag by index
 */
function removeTag(index: number) {
  const newTags = tags.value.filter((_, i) => i !== index)
  emit('update:value', newTags)
}

/**
 * Add the current input value as a tag
 */
function addCurrentTag() {
  if (inputValue.value) {
    addTag(inputValue.value)
    inputValue.value = ''
  }
}

/**
 * Handle keyboard events
 */
function handleKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case 'Enter':
    case 'Tab':
    case ',':
      event.preventDefault()
      addCurrentTag()
      break
      
    case 'Backspace':
      if (!inputValue.value && tags.value.length > 0) {
        // Remove last tag if input is empty
        removeTag(tags.value.length - 1)
      }
      break
  }
}

/**
 * Handle input blur
 */
function handleBlur() {
  // Add current input as tag on blur if not empty
  nextTick(() => {
    addCurrentTag()
  })
}

/**
 * Focus the input
 */
function focus() {
  inputRef.value?.focus()
}

// Expose focus method for parent components
defineExpose({
  focus
})
</script>

<style scoped>
.tag-input {
  width: 100%;
}
</style>