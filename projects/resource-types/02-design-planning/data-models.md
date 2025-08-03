# Data Models & TypeScript Interfaces

**Document Purpose**: Define comprehensive TypeScript interfaces and data structures for the enhanced resource type system, based on Phase 1 Resource Field Analysis.

---

## Base Interfaces

### Core Entity Types

```typescript
// Base entity interface (from ALP BaseEntity)
interface BaseEntity {
  id: number
  insertedAt: Date
  updatedAt: Date
  insertedById?: number
  lastUpdatedById?: number
  isDeleted: boolean
  insertedBy?: User
  lastUpdatedBy?: User
}

// Common resource metadata (from Phase 1 analysis)
interface CommonResourceMetadata {
  // Basic Information
  name: string
  description?: string
  
  // Classification
  tags?: string[]
  categories?: string[]
  
  // Association Context
  entityType: 'offering' | 'outcome' | 'component'
  entityId: number
  
  // Access Control
  accessLevel: 'public' | 'restricted' | 'private'
  permissions?: ResourcePermission[]
  
  // Usage Tracking
  viewCount: number
  lastAccessedAt?: Date
  lastAccessedBy?: number
}

// Resource association metadata
interface ResourceAssociation {
  entityType: 'offering' | 'outcome' | 'component'
  entityId: number
  associationType: 'direct' | 'inherited' | 'copied'
  associatedAt: Date
  associatedBy: number
  displayOrder: number
  isVisible: boolean
  isFeatured: boolean
  contextNotes?: string
  contextTags?: string[]
  usageCount: number
  lastUsedAt?: Date
  lastUsedBy?: number
}
```

---

## Resource Type Interfaces

### 1. Document Resource

```typescript
// Current ALP Document interface (from analysis)
interface DocumentResource extends BaseEntity {
  // File Information
  fileName: string
  fileExtension: string
  
  // Document Management
  editingIdentifier?: string
  lockedByUserId?: number
  lockedByUser?: User
  
  // Content Analysis
  extractedText?: string
  extractedTextSearchVector?: any // PostgreSQL full-text search
  
  // Dynamic Metadata
  dynamicParameterValues?: DocumentDynamicParameterValue[]
}

// Enhanced Document interface
interface EnhancedDocumentResource extends DocumentResource, CommonResourceMetadata {
  // File Properties
  fileSize: number
  mimeType: string
  checksum: string
  
  // Version Control
  version: string
  versionHistory?: DocumentVersion[]
  isLatestVersion: boolean
  
  // Document Classification
  documentType: 'template' | 'contract' | 'form' | 'letter' | 'report' | 'other'
  confidentialityLevel: 'public' | 'internal' | 'confidential' | 'restricted'
  
  // Content Metadata
  pageCount?: number
  wordCount?: number
  language?: string
  
  // Storage Information
  storageLocation: string
  storageProvider: 'azure' | 'local' | 'sharepoint'
  
  // Review and Approval
  reviewStatus: 'draft' | 'review' | 'approved' | 'archived'
  reviewedBy?: number
  reviewedAt?: Date
  approvedBy?: number
  approvedAt?: Date
  
  // Usage Analytics
  downloadCount: number
  printCount: number
  shareCount: number
}

// Supporting interfaces
interface DocumentVersion {
  id: number
  version: string
  fileName: string
  fileSize: number
  uploadedAt: Date
  uploadedBy: number
  changeNotes?: string
}

interface DocumentDynamicParameterValue {
  id: number
  parameterId: number
  value: string
  parameter?: DocumentDynamicParameter
}
```

### 2. URL Resource

