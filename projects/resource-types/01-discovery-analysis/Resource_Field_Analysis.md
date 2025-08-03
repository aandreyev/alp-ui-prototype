# Resource Field Analysis

**Document Purpose**: Comprehensive analysis of all fields and metadata for each resource type in the enhanced ALP resource system, including existing types and new Video/VD SharePoint Folder types.

---

## Common Base Fields (All Resource Types)

All resource types inherit from `BaseEntity` and share these common audit and tracking fields:

### Base Entity Fields
```typescript
interface BaseResourceFields {
  // Primary Key
  id: number;
  
  // Audit Fields
  insertedAt: DateTime;
  updatedAt: DateTime;
  insertedById?: number;
  lastUpdatedById?: number;
  isDeleted: boolean;
  
  // Relationships
  insertedBy?: User;
  lastUpdatedBy?: User;
}
```

### Common Resource Metadata
```typescript
interface CommonResourceMetadata {
  // Basic Information
  name: string;
  description?: string;
  
  // Classification
  tags?: string[];
  categories?: string[];
  
  // Association Context
  entityType: 'offering' | 'outcome' | 'component';
  entityId: number;
  
  // Access Control
  accessLevel: 'public' | 'restricted' | 'private';
  permissions?: ResourcePermission[];
  
  // Usage Tracking
  viewCount: number;
  lastAccessedAt?: DateTime;
  lastAccessedBy?: number;
}
```

---

## 1. Documents Resource Type

### Current ALP Implementation
Based on `ALP.Data.Models.Documents.Document`:

```typescript
interface DocumentResource extends BaseResourceFields {
  // File Information
  fileName: string;
  fileExtension: string;
  
  // Document Management
  editingIdentifier?: string;
  lockedByUserId?: number;
  lockedByUser?: User;
  
  // Content Analysis
  extractedText?: string;
  extractedTextSearchVector?: any; // PostgreSQL full-text search
  
  // Dynamic Metadata
  dynamicParameterValues?: DocumentDynamicParameterValue[];
}
```

### Enhanced Document Metadata
```typescript
interface EnhancedDocumentResource extends DocumentResource, CommonResourceMetadata {
  // File Properties
  fileSize: number;
  mimeType: string;
  checksum: string;
  
  // Version Control
  version: string;
  versionHistory?: DocumentVersion[];
  isLatestVersion: boolean;
  
  // Document Classification
  documentType: 'template' | 'contract' | 'form' | 'letter' | 'report' | 'other';
  confidentialityLevel: 'public' | 'internal' | 'confidential' | 'restricted';
  
  // Content Metadata
  pageCount?: number;
  wordCount?: number;
  language?: string;
  
  // Storage Information
  storageLocation: string;
  storageProvider: 'azure' | 'local' | 'sharepoint';
  
  // Review and Approval
  reviewStatus: 'draft' | 'review' | 'approved' | 'archived';
  reviewedBy?: number;
  reviewedAt?: DateTime;
  approvedBy?: number;
  approvedAt?: DateTime;
  
  // Usage Analytics
  downloadCount: number;
  printCount: number;
  shareCount: number;
}
```

---

## 2. URLs Resource Type

### Current ALP Implementation
Based on `ALP.Data.Models.Resources.ResourceUrl`:

```typescript
interface UrlResource extends BaseResourceFields {
  // Basic Information
  name: string;
  description?: string;
  url: string;
  
  // Dynamic Metadata
  dynamicParameterValues?: ResourceUrlDynamicParameterValue[];
}
```

### Enhanced URL Metadata
```typescript
interface EnhancedUrlResource extends UrlResource, CommonResourceMetadata {
  // URL Properties
  title?: string; // Extracted from page
  favicon?: string;
  screenshot?: string;
  
  // URL Classification
  urlType: 'website' | 'document' | 'video' | 'form' | 'tool' | 'reference';
  domain: string;
  isExternal: boolean;
  
  // Validation and Health
  isActive: boolean;
  lastChecked?: DateTime;
  httpStatus?: number;
  responseTime?: number;
  
  // Content Metadata
  pageTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  
  // Access Requirements
  requiresLogin: boolean;
  requiresVPN: boolean;
  accessInstructions?: string;
  
  // Usage Analytics
  clickCount: number;
  uniqueVisitors: number;
  averageTimeOnSite?: number;
  
  // SEO and Social
  openGraphImage?: string;
  twitterCard?: string;
}
```

---

## 3. Forms Resource Type (Syntaq Integration)

### Current ALP Implementation
Based on Syntaq integration analysis:

