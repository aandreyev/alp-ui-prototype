/**
 * Resource Types for Portal Resources System
 * 
 * Defines the TypeScript interfaces for the resource management system
 * following the simplified data layer approach where matter elements 
 * fetch resources from their linked offering elements.
 */

export type ResourceType = 'form' | 'document' | 'url' | 'template'

export interface Resource {
  id: string
  name: string
  description?: string
  type: ResourceType
  url?: string
  filePath?: string
  metadata: ResourceMetadata
  createdAt: string
  updatedAt: string
}

export interface ResourceMetadata {
  fileSize?: number
  mimeType?: string
  tags?: string[]
  author?: string
  version?: string
  lastModified?: string
}

export interface Offering {
  id: string
  name: string
  description: string
  vdFolderUrl?: string
  createdAt: string
  updatedAt: string
}

export interface OfferingElement {
  id: string
  offeringId: string
  type: 'outcome' | 'component'
  name: string
  description?: string
  parentId?: string
  sequence: number
  createdAt: string
  updatedAt: string
}

export interface MatterElement {
  id: string
  matterId: string
  type: 'outcome' | 'component'
  name: string
  description?: string
  parentId?: string
  sequence: number
  linkedOfferingElementId?: string // Current offering element ID (updated by background process)
  createdAt: string
}

export interface OfferingResource {
  offeringElementId: string
  resources: Resource[]
}

// UI Display Types
export interface MatterElementWithResources extends MatterElement {
  resources: Resource[]
  children?: MatterElementWithResources[]
}

export interface OfferingWithResources {
  offering: Offering
  outcomes: MatterElementWithResources[]
}

// Filter and Display Types
export interface ResourceFilterState {
  type: ResourceType | 'all'
  level: 'offering' | 'outcome' | 'component' | 'all'
  search: string
}

export interface ResourceActionType {
  key: 'preview' | 'open' | 'copy' | 'download'
  label: string
  icon: string
  primary?: boolean
}

// Error Types
export interface ResourceError {
  type: 'NETWORK_ERROR' | 'PERMISSION_DENIED' | 'RESOURCE_NOT_FOUND' | 'EXTERNAL_LINK_FAILED'
  message: string
  url?: string
  originalError?: Error
}