```typescript
// Current ALP URL interface (from analysis)
interface UrlResource extends BaseEntity {
  name: string
  description?: string
  url: string
  dynamicParameterValues?: ResourceUrlDynamicParameterValue[]
}

// Enhanced URL interface
interface EnhancedUrlResource extends UrlResource, CommonResourceMetadata {
  // URL Properties
  title?: string // Extracted from page
  favicon?: string
  screenshot?: string
  
  // URL Classification
  urlType: 'website' | 'document' | 'video' | 'form' | 'tool' | 'reference'
  domain: string
  isExternal: boolean
  
  // Validation and Health
  isActive: boolean
  lastChecked?: Date
  httpStatus?: number
  responseTime?: number
  
  // Content Metadata
  pageTitle?: string
  metaDescription?: string
  keywords?: string[]
  
  // Access Requirements
  requiresLogin: boolean
  requiresVPN: boolean
  accessInstructions?: string
  
  // Usage Analytics
  clickCount: number
  uniqueVisitors: number
  averageTimeOnSite?: number
  
  // SEO and Social
  openGraphImage?: string
  twitterCard?: string
}
```

### 3. Form Resource (Syntaq Integration)

```typescript
// Current Syntaq Form interface (from analysis)
interface FormResource extends BaseEntity {
  // Syntaq Integration
  syntaqFormId: string
  syntaqFormName: string
  
  // Form Properties
  formType: string
  isActive: boolean
  
  // Classification
  category: 'marketing' | 'sales' | 'vd' | 'admin' | 'client'
  
  // Analytics
  submissionCount: number
  completionRate: number
  
  // Integration Data
  webhookUrl?: string
  apiEndpoint?: string
}

// Enhanced Form interface
interface EnhancedFormResource extends FormResource, CommonResourceMetadata {
  // Form Configuration
  formVersion: string
  isPublished: boolean
  publishedAt?: Date
  
  // Form Structure
  fieldCount: number
  requiredFieldCount: number
  estimatedCompletionTime: number // minutes
  
  // Submission Handling
  submissionEmailRecipients: string[]
  autoResponseEnabled: boolean
  autoResponseTemplate?: string
  
  // Validation Rules
  validationRules?: FormValidationRule[]
  customValidation?: string
  
  // Analytics and Performance
  averageCompletionTime: number
  abandonmentRate: number
  mostCommonExitField?: string
  
  // Integration Settings
  crmIntegration?: {
    enabled: boolean
    crmType: string
    mappingRules: any
  }
  
  // Compliance and Legal
  gdprCompliant: boolean
  dataRetentionPeriod: number // days
  consentRequired: boolean
}

// Supporting interfaces
interface FormValidationRule {
  fieldId: string
  ruleType: 'required' | 'email' | 'phone' | 'regex' | 'custom'
  rule: string
  errorMessage: string
}
```

### 4. Email Template Resource

```typescript
// Current ALP Email Template interface (from analysis)
interface EmailTemplateResource extends BaseEntity {
  name: string
  content: string
  offeringCategoryId?: number
  offeringCategory?: OfferingCategory
}

// Enhanced Email Template interface
interface EnhancedEmailTemplateResource extends EmailTemplateResource, CommonResourceMetadata {
  // Template Properties
  subject: string
  htmlContent: string
  plainTextContent?: string
  
  // Template Classification
  templateType: 'notification' | 'marketing' | 'transactional' | 'reminder' | 'welcome'
  purpose: string
  
  // Variable Management
  variables: TemplateVariable[]
  requiredVariables: string[]
  optionalVariables: string[]
  
  // Design and Layout
  templateEngine: 'handlebars' | 'mustache' | 'liquid'
  cssFramework?: string
  isResponsive: boolean
  
  // Usage and Performance
  sendCount: number
  openRate: number
  clickRate: number
  bounceRate: number
  
  // Compliance
  includesUnsubscribe: boolean
  gdprCompliant: boolean
  canSpamCompliant: boolean
  
  // Testing and Validation
  lastTested?: Date
  testResults?: EmailTestResult[]
  
  // Localization
  language: string
  localizedVersions?: LocalizedEmailTemplate[]
}

// Supporting interfaces
interface TemplateVariable {
  name: string
  type: 'string' | 'number' | 'date' | 'boolean'
  description: string
  defaultValue?: string
  isRequired: boolean
}

interface EmailTestResult {
  id: number
  testDate: Date
  testType: 'spam' | 'rendering' | 'links' | 'variables'
  result: 'pass' | 'fail' | 'warning'
  details: string
}

interface LocalizedEmailTemplate {
  language: string
  subject: string
  htmlContent: string
  plainTextContent?: string
}
```