```typescript
interface FormResource extends BaseResourceFields {
  // Syntaq Integration
  syntaqFormId: string;
  syntaqFormName: string;
  
  // Form Properties
  formType: string;
  isActive: boolean;
  
  // Classification
  category: 'marketing' | 'sales' | 'vd' | 'admin' | 'client';
  
  // Analytics
  submissionCount: number;
  completionRate: number;
  
  // Integration Data
  webhookUrl?: string;
  apiEndpoint?: string;
}
```

### Enhanced Form Metadata
```typescript
interface EnhancedFormResource extends FormResource, CommonResourceMetadata {
  // Form Configuration
  formVersion: string;
  isPublished: boolean;
  publishedAt?: DateTime;
  
  // Form Structure
  fieldCount: number;
  requiredFieldCount: number;
  estimatedCompletionTime: number; // minutes
  
  // Submission Handling
  submissionEmailRecipients: string[];
  autoResponseEnabled: boolean;
  autoResponseTemplate?: string;
  
  // Validation Rules
  validationRules?: FormValidationRule[];
  customValidation?: string;
  
  // Analytics and Performance
  averageCompletionTime: number;
  abandonmentRate: number;
  mostCommonExitField?: string;
  
  // Integration Settings
  crmIntegration?: {
    enabled: boolean;
    crmType: string;
    mappingRules: any;
  };
  
  // Compliance and Legal
  gdprCompliant: boolean;
  dataRetentionPeriod: number; // days
  consentRequired: boolean;
}
```

---

## 4. Email Templates Resource Type

### Current ALP Implementation
Based on `ALP.Data.Models.Emails.EmailTemplate`:

```typescript
interface EmailTemplateResource extends BaseResourceFields {
  // Basic Information
  name: string;
  content: string;
  
  // Categorization
  offeringCategoryId?: number;
  offeringCategory?: OfferingCategory;
}
```

### Enhanced Email Template Metadata
```typescript
interface EnhancedEmailTemplateResource extends EmailTemplateResource, CommonResourceMetadata {
  // Template Properties
  subject: string;
  htmlContent: string;
  plainTextContent?: string;
  
  // Template Classification
  templateType: 'notification' | 'marketing' | 'transactional' | 'reminder' | 'welcome';
  purpose: string;
  
  // Variable Management
  variables: TemplateVariable[];
  requiredVariables: string[];
  optionalVariables: string[];
  
  // Design and Layout
  templateEngine: 'handlebars' | 'mustache' | 'liquid';
  cssFramework?: string;
  isResponsive: boolean;
  
  // Usage and Performance
  sendCount: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  
  // Compliance
  includesUnsubscribe: boolean;
  gdprCompliant: boolean;
  canSpamCompliant: boolean;
  
  // Testing and Validation
  lastTested?: DateTime;
  testResults?: EmailTestResult[];
  
  // Localization
  language: string;
  localizedVersions?: LocalizedEmailTemplate[];
}
```

---

## 5. VD SharePoint Folders Resource Type (New)

### Enhanced SharePoint Folder Resource
```typescript
interface VDSharePointFolderResource extends BaseResourceFields, CommonResourceMetadata {
  // SharePoint Integration
  sharePointSiteUrl: string;
  sharePointFolderId: string;
  sharePointFolderPath: string;
  sharePointFolderName: string;
  
  // Folder Properties
  folderType: 'matter' | 'project' | 'offering' | 'client' | 'template';
  isSystemGenerated: boolean;
  
  // Folder Structure
  parentFolderId?: string;
  subfolderCount: number;
  totalItemCount: number;
  totalSize: number; // bytes
  
  // Content Metadata
  documentCount: number;
  imageCount: number;
  videoCount: number;
  otherFileCount: number;
  
  // Synchronization
  lastSyncAt?: DateTime;
  syncStatus: 'synced' | 'pending' | 'error' | 'disabled';
  syncErrors?: string[];
  
  // Access and Permissions
  sharePointPermissions: SharePointPermission[];
  inheritPermissions: boolean;
  isPubliclyAccessible: boolean;
  
  // Folder Organization
  folderTemplate?: string;
  autoOrganizationRules?: FolderOrganizationRule[];
  
  // Usage Analytics
  accessCount: number;
  uniqueAccessors: number;
  mostAccessedFiles?: string[];
  
  // Compliance and Retention
  retentionPolicy?: string;
  retentionPeriod?: number; // days
  complianceLabels?: string[];
  
  // Integration with ALP Entities
  linkedMatterId?: number;
  linkedProjectId?: number;
  linkedOfferingId?: number;
  linkedClientId?: number;
  
  // Folder Health
  brokenLinksCount: number;
  duplicateFilesCount: number;
  lastHealthCheck?: DateTime;
}

interface SharePointPermission {
  principalId: string;
  principalName: string;
  principalType: 'user' | 'group';
  permissionLevel: 'read' | 'contribute' | 'edit' | 'fullControl';
  inherited: boolean;
}

interface FolderOrganizationRule {
  ruleType: 'fileType' | 'dateCreated' | 'fileSize' | 'custom';
  condition: string;
  action: 'move' | 'copy' | 'tag' | 'notify';
  targetLocation?: string;
}
```

