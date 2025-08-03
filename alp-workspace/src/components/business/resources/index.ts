/**
 * Portal Resources Components
 * 
 * Export all resource management components for easy importing
 */

export { default as MatterResourcesTab } from './MatterResourcesTab.vue'
export { default as ResourceCard } from './ResourceCard.vue'
export { default as VDOfferingFolder } from './VDOfferingFolder.vue'
export { default as ResourceFilters } from './ResourceFilters.vue'
export { default as ResourceHierarchy } from './ResourceHierarchy.vue'
export { default as ResourceModal } from './ResourceModal.vue'

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