### 5. VD SharePoint Folder Resource (New)

```typescript
interface VDSharePointFolderResource extends BaseEntity, CommonResourceMetadata {
  // SharePoint Integration
  sharePointSiteUrl: string
  sharePointFolderId: string
  sharePointFolderPath: string
  sharePointFolderName: string
  
  // Folder Properties
  folderType: 'matter' | 'project' | 'offering' | 'client' | 'template'
  isSystemGenerated: boolean
  
  // Folder Structure
  parentFolderId?: string
  subfolderCount: number
  totalItemCount: number
  totalSize: number // bytes
  
  // Content Metadata
  documentCount: number
  imageCount: number
  videoCount: number
  otherFileCount: number
  
  // Synchronization
  lastSyncAt?: Date
  syncStatus: 'synced' | 'pending' | 'error' | 'disabled'
  syncErrors?: string[]
  
  // Access and Permissions
  sharePointPermissions: SharePointPermission[]
  inheritPermissions: boolean
  isPubliclyAccessible: boolean
  
  // Folder Organization
  folderTemplate?: string
  autoOrganizationRules?: FolderOrganizationRule[]
  
  // Usage Analytics
  accessCount: number
  uniqueAccessors: number
  mostAccessedFiles?: string[]
  
  // Compliance and Retention
  retentionPolicy?: string
  retentionPeriod?: number // days
  complianceLabels?: string[]
  
  // Integration with ALP Entities
  linkedMatterId?: number
  linkedProjectId?: number
  linkedOfferingId?: number
  linkedClientId?: number
  
  // Folder Health
  brokenLinksCount: number
  duplicateFilesCount: number
  lastHealthCheck?: Date
}

// Supporting interfaces
interface SharePointPermission {
  principalId: string
  principalName: string
  principalType: 'user' | 'group'
  permissionLevel: 'read' | 'contribute' | 'edit' | 'fullControl'
  inherited: boolean
}

interface FolderOrganizationRule {
  ruleType: 'fileType' | 'dateCreated' | 'fileSize' | 'custom'
  condition: string
  action: 'move' | 'copy' | 'tag' | 'notify'
  targetLocation?: string
}
```

### 6. Video Resource (New)

```typescript
interface VideoResource extends BaseEntity, CommonResourceMetadata {
  // Video File Properties
  fileName: string
  fileSize: number
  duration: number // seconds
  format: string // mp4, avi, mov, etc.
  resolution: string // 1920x1080, 1280x720, etc.
  frameRate: number
  bitrate: number
  codec: string
  
  // Video Classification
  videoType: 'training' | 'presentation' | 'demo' | 'webinar' | 'tutorial' | 'marketing'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  audience: 'internal' | 'client' | 'public' | 'restricted'
  
  // Content Organization
  chapters: VideoChapter[]
  topics: string[]
  learningObjectives?: string[]
  prerequisites?: string[]
  
  // Hosting and Storage
  hostingPlatform: 'youtube' | 'vimeo' | 'azure' | 'local' | 'sharepoint'
  videoUrl: string
  thumbnailUrl?: string
  embedCode?: string
  
  // Accessibility
  hasSubtitles: boolean
  subtitleLanguages: string[]
  hasTranscript: boolean
  transcriptUrl?: string
  isAccessible: boolean
  
  // Quality and Processing
  processingStatus: 'uploaded' | 'processing' | 'ready' | 'error'
  qualityLevels: VideoQuality[]
  isStreamingReady: boolean
  
  // Usage Analytics
  viewCount: number
  uniqueViewers: number
  averageWatchTime: number // seconds
  completionRate: number // percentage
  engagementScore: number
  
  // Interactive Features
  hasQuiz: boolean
  quizQuestions?: VideoQuizQuestion[]
  hasNotes: boolean
  allowComments: boolean
  
  // Content Management
  isPublished: boolean
  publishedAt?: Date
  expiresAt?: Date
  contentRating?: string
  
  // SEO and Discovery
  seoTitle?: string
  seoDescription?: string
  keywords: string[]
  
  // Integration
  linkedDocuments?: number[]
  linkedForms?: number[]
  relatedVideos?: number[]
}

// Supporting interfaces
interface VideoChapter {
  id: string
  title: string
  startTime: number // seconds
  endTime: number // seconds
  description?: string
  thumbnailUrl?: string
}

interface VideoQuality {
  resolution: string
  bitrate: number
  fileSize: number
  url: string
}

interface VideoQuizQuestion {
  id: string
  timestamp: number // seconds
  question: string
  type: 'multiple-choice' | 'true-false' | 'text'
  options?: string[]
  correctAnswer: string
  explanation?: string
}
```

