/**
 * useResourceValidation Composable
 * 
 * Shared validation logic for resource forms.
 * Provides validation rules, error handling, and validation utilities.
 */

import { ref, computed } from 'vue'
import type { CreateResource, ResourceType } from '@/alp-types/admin-resources.types'

export interface ValidationRule {
  validator: (value: any, resource?: CreateResource) => boolean | Promise<boolean>
  message: string
  required?: boolean
}

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
  warnings: Record<string, string>
}

export function useResourceValidation() {
  const validationErrors = ref<Record<string, string>>({})
  const validationWarnings = ref<Record<string, string>>({})
  const isValidating = ref(false)

  const hasErrors = computed(() => Object.keys(validationErrors.value).length > 0)
  const hasWarnings = computed(() => Object.keys(validationWarnings.value).length > 0)
  const isValid = computed(() => !hasErrors.value)

  /**
   * Common validation rules
   */
  const commonRules = {
    required: (message = 'This field is required'): ValidationRule => ({
      validator: (value) => {
        if (typeof value === 'string') return value.trim().length > 0
        return value !== null && value !== undefined
      },
      message,
      required: true
    }),

    minLength: (min: number, message?: string): ValidationRule => ({
      validator: (value) => {
        if (typeof value !== 'string') return true
        return value.length >= min
      },
      message: message || `Must be at least ${min} characters`
    }),

    maxLength: (max: number, message?: string): ValidationRule => ({
      validator: (value) => {
        if (typeof value !== 'string') return true
        return value.length <= max
      },
      message: message || `Must be no more than ${max} characters`
    }),

    url: (message = 'Please enter a valid URL'): ValidationRule => ({
      validator: (value) => {
        if (!value) return true
        try {
          new URL(value)
          return true
        } catch {
          return false
        }
      },
      message
    }),

    email: (message = 'Please enter a valid email address'): ValidationRule => ({
      validator: (value) => {
        if (!value) return true
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(value)
      },
      message
    }),

    fileSize: (maxSizeBytes: number, message?: string): ValidationRule => ({
      validator: (value) => {
        if (typeof value !== 'number') return true
        return value <= maxSizeBytes
      },
      message: message || `File size must be less than ${formatFileSize(maxSizeBytes)}`
    }),

    mimeType: (allowedTypes: string[], message?: string): ValidationRule => ({
      validator: (value) => {
        if (!value) return true
        return allowedTypes.includes(value)
      },
      message: message || `File type must be one of: ${allowedTypes.join(', ')}`
    })
  }

  /**
   * Resource type specific validation schemas
   */
  const validationSchemas: Record<ResourceType, Record<string, ValidationRule[]>> = {
    document: {
      name: [
        commonRules.required('Document name is required'),
        commonRules.maxLength(255)
      ],
      fileName: [
        commonRules.required('File name is required'),
        commonRules.maxLength(255)
      ],
      fileSize: [
        commonRules.fileSize(100 * 1024 * 1024, 'File size must be less than 100MB')
      ],
      mimeType: [
        commonRules.mimeType([
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain'
        ], 'Only PDF, Word, and text files are allowed')
      ],
      description: [
        commonRules.maxLength(1000)
      ]
    },

    url: {
      name: [
        commonRules.required('URL name is required'),
        commonRules.maxLength(255)
      ],
      url: [
        commonRules.required('URL is required'),
        commonRules.url()
      ],
      description: [
        commonRules.maxLength(1000)
      ]
    },

    form: {
      name: [
        commonRules.required('Form name is required'),
        commonRules.maxLength(255)
      ],
      syntaqFormId: [
        commonRules.required('Syntaq Form ID is required'),
        commonRules.maxLength(50)
      ],
      description: [
        commonRules.maxLength(1000)
      ]
    },

    emailTemplate: {
      name: [
        commonRules.required('Template name is required'),
        commonRules.maxLength(255)
      ],
      subject: [
        commonRules.required('Email subject is required'),
        commonRules.maxLength(255)
      ],
      htmlContent: [
        commonRules.required('Email content is required'),
        commonRules.minLength(10, 'Email content must be at least 10 characters')
      ],
      description: [
        commonRules.maxLength(1000)
      ]
    },

    vdFolder: {
      name: [
        commonRules.required('Folder name is required'),
        commonRules.maxLength(255)
      ],
      sharePointSiteUrl: [
        commonRules.required('SharePoint site URL is required'),
        commonRules.url('Please enter a valid SharePoint URL')
      ],
      sharePointFolderPath: [
        commonRules.required('SharePoint folder path is required'),
        commonRules.maxLength(500)
      ],
      description: [
        commonRules.maxLength(1000)
      ]
    },

    video: {
      name: [
        commonRules.required('Video name is required'),
        commonRules.maxLength(255)
      ],
      videoUrl: [
        commonRules.required('Video URL is required'),
        commonRules.url()
      ],
      duration: [
        {
          validator: (value) => typeof value === 'number' && value > 0,
          message: 'Duration must be greater than 0 seconds'
        }
      ],
      description: [
        commonRules.maxLength(1000)
      ]
    }
  }

  /**
   * Validate a single field
   */
  async function validateField(
    fieldPath: string, 
    value: any, 
    resourceType: ResourceType,
    resource?: CreateResource
  ): Promise<boolean> {
    const schema = validationSchemas[resourceType]
    const rules = schema[fieldPath]

    if (!rules) return true

    // Clear existing errors for this field
    delete validationErrors.value[fieldPath]
    delete validationWarnings.value[fieldPath]

    for (const rule of rules) {
      try {
        const isValid = await rule.validator(value, resource)
        if (!isValid) {
          validationErrors.value[fieldPath] = rule.message
          return false
        }
      } catch (error) {
        validationErrors.value[fieldPath] = 'Validation error occurred'
        return false
      }
    }

    return true
  }

  /**
   * Validate entire resource
   */
  async function validateResource(resource: CreateResource): Promise<ValidationResult> {
    isValidating.value = true
    
    try {
      const schema = validationSchemas[resource.type]
      const errors: Record<string, string> = {}
      const warnings: Record<string, string> = {}

      // Validate all fields in schema
      for (const [fieldPath, rules] of Object.entries(schema)) {
        const value = getFieldValue(resource, fieldPath)
        
        for (const rule of rules) {
          try {
            const isValid = await rule.validator(value, resource)
            if (!isValid) {
              errors[fieldPath] = rule.message
              break // Stop at first error for this field
            }
          } catch (error) {
            errors[fieldPath] = 'Validation error occurred'
            break
          }
        }
      }

      // Add business logic validations
      await addBusinessValidations(resource, errors, warnings)

      // Update reactive state
      validationErrors.value = errors
      validationWarnings.value = warnings

      return {
        isValid: Object.keys(errors).length === 0,
        errors,
        warnings
      }
    } finally {
      isValidating.value = false
    }
  }

  /**
   * Clear all validation errors
   */
  function clearValidation() {
    validationErrors.value = {}
    validationWarnings.value = {}
  }

  /**
   * Clear validation for specific field
   */
  function clearFieldValidation(fieldPath: string) {
    delete validationErrors.value[fieldPath]
    delete validationWarnings.value[fieldPath]
  }

  /**
   * Get validation error for field
   */
  function getFieldError(fieldPath: string): string | undefined {
    return validationErrors.value[fieldPath]
  }

  /**
   * Get validation warning for field
   */
  function getFieldWarning(fieldPath: string): string | undefined {
    return validationWarnings.value[fieldPath]
  }

  /**
   * Check if field has error
   */
  function hasFieldError(fieldPath: string): boolean {
    return fieldPath in validationErrors.value
  }

  /**
   * Check if field has warning
   */
  function hasFieldWarning(fieldPath: string): boolean {
    return fieldPath in validationWarnings.value
  }

  return {
    // State
    validationErrors,
    validationWarnings,
    isValidating,
    
    // Computed
    hasErrors,
    hasWarnings,
    isValid,
    
    // Actions
    validateField,
    validateResource,
    clearValidation,
    clearFieldValidation,
    
    // Getters
    getFieldError,
    getFieldWarning,
    hasFieldError,
    hasFieldWarning,
    
    // Rules
    commonRules
  }
}

