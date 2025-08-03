/**
 * Enhanced Resource Types for Admin Management System
 * 
 * TypeScript interfaces for the 6 comprehensive resource types including
 * the new Video and VD SharePoint Folder types with rich metadata support.
 */

// Base interfaces from existing system
export interface BaseEntity {
  id: number
  insertedAt: Date
  updatedAt: Date
  insertedById?: number
  lastUpdatedById?: number
  isDeleted: boolean
}

export interface CommonResourceMetadata {
  name: string
  description?: string
  tags?: string[]
  categories?: string[]
  entityType: 'offering' | 'outcome' | 'component'
  entityId: number
  accessLevel: 'public' | 'restricted' | 'private'
  viewCount: number
  lastAccessedAt?: Date
  author?: string
  lastModified?: Date
}

// Enhanced Document Resource (extends existing)
export interface EnhancedDocumentResource extends BaseEntity {
  name: string
  description?: string
  url: string
  
  // File properties
  fileName: string
  fileSize: number
  mimeType: string
  checksum?: string
  
  // Content metadata
  pageCount?: number
  wordCount?: number
  language?: string
  
  // Version control
  version: string
  versionHistory?: DocumentVersion[]
  isLatestVersion: boolean
  
  // Classification
  documentType?: 'template' | 'form' | 'guide' | 'policy' | 'other'
  confidentialityLevel?: 'public' | 'internal' | 'confidential' | 'restricted'
  
  // Analytics
  downloadCount: number
  printCount: number
  shareCount: number
  
  metadata: CommonResourceMetadata & {
    previewUrl?: string
    thumbnailUrl?: string
    fullTextContent?: string
  }
}

export interface DocumentVersion {
  version: string
  createdAt: Date
  createdById: number
  changesSummary?: string
  url: string
}

// Enhanced URL Resource (extends existing)
export interface EnhancedUrlResource extends BaseEntity {
  name: string
  description?: string
  url: string
  
  // URL properties
  title?: string
  favicon?: string
  screenshot?: string
  
  // Classification
  urlType?: 'website' | 'document' | 'video' | 'form' | 'api' | 'other'
  domain: string
  isExternal: boolean
  
  // Health checking
  isActive: boolean
  lastChecked?: Date
  httpStatus?: number
  responseTime?: number
  
  // Content metadata
  pageTitle?: string
  metaDescription?: string
  keywords?: string[]
  
  // Analytics
  clickCount: number
  uniqueVisitors: number
  averageTimeOnSite?: number
  
  metadata: CommonResourceMetadata & {
    contentType?: string
    lastValidated?: Date
  }
}

// Enhanced Form Resource (Syntaq Integration)
export interface EnhancedFormResource extends BaseEntity {
  name: string
  description?: string
  syntaqFormId: string
  formCategory?: string
  
  // Form configuration
  formVersion: string
  isPublished: boolean
  publishedAt?: Date
  
  // Structure
  fieldCount: number
  requiredFieldCount: number
  estimatedCompletionTime?: number
  
  // Analytics
  submissionCount: number
  averageCompletionTime?: number
  abandonmentRate?: number
  mostCommonExitField?: string
  
  // Integration
  crmIntegration?: boolean
  webhookUrl?: string
  apiEndpoint?: string
  
  // Compliance
  gdprCompliant: boolean
  dataRetentionPeriod?: number
  consentRequired: boolean
  
  metadata: CommonResourceMetadata & {
    formStructure?: any
    validationRules?: any
  }
}

// Enhanced Email Template Resource (extends existing)
export interface EnhancedEmailTemplateResource extends BaseEntity {
  name: string
  description?: string
  subject: string
  htmlContent: string
  plainTextContent?: string
  offeringCategory?: string
  
  // Classification
  templateType?: 'notification' | 'marketing' | 'legal' | 'system' | 'other'
  purpose?: string
  
  // Variables
  variables: EmailVariable[]
  requiredVariables: string[]
  optionalVariables: string[]
  
  // Performance
  sendCount: number
  openRate?: number
  clickRate?: number
  bounceRate?: number
  
  // Compliance
  includesUnsubscribe: boolean
  gdprCompliant: boolean
  canSpamCompliant: boolean
  
  metadata: CommonResourceMetadata & {
    previewUrl?: string
    testRecipients?: string[]
  }
}

export interface EmailVariable {
  name: string
  type: 'text' | 'number' | 'date' | 'boolean'
  defaultValue?: any
  required: boolean
  description?: string
}

// VD SharePoint Folder Resource (NEW)
export interface VDSharePointFolderResource extends BaseEntity {
  name: string
  description?: string
  
  // SharePoint integration
  sharePointSiteUrl: string
  sharePointFolderId: string
  sharePointFolderPath: string
  
  // Folder structure
  parentFolderId?: string
  subfolderCount: number
  totalItemCount: number
  totalSize: number
  
  // Synchronization
  lastSyncAt?: Date
  syncStatus: 'synced' | 'syncing' | 'error' | 'never_synced'
  syncErrors?: string[]
  