---

## Union Types and Discriminated Unions

### Resource Union Type

```typescript
// Discriminated union for all resource types
type Resource = 
  | (EnhancedDocumentResource & { type: 'document' })
  | (EnhancedUrlResource & { type: 'url' })
  | (EnhancedFormResource & { type: 'form' })
  | (EnhancedEmailTemplateResource & { type: 'emailTemplate' })
  | (VDSharePointFolderResource & { type: 'vdFolder' })
  | (VideoResource & { type: 'video' })

// Resource type enumeration
enum ResourceType {
  DOCUMENT = 'document',
  URL = 'url',
  FORM = 'form',
  EMAIL_TEMPLATE = 'emailTemplate',
  VD_FOLDER = 'vdFolder',
  VIDEO = 'video'
}

// Type guards for resource types
function isDocumentResource(resource: Resource): resource is EnhancedDocumentResource & { type: 'document' } {
  return resource.type === 'document'
}

function isFormResource(resource: Resource): resource is EnhancedFormResource & { type: 'form' } {
  return resource.type === 'form'
}

function isVDFolderResource(resource: Resource): resource is VDSharePointFolderResource & { type: 'vdFolder' } {
  return resource.type === 'vdFolder'
}

function isVideoResource(resource: Resource): resource is VideoResource & { type: 'video' } {
  return resource.type === 'video'
}
```

---

## Component Props Interfaces

### Resource Card Props

```typescript
// Base resource card props
interface ResourceCardProps {
  resource: Resource
  context: ResourceContext
  showAnalytics?: boolean
  compact?: boolean
  readonly?: boolean
}

// Resource context for display customization
interface ResourceContext {
  entityType: 'offering' | 'outcome' | 'component'
  entityId: number
  entityName?: string
  displayMode: 'card' | 'list' | 'grid'
  allowActions: boolean
  showMetadata: boolean
}

// Type-specific card props
interface DocumentResourceCardProps extends ResourceCardProps {
  resource: EnhancedDocumentResource & { type: 'document' }
  allowPreview?: boolean
  allowDownload?: boolean
  showVersionHistory?: boolean
}

interface FormResourceCardProps extends ResourceCardProps {
  resource: EnhancedFormResource & { type: 'form' }
  showAnalytics?: boolean
  allowDirectAccess?: boolean
}

interface VDFolderResourceCardProps extends ResourceCardProps {
  resource: VDSharePointFolderResource & { type: 'vdFolder' }
  showContentSummary?: boolean
  allowSync?: boolean
  showHealthMetrics?: boolean
}

interface VideoResourceCardProps extends ResourceCardProps {
  resource: VideoResource & { type: 'video' }
  showThumbnail?: boolean
  allowInlinePlay?: boolean
  showChapters?: boolean
}
```

### Resource Detail Modal Props