/**
 * Helper function to get nested field value
 */
function getFieldValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

/**
 * Add business logic validations
 */
async function addBusinessValidations(
  resource: CreateResource,
  errors: Record<string, string>,
  warnings: Record<string, string>
) {
  // Example business validations
  switch (resource.type) {
    case 'document':
      // Check for duplicate file names (example)
      if (resource.fileName && await isDuplicateFileName(resource.fileName)) {
        warnings.fileName = 'A document with this filename already exists'
      }
      break
      
    case 'url':
      // Check if URL is accessible (example)
      if (resource.url && await isUrlAccessible(resource.url)) {
        warnings.url = 'URL appears to be inaccessible'
      }
      break
      
    case 'emailTemplate':
      // Check for required variables in content
      if (resource.htmlContent && resource.requiredVariables) {
        const missingVars = resource.requiredVariables.filter(
          variable => !resource.htmlContent?.includes(`{{${variable}}}`)
        )
        if (missingVars.length > 0) {
          warnings.htmlContent = `Missing required variables: ${missingVars.join(', ')}`
        }
      }
      break
  }
}

/**
 * File size formatting utility
 */
function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`
}

/**
 * Mock business validation functions - Replace with actual implementations
 */
async function isDuplicateFileName(fileName: string): Promise<boolean> {
  // TODO: Replace with actual API call
  await new Promise(resolve => setTimeout(resolve, 100))
  return false
}

async function isUrlAccessible(url: string): Promise<boolean> {
  // TODO: Replace with actual URL health check
  await new Promise(resolve => setTimeout(resolve, 200))
  return Math.random() > 0.8 // Random example
}