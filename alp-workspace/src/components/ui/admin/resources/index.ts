/**
 * Admin Resources Management System
 * 
 * Export all components, composables, and utilities for the
 * enhanced resource management system.
 */

// Configuration
export * from './config/resourceConfigs'

// Composables
export * from './composables'

// Core Components
export { default as ResourceListPage } from './components/ResourceListPage.vue'
export { default as ResourceAddModal } from './components/ResourceAddModal.vue'
export { default as ResourceEditModal } from './components/ResourceEditModal.vue'
export { default as ResourceEditDrawer } from './components/ResourceEditDrawer.vue'
export { default as TagInput } from './components/TagInput.vue'

// Page Components
export * from './pages'

// Cell Components (TODO: Will be added in Phase 3)
export * from './components/cells'

// Config Components (TODO: Will be added in Phase 3)
export * from './components/config'

// Types (re-export specific types to avoid conflicts)
export type { 
  Resource, 
  CreateResource,
  ResourceFilters, 
  ResourceSorting, 
  ResourceSearchParams,
  ResourceListResponse,
  ResourceResponse 
} from '@/alp-types/admin-resources.types'