```typescript
interface ResourceDetailModalProps {
  resource: Resource
  isOpen: boolean
  context: ResourceContext
  onClose: () => void
  onUpdate?: (resource: Resource) => void
  onDelete?: (resourceId: number) => void
}

// Type-specific detail props
interface DocumentResourceDetailProps extends ResourceDetailModalProps {
  resource: EnhancedDocumentResource & { type: 'document' }
  allowEdit?: boolean
  showVersionHistory?: boolean
  allowVersionUpload?: boolean
}

interface VideoResourceDetailProps extends ResourceDetailModalProps {
  resource: VideoResource & { type: 'video' }
  allowFullscreen?: boolean
  showTranscript?: boolean
  enableQuiz?: boolean
}
```

---

## API Response Interfaces

### Resource API Responses

```typescript
// Paginated resource response
interface ResourceListResponse {
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

// Single resource response
interface ResourceResponse {
  resource: Resource
  associations?: ResourceAssociation[]
  permissions?: ResourcePermission[]
  analytics?: ResourceAnalytics
}

// Resource creation/update request
interface ResourceRequest {
  name: string
  description?: string
  entityType: 'offering' | 'outcome' | 'component'
  entityId: number
  tags?: string[]
  categories?: string[]
  accessLevel: 'public' | 'restricted' | 'private'
  // Type-specific data based on resource type
  typeSpecificData: any
}
```

### Filter and Search Interfaces

```typescript
interface ResourceFilters {
  resourceTypes?: ResourceType[]
  categories?: string[]
  tags?: string[]
  entityTypes?: ('offering' | 'outcome' | 'component')[]
  accessLevels?: ('public' | 'restricted' | 'private')[]
  dateRange?: {
    from: Date
    to: Date
    field: 'insertedAt' | 'updatedAt' | 'lastAccessedAt'
  }
  searchQuery?: string
  // Type-specific filters
  documentTypes?: string[]
  formCategories?: string[]
  videoTypes?: string[]
  folderTypes?: string[]
}

interface ResourceSorting {
  field: 'name' | 'insertedAt' | 'updatedAt' | 'viewCount' | 'lastAccessedAt'
  direction: 'asc' | 'desc'
}

interface ResourceSearchIndex {
  searchableContent: string
  searchVector?: any // PostgreSQL full-text search vector
  resourceType: string
  categories: string[]
  tags: string[]
  entityTypes: string[]
  createdDateRange: string
  modifiedDateRange: string
  fileSize?: number
  duration?: number
  viewCount: number
  isActive: boolean
  isPublished: boolean
  hasPreview: boolean
  requiresPermission: boolean
}
```

---

## Analytics and Performance Interfaces

### Resource Analytics

```typescript
interface ResourceAnalytics {
  // Basic Usage
  totalViews: number
  uniqueUsers: number
  averageSessionDuration: number
  
  // Time-Based Analytics
  dailyViews: TimeSeriesData[]
  weeklyViews: TimeSeriesData[]
  monthlyViews: TimeSeriesData[]
  
  // User Behavior
  mostCommonAccessPaths: string[]
  averageTimeToFind: number // seconds
  searchTermsUsed: string[]
  
  // Performance Metrics
  loadTime: number // milliseconds
  errorRate: number // percentage
  userSatisfactionScore: number // 1-5 scale
  
  // Business Impact
  conversionRate?: number // for forms, videos with CTAs
  completionRate?: number // for training videos, forms
  effectivenessScore?: number // business-defined metric
}

interface TimeSeriesData {
  date: string
  value: number
}

// Type-specific analytics
interface DocumentAnalytics extends ResourceAnalytics {
  downloadCount: number
  printCount: number
  shareCount: number
  averageReadTime: number
  mostViewedPages?: number[]
}

interface FormAnalytics extends ResourceAnalytics {
  submissionCount: number
  abandonmentRate: number
  averageCompletionTime: number
  mostCommonExitField?: string
  conversionsByCategory: Record<string, number>
}

interface VideoAnalytics extends ResourceAnalytics {
  averageWatchTime: number
  completionRate: number
  engagementScore: number
  chapterViewCounts: Record<string, number>
  quizCompletionRate?: number
  dropOffPoints: number[] // timestamps where users commonly stop watching
}

interface VDFolderAnalytics extends ResourceAnalytics {
  accessCount: number
  uniqueAccessors: number
  mostAccessedFiles: string[]
  syncFrequency: number
  healthScore: number // 0-100 based on broken links, duplicates, etc.
}
```

