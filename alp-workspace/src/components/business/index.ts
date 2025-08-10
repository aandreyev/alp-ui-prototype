/**
 * Portal Resources Components
 * 
 * Export all resource management components for easy importing
 */

export { default as ResourceCard } from './resource-matters/ResourceCard.vue'
export { default as ResourceFilters } from './resource-matters/ResourceFilters.vue'

// Re-export types for convenience
export type {
  Resource,
  ResourceType,
  ResourceMetadata,
  Offering,
  OfferingElement,
  MatterElement,
  MatterElementWithResources,
  OfferingWithResources,
  ResourceFilterState,
  ResourceActionType,
  ResourceError
} from '@/alp-types/resources.types'