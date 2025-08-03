/**
 * Resource Configuration System
 * 
 * Configuration-driven approach for the admin resource management system.
 * This single configuration object drives all component behavior for maximum reusability.
 */

import { 
  FileText, 
  Link, 
  FormInput, 
  Mail, 
  FolderOpen, 
  Video,
  type LucideIcon 
} from 'lucide-vue-next'
import type { ResourceType as ResourceTypeBase } from '@/alp-types/admin-resources.types'

export interface ResourceTableColumn {
  key: string
  label: string
  component?: string
  width?: string
  sortable?: boolean
}

export interface ResourceConfig {
  label: string
  pluralLabel: string
  icon: LucideIcon
  description: string
  configComponent: string
  tableColumns: ResourceTableColumn[]
  actions: string[]
  searchPlaceholder: string
  emptyStateMessage: string
}

export type ResourceType = ResourceTypeBase

/**
 * Configuration object that drives all resource management components
 */
export const resourceConfigs: Record<ResourceType, ResourceConfig> = {
  document: {
    label: 'Document',
    pluralLabel: 'Documents',
    icon: FileText,
    description: 'PDF, Word, and other document files with version control',
    configComponent: 'DocumentConfig',
    searchPlaceholder: 'Search documents by name, content, or tags...',
    emptyStateMessage: 'No documents found. Upload your first document to get started.',
    tableColumns: [
      { key: 'name', label: 'Name', sortable: true },
      { key: 'description', label: 'Description' },
      { key: 'fileSize', label: 'Size', component: 'FileSizeCell', width: '100px' },
      { key: 'metadata.mimeType', label: 'Type', width: '120px' },
      { key: 'metadata.lastModified', label: 'Modified', component: 'DateCell', width: '150px', sortable: true },
      { key: 'metadata.author', label: 'Author', width: '120px' },
      { key: 'metadata.tags', label: 'Tags', component: 'TagsCell' }
    ],
    actions: ['preview', 'download', 'edit', 'duplicate', 'delete']
  },

  url: {
    label: 'URL',
    pluralLabel: 'URLs',
    icon: Link,
    description: 'Web links and external resources with health monitoring',
    configComponent: 'UrlConfig',
    searchPlaceholder: 'Search URLs by name, domain, or tags...',
    emptyStateMessage: 'No URLs found. Add your first web resource to get started.',
    tableColumns: [
      { key: 'name', label: 'Name', sortable: true },
      { key: 'description', label: 'Description' },
      { key: 'url', label: 'URL', component: 'LinkCell' },
      { key: 'metadata.domain', label: 'Domain', width: '150px' },
      { key: 'metadata.isActive', label: 'Status', component: 'StatusCell', width: '100px' },
      { key: 'metadata.lastModified', label: 'Modified', component: 'DateCell', width: '150px', sortable: true },
      { key: 'metadata.tags', label: 'Tags', component: 'TagsCell' }
    ],
    actions: ['open', 'preview', 'edit', 'duplicate', 'delete']
  },

  form: {
    label: 'Form',
    pluralLabel: 'Forms',
    icon: FormInput,
    description: 'Syntaq forms and data collection with analytics',
    configComponent: 'FormConfig',
    searchPlaceholder: 'Search forms by name, category, or tags...',
    emptyStateMessage: 'No forms found. Create your first form to get started.',
    tableColumns: [
      { key: 'name', label: 'Name', sortable: true },
      { key: 'description', label: 'Description' },
      { key: 'formCategory', label: 'Category', width: '150px' },
      { key: 'metadata.isPublished', label: 'Status', component: 'PublishStatusCell', width: '100px' },
      { key: 'submissionCount', label: 'Submissions', component: 'NumberCell', width: '120px', sortable: true },
      { key: 'metadata.lastModified', label: 'Modified', component: 'DateCell', width: '150px', sortable: true },
      { key: 'metadata.tags', label: 'Tags', component: 'TagsCell' }
    ],
    actions: ['open', 'preview', 'edit', 'duplicate', 'delete']
  },

  emailTemplate: {
    label: 'Email Template',
    pluralLabel: 'Email Templates',
    icon: Mail,
    description: 'Email templates and communications with variable support',
    configComponent: 'EmailTemplateConfig',
    searchPlaceholder: 'Search email templates by name, subject, or tags...',
    emptyStateMessage: 'No email templates found. Create your first template to get started.',
    tableColumns: [
      { key: 'name', label: 'Name', sortable: true },
      { key: 'subject', label: 'Subject' },
      { key: 'offeringCategory', label: 'Category', width: '150px' },
      { key: 'metadata.templateType', label: 'Type', width: '120px' },
      { key: 'sendCount', label: 'Uses', component: 'NumberCell', width: '100px', sortable: true },
      { key: 'metadata.lastModified', label: 'Modified', component: 'DateCell', width: '150px', sortable: true },
      { key: 'metadata.tags', label: 'Tags', component: 'TagsCell' }
    ],
    actions: ['preview', 'edit', 'duplicate', 'delete']
  },

  vdFolder: {
    label: 'VD Folder',
    pluralLabel: 'VD Folders',
    icon: FolderOpen,
    description: 'SharePoint folders and document collections with sync',
    configComponent: 'VDFolderConfig',
    searchPlaceholder: 'Search VD folders by name, path, or tags...',
    emptyStateMessage: 'No VD folders found. Connect your first SharePoint folder to get started.',
    tableColumns: [
      { key: 'name', label: 'Name', sortable: true },
      { key: 'description', label: 'Description' },
      { key: 'folderPath', label: 'SharePoint Path', component: 'PathCell' },
      { key: 'syncStatus', label: 'Sync Status', component: 'StatusCell', width: '120px' },
      { key: 'totalItemCount', label: 'Items', component: 'NumberCell', width: '80px', sortable: true },
      { key: 'metadata.lastSyncAt', label: 'Last Sync', component: 'DateCell', width: '150px', sortable: true },
      { key: 'metadata.tags', label: 'Tags', component: 'TagsCell' }
    ],
    actions: ['open', 'sync', 'edit', 'duplicate', 'delete']
  },

  video: {
    label: 'Video',
    pluralLabel: 'Videos',
    icon: Video,
    description: 'Training videos and multimedia content with chapters',
    configComponent: 'VideoConfig',
    searchPlaceholder: 'Search videos by name, topic, or tags...',
    emptyStateMessage: 'No videos found. Upload your first video to get started.',
    tableColumns: [
      { key: 'name', label: 'Name', sortable: true },
      { key: 'description', label: 'Description' },
      { key: 'duration', label: 'Duration', component: 'DurationCell', width: '100px' },
      { key: 'resolution', label: 'Quality', width: '100px' },
      { key: 'viewCount', label: 'Views', component: 'NumberCell', width: '80px', sortable: true },
      { key: 'metadata.lastModified', label: 'Modified', component: 'DateCell', width: '150px', sortable: true },
      { key: 'metadata.tags', label: 'Tags', component: 'TagsCell' }
    ],
    actions: ['play', 'preview', 'edit', 'duplicate', 'delete']
  }
}

/**
 * Helper function to get config by resource type
 */
export function getResourceConfig(resourceType: ResourceType): ResourceConfig {
  const config = resourceConfigs[resourceType]
  if (!config) {
    throw new Error(`Unknown resource type: ${resourceType}`)
  }
  return config
}

/**
 * All resource types as array for iteration
 */
export const resourceTypes: ResourceType[] = Object.keys(resourceConfigs) as ResourceType[]

/**
 * Get all available actions across all resource types
 */
export function getAllActions(): string[] {
  const actions = new Set<string>()
  Object.values(resourceConfigs).forEach(config => {
    config.actions.forEach(action => actions.add(action))
  })
  return Array.from(actions).sort()
}

/**
 * Get resource type from string with validation
 */
export function validateResourceType(type: string): ResourceType {
  if (!resourceTypes.includes(type as ResourceType)) {
    throw new Error(`Invalid resource type: ${type}`)
  }
  return type as ResourceType
}