---

## Utility Types and Helpers

### Resource Type Utilities

```typescript
// Extract type-specific data from resource
type ResourceTypeData<T extends Resource> = Omit<T, keyof BaseEntity | keyof CommonResourceMetadata | 'type'>

// Resource creation payload
type CreateResourcePayload<T extends ResourceType> = 
  T extends 'document' ? Partial<ResourceTypeData<EnhancedDocumentResource & { type: 'document' }>> :
  T extends 'url' ? Partial<ResourceTypeData<EnhancedUrlResource & { type: 'url' }>> :
  T extends 'form' ? Partial<ResourceTypeData<EnhancedFormResource & { type: 'form' }>> :
  T extends 'emailTemplate' ? Partial<ResourceTypeData<EnhancedEmailTemplateResource & { type: 'emailTemplate' }>> :
  T extends 'vdFolder' ? Partial<ResourceTypeData<VDSharePointFolderResource & { type: 'vdFolder' }>> :
  T extends 'video' ? Partial<ResourceTypeData<VideoResource & { type: 'video' }>> :
  never

// Resource update payload
type UpdateResourcePayload<T extends Resource> = Partial<T> & {
  id: number
  type: T['type']
}

// Resource action types
type ResourceAction = 
  | 'view'
  | 'edit'
  | 'delete'
  | 'share'
  | 'download'
  | 'preview'
  | 'sync'
  | 'play'
  | 'open'
  | 'analytics'

// Resource permission types
interface ResourcePermission {
  userId: number
  permissionType: 'read' | 'write' | 'admin'
  grantedAt: Date
  grantedBy: number
  expiresAt?: Date
}
```

### Validation Schemas

```typescript
// Resource validation rules
interface ResourceValidationSchema {
  name: {
    required: true
    minLength: 1
    maxLength: 255
  }
  description: {
    required: false
    maxLength: 1000
  }
  tags: {
    required: false
    maxItems: 20
    itemMaxLength: 50
  }
  categories: {
    required: false
    maxItems: 10
    itemMaxLength: 100
  }
}

// Type-specific validation
interface DocumentValidationSchema extends ResourceValidationSchema {
  fileName: {
    required: true
    pattern: /^[^<>:"/\\|?*]+$/
  }
  fileExtension: {
    required: true
    allowedValues: ['.pdf', '.doc', '.docx', '.txt', '.rtf']
  }
  fileSize: {
    required: true
    max: 100 * 1024 * 1024 // 100MB
  }
}

interface VideoValidationSchema extends ResourceValidationSchema {
  duration: {
    required: true
    min: 1
    max: 7200 // 2 hours
  }
  resolution: {
    required: true
    pattern: /^\d+x\d+$/
  }
  format: {
    required: true
    allowedValues: ['mp4', 'avi', 'mov', 'wmv', 'webm']
  }
}
```

---

## Error Handling Interfaces

### Resource Error Types

```typescript
// Resource-specific error types
interface ResourceError {
  code: string
  message: string
  field?: string
  details?: any
}

// Common resource errors
enum ResourceErrorCode {
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  INVALID_RESOURCE_TYPE = 'INVALID_RESOURCE_TYPE',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SYNC_ERROR = 'SYNC_ERROR',
  PROCESSING_ERROR = 'PROCESSING_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR'
}

// Type-specific errors
interface DocumentError extends ResourceError {
  code: 'DOCUMENT_LOCKED' | 'INVALID_FILE_TYPE' | 'FILE_TOO_LARGE' | 'VIRUS_DETECTED'
}

interface FormError extends ResourceError {
  code: 'SYNTAQ_API_ERROR' | 'FORM_NOT_PUBLISHED' | 'INVALID_FORM_CONFIG'
}

interface VDFolderError extends ResourceError {
  code: 'SHAREPOINT_SYNC_FAILED' | 'FOLDER_NOT_FOUND' | 'PERMISSION_SYNC_ERROR'
}

interface VideoError extends ResourceError {
  code: 'VIDEO_PROCESSING_FAILED' | 'UNSUPPORTED_FORMAT' | 'STREAMING_ERROR'
}
```