---

## 6. Videos Resource Type (New)

### Video Resource Metadata
```typescript
interface VideoResource extends BaseResourceFields, CommonResourceMetadata {
  // Video File Properties
  fileName: string;
  fileSize: number;
  duration: number; // seconds
  format: string; // mp4, avi, mov, etc.
  resolution: string; // 1920x1080, 1280x720, etc.
  frameRate: number;
  bitrate: number;
  codec: string;
  
  // Video Classification
  videoType: 'training' | 'presentation' | 'demo' | 'webinar' | 'tutorial' | 'marketing';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  audience: 'internal' | 'client' | 'public' | 'restricted';
  
  // Content Organization
  chapters: VideoChapter[];
  topics: string[];
  learningObjectives?: string[];
  prerequisites?: string[];
  
  // Hosting and Storage
  hostingPlatform: 'youtube' | 'vimeo' | 'azure' | 'local' | 'sharepoint';
  videoUrl: string;
  thumbnailUrl?: string;
  embedCode?: string;
  
  // Accessibility
  hasSubtitles: boolean;
  subtitleLanguages: string[];
  hasTranscript: boolean;
  transcriptUrl?: string;
  isAccessible: boolean;
  
  // Quality and Processing
  processingStatus: 'uploaded' | 'processing' | 'ready' | 'error';
  qualityLevels: VideoQuality[];
  isStreamingReady: boolean;
  
  // Usage Analytics
  viewCount: number;
  uniqueViewers: number;
  averageWatchTime: number; // seconds
  completionRate: number; // percentage
  engagementScore: number;
  
  // Interactive Features
  hasQuiz: boolean;
  quizQuestions?: VideoQuizQuestion[];
  hasNotes: boolean;
  allowComments: boolean;
  
  // Content Management
  isPublished: boolean;
  publishedAt?: DateTime;
  expiresAt?: DateTime;
  contentRating?: string;
  
  // SEO and Discovery
  seoTitle?: string;
  seoDescription?: string;
  keywords: string[];
  
  // Integration
  linkedDocuments?: number[];
  linkedForms?: number[];
  relatedVideos?: number[];
}

interface VideoChapter {
  id: string;
  title: string;
  startTime: number; // seconds
  endTime: number; // seconds
  description?: string;
  thumbnailUrl?: string;
}

interface VideoQuality {
  resolution: string;
  bitrate: number;
  fileSize: number;
  url: string;
}

interface VideoQuizQuestion {
  id: string;
  timestamp: number; // seconds
  question: string;
  type: 'multiple-choice' | 'true-false' | 'text';
  options?: string[];
  correctAnswer: string;
  explanation?: string;
}
```

---

## Resource Association Metadata

### Entity Association Fields
```typescript
interface ResourceAssociation {
  // Association Context
  entityType: 'offering' | 'outcome' | 'component';
  entityId: number;
  
  // Association Properties
  associationType: 'direct' | 'inherited' | 'copied';
  associatedAt: DateTime;
  associatedBy: number;
  
  // Display and Ordering
  displayOrder: number;
  isVisible: boolean;
  isFeatured: boolean;
  
  // Context-Specific Metadata
  contextNotes?: string;
  contextTags?: string[];
  
  // Usage in Context
  usageCount: number;
  lastUsedAt?: DateTime;
  lastUsedBy?: number;
}
```

### Resource Relationships
```typescript
interface ResourceRelationship {
  // Relationship Definition
  sourceResourceId: number;
  targetResourceId: number;
  relationshipType: 'prerequisite' | 'related' | 'alternative' | 'supersedes' | 'references';
  
  // Relationship Properties
  strength: number; // 1-10 scale
  isReciprocal: boolean;
  createdAt: DateTime;
  createdBy: number;
  
  // Context
  relationshipContext?: string;
  notes?: string;
}
```

---

## Search and Filtering Metadata