  // Permissions
  sharePointPermissions: SharePointPermission[]
  inheritPermissions: boolean
  
  // Analytics
  accessCount: number
  uniqueAccessors: number
  mostAccessedFiles?: string[]
  
  metadata: CommonResourceMetadata & {
    sharePointMetadata?: any
    folderStructure?: any
  }
}

export interface SharePointPermission {
  userId: number
  permissionLevel: 'read' | 'edit' | 'full_control'
  grantedAt: Date
  grantedById: number
}

// Video Resource (NEW)
export interface VideoResource extends BaseEntity {
  name: string
  description?: string
  
  // Video properties
  fileName?: string
  fileSize?: number
  duration: number
  format: string
  resolution: string
  
  // Classification
  videoType?: 'training' | 'presentation' | 'tutorial' | 'meeting' | 'other'
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  audience?: string[]
  
  // Content organization
  chapters: VideoChapter[]
  topics: string[]
  learningObjectives?: string[]
  
  // Hosting
  hostingPlatform: 'youtube' | 'vimeo' | 'azure_media' | 'local'
  videoUrl: string
  thumbnailUrl?: string
  embedCode?: string
  
  // Accessibility
  hasSubtitles: boolean
  subtitleLanguages: string[]
  hasTranscript: boolean
  transcriptUrl?: string
  
  // Analytics
  viewCount: number
  uniqueViewers: number
  averageWatchTime?: number
  completionRate?: number
  
  metadata: CommonResourceMetadata & {
    videoMetadata?: any
    platformMetadata?: any
  }
}

export interface VideoChapter {
  id: string
  title: string
  startTime: number
  endTime: number
  description?: string
  thumbnailUrl?: string
}

// Discriminated Union for Type Safety
export type Resource = 
  | (EnhancedDocumentResource & { type: 'document' })
  | (EnhancedUrlResource & { type: 'url' })
  | (EnhancedFormResource & { type: 'form' })
  | (EnhancedEmailTemplateResource & { type: 'emailTemplate' })
  | (VDSharePointFolderResource & { type: 'vdFolder' })
  | (VideoResource & { type: 'video' })

// Resource Creation Types (for forms)
export type CreateDocumentResource = Omit<EnhancedDocumentResource, keyof BaseEntity | 'downloadCount' | 'printCount' | 'shareCount' | 'viewCount'>
export type CreateUrlResource = Omit<EnhancedUrlResource, keyof BaseEntity | 'clickCount' | 'uniqueVisitors' | 'viewCount'>
export type CreateFormResource = Omit<EnhancedFormResource, keyof BaseEntity | 'submissionCount' | 'viewCount'>
export type CreateEmailTemplateResource = Omit<EnhancedEmailTemplateResource, keyof BaseEntity | 'sendCount' | 'viewCount'>
export type CreateVDFolderResource = Omit<VDSharePointFolderResource, keyof BaseEntity | 'accessCount' | 'uniqueAccessors' | 'viewCount'>
export type CreateVideoResource = Omit<VideoResource, keyof BaseEntity | 'viewCount' | 'uniqueViewers'>

export type CreateResource = 
  | (CreateDocumentResource & { type: 'document' })
  | (CreateUrlResource & { type: 'url' })
  | (CreateFormResource & { type: 'form' })
  | (CreateEmailTemplateResource & { type: 'emailTemplate' })
  | (CreateVDFolderResource & { type: 'vdFolder' })
  | (CreateVideoResource & { type: 'video' })

// Export ResourceType for easier usage
export type ResourceType = Resource['type']

// Filter and Search Types
export interface ResourceFilters {
  resourceTypes: string[]
  accessLevels: string[]
  categories: string[]
  tags: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  authors: string[]
}

export interface ResourceSorting {
  field: string
  direction: 'asc' | 'desc'
}

export interface ResourceSearchParams {
  query?: string
  filters?: ResourceFilters
  sorting?: ResourceSorting
  pagination?: {
    page: number
    pageSize: number
  }
}

// API Response Types
export interface ResourceListResponse {
  resources: Resource[]
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
  }
  filters?: ResourceFilters
  sorting?: ResourceSorting
}

export interface ResourceResponse {
  resource: Resource
  associations?: ResourceAssociation[]
  permissions?: ResourcePermission[]
  analytics?: ResourceAnalytics
}

export interface ResourceAssociation {
  entityType: 'offering' | 'outcome' | 'component' | 'matter' | 'project'
  entityId: number
  entityName: string
  associatedAt: Date
  associatedById: number
}

export interface ResourcePermission {
  userId: number
  userName: string
  permissionLevel: 'read' | 'edit' | 'admin'
  grantedAt: Date
  grantedById: number
}

export interface ResourceAnalytics {
  totalViews: number
  uniqueUsers: number
  averageEngagementTime?: number
  peakUsageTime?: Date
  geographicDistribution?: { [country: string]: number }
  deviceDistribution?: { [device: string]: number }
}