---

## State Management Interfaces

### Resource Store State

```typescript
// Pinia store state for resources
interface ResourceStoreState {
  // Resource collections
  resources: Record<number, Resource>
  resourcesByEntity: Record<string, number[]> // entityType:entityId -> resourceIds
  
  // Loading states
  loading: {
    list: boolean
    detail: Record<number, boolean>
    create: boolean
    update: Record<number, boolean>
    delete: Record<number, boolean>
  }
  
  // Error states
  errors: {
    list?: ResourceError
    detail: Record<number, ResourceError>
    create?: ResourceError
    update: Record<number, ResourceError>
    delete: Record<number, ResourceError>
  }
  
  // Filters and search
  filters: ResourceFilters
  searchQuery: string
  sorting: ResourceSorting
  
  // Pagination
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
  }
  
  // Cache metadata
  lastFetched: Record<string, Date>
  cacheExpiry: number // milliseconds
}

// Resource store actions
interface ResourceStoreActions {
  // CRUD operations
  fetchResources(entityType: string, entityId: number): Promise<Resource[]>
  fetchResource(id: number): Promise<Resource>
  createResource(payload: ResourceRequest): Promise<Resource>
  updateResource(id: number, payload: Partial<Resource>): Promise<Resource>
  deleteResource(id: number): Promise<void>
  
  // Filtering and search
  setFilters(filters: Partial<ResourceFilters>): void
  setSearchQuery(query: string): void
  setSorting(sorting: ResourceSorting): void
  clearFilters(): void
  
  // Type-specific actions
  downloadDocument(id: number): Promise<Blob>
  previewDocument(id: number): Promise<string>
  syncVDFolder(id: number): Promise<void>
  playVideo(id: number): Promise<void>
  submitForm(id: number, data: any): Promise<void>
  
  // Analytics
  trackResourceView(id: number): void
  getResourceAnalytics(id: number): Promise<ResourceAnalytics>
  
  // Cache management
  invalidateCache(entityType?: string, entityId?: number): void
  refreshResource(id: number): Promise<Resource>
}
```

---

## Event Interfaces

### Resource Events

```typescript
// Resource event types
interface ResourceEvent {
  type: ResourceEventType
  resourceId: number
  resourceType: ResourceType
  userId: number
  timestamp: Date
  metadata?: any
}

enum ResourceEventType {
  CREATED = 'created',
  UPDATED = 'updated',
  DELETED = 'deleted',
  VIEWED = 'viewed',
  DOWNLOADED = 'downloaded',
  SHARED = 'shared',
  SYNCED = 'synced',
  PLAYED = 'played',
  SUBMITTED = 'submitted'
}

// Type-specific events
interface DocumentEvent extends ResourceEvent {
  type: 'downloaded' | 'previewed' | 'version_uploaded'
  metadata: {
    fileName?: string
    version?: string
    downloadSize?: number
  }
}

interface VideoEvent extends ResourceEvent {
  type: 'played' | 'paused' | 'completed' | 'chapter_viewed'
  metadata: {
    timestamp?: number
    duration?: number
    chapterId?: string
    quality?: string
  }
}

interface FormEvent extends ResourceEvent {
  type: 'submitted' | 'abandoned' | 'validation_failed'
  metadata: {
    submissionId?: string
    completionTime?: number
    exitField?: string
    validationErrors?: string[]
  }
}
```

---

## Integration Interfaces

### External Service Integration