### Search Index Fields
```typescript
interface ResourceSearchIndex {
  // Full-Text Search
  searchableContent: string; // Combined searchable text
  searchVector: any; // PostgreSQL full-text search vector
  
  // Faceted Search
  resourceType: string;
  categories: string[];
  tags: string[];
  entityTypes: string[];
  
  // Date Ranges
  createdDateRange: string;
  modifiedDateRange: string;
  
  // Numeric Filters
  fileSize?: number;
  duration?: number; // for videos
  viewCount: number;
  
  // Boolean Filters
  isActive: boolean;
  isPublished: boolean;
  hasPreview: boolean;
  requiresPermission: boolean;
}
```

---

## Classification Taxonomies

### Resource Categories
```typescript
enum ResourceCategory {
  // Functional Categories
  LEGAL_TEMPLATES = 'legal-templates',
  CLIENT_COMMUNICATIONS = 'client-communications',
  INTERNAL_PROCESSES = 'internal-processes',
  TRAINING_MATERIALS = 'training-materials',
  MARKETING_ASSETS = 'marketing-assets',
  COMPLIANCE_DOCUMENTS = 'compliance-documents',
  
  // Practice Area Categories
  CORPORATE_LAW = 'corporate-law',
  PROPERTY_LAW = 'property-law',
  FAMILY_LAW = 'family-law',
  LITIGATION = 'litigation',
  COMMERCIAL_LAW = 'commercial-law',
  
  // Workflow Categories
  MATTER_INITIATION = 'matter-initiation',
  MATTER_PROGRESSION = 'matter-progression',
  MATTER_COMPLETION = 'matter-completion',
  CLIENT_ONBOARDING = 'client-onboarding',
  BILLING_INVOICING = 'billing-invoicing'
}
```

### Access Levels
```typescript
enum AccessLevel {
  PUBLIC = 'public',           // Available to all users
  INTERNAL = 'internal',       // Available to all staff
  RESTRICTED = 'restricted',   // Available to specific roles/users
  CONFIDENTIAL = 'confidential', // Available to senior staff only
  PRIVATE = 'private'          // Available to creator only
}
```

### Usage Contexts
```typescript
enum UsageContext {
  OFFERING_DESIGN = 'offering-design',
  MATTER_EXECUTION = 'matter-execution',
  CLIENT_INTERACTION = 'client-interaction',
  STAFF_TRAINING = 'staff-training',
  PROCESS_DOCUMENTATION = 'process-documentation',
  COMPLIANCE_REPORTING = 'compliance-reporting'
}
```

---

## Performance and Analytics Metadata

### Usage Analytics
```typescript
interface ResourceAnalytics {
  // Basic Usage
  totalViews: number;
  uniqueUsers: number;
  averageSessionDuration: number;
  
  // Time-Based Analytics
  dailyViews: TimeSeriesData[];
  weeklyViews: TimeSeriesData[];
  monthlyViews: TimeSeriesData[];
  
  // User Behavior
  mostCommonAccessPaths: string[];
  averageTimeToFind: number; // seconds
  searchTermsUsed: string[];
  
  // Performance Metrics
  loadTime: number; // milliseconds
  errorRate: number; // percentage
  userSatisfactionScore: number; // 1-5 scale
  
  // Business Impact
  conversionRate?: number; // for forms, videos with CTAs
  completionRate?: number; // for training videos, forms
  effectivenessScore?: number; // business-defined metric
}

interface TimeSeriesData {
  date: string;
  value: number;
}
```

---

## Conclusion

This comprehensive field analysis provides the complete metadata structure for all six resource types in the enhanced ALP system. The analysis includes:

1. **Complete field definitions** for all existing resource types based on ALP reference code
2. **Enhanced metadata structures** that extend current capabilities
3. **New resource type definitions** for Videos and VD SharePoint Folders
4. **Common metadata patterns** that ensure consistency across all types
5. **Classification taxonomies** for organized resource management
6. **Analytics and performance tracking** for data-driven insights

This metadata foundation enables:
- **Consistent data modeling** across all resource types
- **Rich search and filtering** capabilities
- **Comprehensive analytics** and usage tracking
- **Flexible classification** and organization
- **Scalable architecture** for future resource types

---

**Document Status**: ✅ Complete  
**Related Documents**: 
- [Enhanced Requirements](./enhanced-requirements.md)
- [Syntaq Form Integration](./Syntaq_Form_Integration.md)
- [SharePoint Integration Analysis](./SharePoint_Integration_Analysis.md)
- [Resource Management Design Principles](./Resource_Management_Design_Principles.md)