```typescript
// Syntaq API integration
interface SyntaqApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  pagination?: {
    page: number
    totalPages: number
    totalCount: number
  }
}

interface SyntaqFormSubmission {
  formId: string
  submissionId: string
  submittedAt: Date
  data: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

// SharePoint API integration
interface SharePointApiResponse<T = any> {
  '@odata.context': string
  value?: T[]
  error?: {
    code: string
    message: string
  }
}

interface SharePointFile {
  id: string
  name: string
  size: number
  lastModified: Date
  webUrl: string
  downloadUrl: string
  contentType: string
}

interface SharePointFolder {
  id: string
  name: string
  webUrl: string
  itemCount: number
  lastModified: Date
  parentFolder?: {
    id: string
    name: string
  }
}

// Video hosting platform integration
interface VideoHostingResponse {
  videoId: string
  status: 'processing' | 'ready' | 'error'
  thumbnailUrl?: string
  embedUrl?: string
  streamingUrls?: VideoQuality[]
  duration?: number
  error?: string
}
```

---

## Testing Interfaces

### Mock Data Interfaces

```typescript
// Mock data generators
interface MockResourceGenerator {
  generateDocument(overrides?: Partial<EnhancedDocumentResource>): EnhancedDocumentResource & { type: 'document' }
  generateUrl(overrides?: Partial<EnhancedUrlResource>): EnhancedUrlResource & { type: 'url' }
  generateForm(overrides?: Partial<EnhancedFormResource>): EnhancedFormResource & { type: 'form' }
  generateEmailTemplate(overrides?: Partial<EnhancedEmailTemplateResource>): EnhancedEmailTemplateResource & { type: 'emailTemplate' }
  generateVDFolder(overrides?: Partial<VDSharePointFolderResource>): VDSharePointFolderResource & { type: 'vdFolder' }
  generateVideo(overrides?: Partial<VideoResource>): VideoResource & { type: 'video' }
  generateResourceList(count: number, types?: ResourceType[]): Resource[]
}

// Test scenario interfaces
interface ResourceTestScenario {
  name: string
  description: string
  setup: () => Promise<void>
  execute: () => Promise<any>
  verify: (result: any) => boolean
  cleanup: () => Promise<void>
}
```

---

## Configuration Interfaces

### Resource Type Configuration

```typescript
// Resource type configuration
interface ResourceTypeConfig {
  type: ResourceType
  displayName: string
  icon: string
  color: string
  allowedActions: ResourceAction[]
  defaultFilters: Partial<ResourceFilters>
  validationSchema: any
  componentMapping: {
    card: string
    detail: string
    create: string
    edit: string
  }
}

// Application configuration
interface ResourceSystemConfig {
  resourceTypes: Record<ResourceType, ResourceTypeConfig>
  defaultPageSize: number
  cacheExpiry: number
  maxFileSize: number
  allowedFileTypes: string[]
  externalServices: {
    syntaq: {
      apiUrl: string
      apiKey: string
    }
    sharepoint: {
      siteUrl: string
      clientId: string
    }
    videoHosting: {
      provider: 'youtube' | 'vimeo' | 'azure'
      apiKey: string
    }
  }
}
```

---

## Conclusion

This comprehensive data model specification provides:

1. **Complete TypeScript interfaces** for all six resource types based on Phase 1 analysis
2. **Discriminated unions** for type-safe resource handling
3. **Component prop interfaces** for Vue component development
4. **API response structures** for backend integration
5. **State management interfaces** for Pinia stores
6. **Event and error handling** for robust application behavior
7. **External service integration** interfaces for Syntaq, SharePoint, and video hosting
8. **Testing and configuration** interfaces for development support

These interfaces ensure:
- **Type safety** throughout the application
- **Consistent data structures** across all components
- **Extensible architecture** for future resource types
- **Integration readiness** with existing ALP patterns
- **Comprehensive error handling** and validation
- **Performance optimization** through proper caching and state management

---

**Document Status**: ✅ Complete  
**Related Documents**: 
- [Resource Field Analysis](../01-discovery-analysis/Resource_Field_Analysis.md) - Source metadata structures
- [Component Architecture](./component-architecture.md) - Vue component specifications
- [Technical Architecture](./technical-architecture.md) - Implementation strategy
- [Integration Plan](./integration-plan.md) - ALP integration approach
