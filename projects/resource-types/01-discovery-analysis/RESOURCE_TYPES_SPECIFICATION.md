# Portal Resource Types Specification

**Document Version**: 1.0  
**Date**: January 2025  
**Author**: ALP Development Team  
**Purpose**: Comprehensive specification for resource types in the ALP Portal Resources system

---

## Executive Summary

This document defines the enhanced resource type system for the ALP Portal, expanding from the current 4 resource types to 6 comprehensive types, including the new **Video** resource type. The specification provides a unified approach to resource management that maintains compatibility with the existing ALP system while enabling enhanced functionality for point-of-need resource delivery.

### Current State → Enhanced State
- **Current**: 4 resource types (Documents, URLs, Forms, Email Templates)
- **Enhanced**: 6 resource types (+ VD SharePoint Folders, Videos)
- **Migration**: Seamless upgrade path from existing ALP database structure
- **Integration**: Full compatibility with existing SharePoint, Azure Storage, and Syntaq systems

---

## 1. Resource Type Architecture Overview

### 1.1 Common Resource Foundation

All resource types inherit from a common base structure that ensures consistency across the portal:

```typescript
interface BaseResource {
  // Core Identity
  id: string
  name: string
  description: string
  type: ResourceType
  
  // Temporal Tracking
  createdAt: string
  updatedAt: string
  createdBy: string
  lastModifiedBy: string
  
  // Organization & Discovery
  tags: string[]
  category?: string
  
  // Access & Security
  isActive: boolean
  accessLevel: 'public' | 'restricted' | 'confidential'
  
  // Portal Integration
  hierarchyLevel: 'offering' | 'outcome' | 'component'
  entityId: string
  
  // Metadata Extension
  dynamicParameters?: DynamicParameterValue[]
}

type ResourceType = 'document' | 'url' | 'form' | 'email_template' | 'vd_sharepoint_folder' | 'video'
```

### 1.2 Resource Type Hierarchy

```
Portal Resources
├── Documents (Templates, PDFs, Word docs, etc.)
├── URLs (External links, web resources)
├── Forms (Interactive Syntaq forms)
├── Email Templates (Standardized communications)
├── VD SharePoint Folders (Structured document collections)
└── Videos (Training, explanatory, procedural content)
```

---

## 2. Detailed Resource Type Specifications

### 2.1 Document Resources

**Purpose**: File-based resources including templates, guides, forms, and reference materials.

```typescript
interface DocumentResource extends BaseResource {
  type: 'document'
  
  // File Properties
  fileName: string
  fileExtension: string
  fileSize: number
  mimeType: string
  
  // Version Control
  version: string
  versionHistory: DocumentVersion[]
  
  // Storage & Access
  storageIdentifier: string
  downloadUrl: string
  previewUrl?: string
  
  // Content Analysis
  extractedText?: string
  searchVector?: string
  
  // Document State
  isLocked: boolean
  lockedBy?: string
  lockedAt?: string
  
  // Security
  checksum: string
  encryptionStatus?: 'none' | 'at_rest' | 'full'
  
  // Document Specific Metadata
  author?: string
  documentType: 'template' | 'guide' | 'form' | 'reference' | 'legal' | 'other'
  language: string
  pageCount?: number
  wordCount?: number
}

interface DocumentVersion {
  versionNumber: string
  createdAt: string
  createdBy: string
  changeDescription: string
  fileSize: number
  storageIdentifier: string
}
```

**Portal Integration**:
- **Icon**: FileText (Lucide)
- **Actions**: Preview, Download, Edit (if template), Version History
- **Display**: Shows file size, version, last modified date
- **Preview**: PDF viewer, Office Online integration

**ALP Database Mapping**:
- Source: `documents` table with `discriminator = 'ResourceDocument'`
- Versions: `document_versions` table
- Metadata: `document_dynamic_parameter_values` table

---

### 2.2 URL Resources

**Purpose**: External links, web resources, and reference URLs.

```typescript
interface UrlResource extends BaseResource {
  type: 'url'
  
  // URL Properties
  url: string
  displayUrl: string // User-friendly version
  
  // Link Classification
  linkType: 'external' | 'sharepoint' | 'internal' | 'government' | 'legal_database'
  domain: string
  
  // Accessibility & Validation
  lastChecked?: string
  isAccessible: boolean
  responseTime?: number
  httpStatus?: number
  
  // Content Preview
  title?: string
  metaDescription?: string
  previewImage?: string
  favicon?: string
  
  // Security
  requiresAuthentication: boolean
  sslStatus: 'secure' | 'insecure' | 'unknown'
  
  // Usage Tracking
  clickCount: number
  lastAccessed?: string
}
```

**Portal Integration**:
- **Icon**: Link (Lucide) + ExternalLink indicator
- **Actions**: Open (new tab), Copy URL, Check Status
- **Display**: Domain, last checked status, accessibility indicator
- **Validation**: Periodic URL health checks

**ALP Database Mapping**:
- Source: `resource_urls` table
- Metadata: `resource_url_dynamic_parameter_values` table

---

### 2.3 Form Resources

**Purpose**: Interactive Syntaq forms for data collection and client interaction.

```typescript
interface FormResource extends BaseResource {
  type: 'form'
  
  // Form Structure
  formStructure: SyntaqFormStructure
  formVersion: string
  
  // Form State
  isPublished: boolean
  isActive: boolean
  
  // Usage Statistics
  submissionCount: number
  completionRate: number
  averageCompletionTime: number
  
  // Data Management
  responseDataSchema: object
  dataRetentionPeriod: number // days
  
  // Form Configuration
  allowMultipleSubmissions: boolean
  requiresAuthentication: boolean
  notificationSettings: FormNotificationSettings
  
  // Integration
  syntaqFormId: string
  webhookUrl?: string
  
  // Validation Rules
  validationRules: FormValidationRule[]
}

interface SyntaqFormStructure {
  fields: FormField[]
  pages: FormPage[]
  logic: FormLogic[]
  styling: FormStyling
}

interface FormNotificationSettings {
  notifyOnSubmission: boolean
  notificationEmails: string[]
  autoResponder: boolean
  autoResponderTemplate?: string
}
```

**Portal Integration**:
- **Icon**: FormInput (Lucide)
- **Actions**: Open Form, View Submissions, Edit (if permissions), Preview
- **Display**: Submission count, completion rate, last submission date
- **Integration**: Direct Syntaq form embedding

**ALP Database Mapping**:
- Source: `syntaq_forms` table
- Submissions: `syntaq_form_records` table

---

### 2.4 Email Template Resources

**Purpose**: Standardized email templates for client communications and internal processes.

```typescript
interface EmailTemplateResource extends BaseResource {
  type: 'email_template'
  
  // Template Content
  subject: string
  bodyHtml: string
  bodyText: string
  
  // Template Variables
  templateVariables: TemplateVariable[]
  requiredVariables: string[]
  
  // Categorization
  templateCategory: 'client_communication' | 'internal' | 'marketing' | 'legal_notice' | 'system'
  useCase: string
  
  // Usage Tracking
  usageCount: number
  lastUsed?: string
  
  // Template Configuration
  isSystemTemplate: boolean
  allowCustomization: boolean
  
  // Compliance
  requiresApproval: boolean
  approvedBy?: string
  approvedAt?: string
  complianceNotes?: string
}

interface TemplateVariable {
  name: string
  type: 'text' | 'date' | 'number' | 'boolean'
  description: string
  defaultValue?: string
  isRequired: boolean
  validationPattern?: string
}
```

**Portal Integration**:
- **Icon**: Mail (Lucide)
- **Actions**: Preview, Use Template, Edit, Copy
- **Display**: Category, usage count, last used date
- **Editor**: Rich text editor with variable insertion

**ALP Database Mapping**:
- Source: `email_templates` table
- Usage tracking: Custom analytics table

---

### 2.5 VD SharePoint Folder Resources

**Purpose**: Structured document collections in SharePoint with direct navigation and folder management.

```typescript
interface VDSharePointFolderResource extends BaseResource {
  type: 'vd_sharepoint_folder'
  
  // SharePoint Properties
  sharePointUrl: string
  siteUrl: string
  folderPath: string
  folderId: string
  
  // Folder Structure
  parentFolderId?: string
  subfolders: SharePointFolder[]
  
  // Content Information
  itemCount: number
  totalSize: number
  lastSynced?: string
  
  // Access Control
  permissions: SharePointPermission[]
  inheritPermissions: boolean
  
  // Synchronization
  syncStatus: 'synced' | 'pending' | 'error' | 'never'
  lastSyncError?: string
  autoSync: boolean
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'manual'
  
  // Folder Metadata
  folderType: 'offering' | 'matter' | 'client' | 'template' | 'archive'
  businessArea?: string
  
  // Integration Settings
  enableDirectEdit: boolean
  showInExplorer: boolean
}

interface SharePointFolder {
  name: string
  path: string
  itemCount: number
  lastModified: string
}

interface SharePointPermission {
  principalType: 'user' | 'group'
  principalName: string
  permissionLevel: 'read' | 'contribute' | 'full_control'
}
```

**Portal Integration**:
- **Icon**: Folder (Lucide) + SharePoint indicator
- **Actions**: Open in SharePoint, Open in Explorer, Sync Now, Manage Permissions
- **Display**: Item count, last synced, sync status
- **Navigation**: Direct folder opening in new window

**ALP Database Mapping**:
- Source: New table `vd_sharepoint_folders`
- Permissions: New table `sharepoint_folder_permissions`
- Sync logs: New table `sharepoint_sync_logs`

---

### 2.6 Video Resources (NEW)

**Purpose**: Training videos, explanatory content, and procedural demonstrations.

```typescript
interface VideoResource extends BaseResource {
  type: 'video'
  
  // Video Properties
  videoUrl: string
  duration: number // seconds
  resolution: string // "1920x1080"
  format: string // "mp4", "webm", "mov"
  fileSize: number
  
  // Visual Assets
  thumbnailUrl?: string
  previewGifUrl?: string
  posterImageUrl?: string
  
  // Content Structure
  chapters: VideoChapter[]
  transcriptText?: string
  subtitles: VideoSubtitle[]
  
  // Hosting & Delivery
  hostingPlatform: 'internal' | 'youtube' | 'vimeo' | 'sharepoint' | 'azure_media'
  streamingUrl?: string
  downloadUrl?: string
  embedCode?: string
  
  // Video Metadata
  videoType: 'training' | 'explanation' | 'procedure' | 'presentation' | 'demo'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  targetAudience: 'lawyers' | 'staff' | 'clients' | 'all'
  
  // Accessibility
  hasClosedCaptions: boolean
  hasAudioDescription: boolean
  isSignLanguageAvailable: boolean
  
  // Analytics
  viewCount: number
  averageWatchTime: number
  completionRate: number
  lastViewed?: string
  
  // Quality & Processing
  processingStatus: 'pending' | 'processing' | 'ready' | 'error'
  qualityLevels: VideoQuality[]
  
  // Content Management
  isLive: boolean
  scheduledPublishDate?: string
  expiryDate?: string
}

interface VideoChapter {
  title: string
  startTime: number // seconds
  endTime: number // seconds
  description?: string
  thumbnailUrl?: string
}

interface VideoSubtitle {
  language: string
  url: string
  isDefault: boolean
}

interface VideoQuality {
  resolution: string
  bitrate: number
  url: string
  fileSize: number
}
```

**Portal Integration**:
- **Icon**: Play (Lucide) + Video indicator
- **Actions**: Play, Download (if allowed), Share, Add to Playlist
- **Display**: Duration, resolution, view count, last viewed
- **Player**: Embedded video player with chapters, subtitles, speed controls

**ALP Database Mapping**:
- Source: New table `video_resources`
- Chapters: New table `video_chapters`
- Subtitles: New table `video_subtitles`
- Analytics: New table `video_analytics`

---

## 3. Portal Integration Patterns

### 3.1 Resource Card Display

Each resource type has a standardized card layout with type-specific information:

```typescript
interface ResourceCardProps {
  resource: Resource
  displayMode: 'compact' | 'detailed'
  showActions: boolean
  showMetadata: boolean
}
```

**Common Card Elements**:
- Resource icon (type-specific)
- Name and description
- Type badge
- Last modified date
- Action buttons (type-specific)

**Type-Specific Card Elements**:

| Resource Type | Specific Display Elements |
|---------------|---------------------------|
| Document | File size, version, page count |
| URL | Domain, accessibility status |
| Form | Submission count, completion rate |
| Email Template | Category, usage count |
| VD SharePoint Folder | Item count, sync status |
| Video | Duration, view count, resolution |

### 3.2 Action Patterns

**Universal Actions** (all types):
- Preview/View
- Copy link
- Edit metadata
- Delete

**Type-Specific Actions**:

| Resource Type | Specific Actions |
|---------------|------------------|
| Document | Download, Edit (templates), Version history |
| URL | Open in new tab, Check status |
| Form | Open form, View submissions, Edit form |
| Email Template | Use template, Preview email |
| VD SharePoint Folder | Open in SharePoint, Sync now |
| Video | Play, Download, Add to playlist |

### 3.3 Search and Filtering

**Universal Filters**:
- Resource type
- Creation date range
- Last modified date range
- Tags
- Access level

**Type-Specific Filters**:
- **Documents**: File type, size range, version
- **URLs**: Domain, accessibility status
- **Forms**: Published status, submission count range
- **Email Templates**: Category, usage frequency
- **VD SharePoint Folders**: Sync status, item count range
- **Videos**: Duration range, resolution, hosting platform

---

## 4. Technical Implementation Guide

### 4.1 Database Schema Updates

**New Tables Required**:

```sql
-- VD SharePoint Folders
CREATE TABLE vd_sharepoint_folders (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sharepoint_url VARCHAR(500) NOT NULL,
    site_url VARCHAR(500) NOT NULL,
    folder_path VARCHAR(500) NOT NULL,
    folder_id VARCHAR(255),
    parent_folder_id INTEGER,
    item_count INTEGER DEFAULT 0,
    total_size BIGINT DEFAULT 0,
    last_synced TIMESTAMP,
    sync_status INTEGER DEFAULT 1, -- 1=synced, 2=pending, 3=error, 4=never
    last_sync_error TEXT,
    auto_sync BOOLEAN DEFAULT TRUE,
    sync_frequency INTEGER DEFAULT 1, -- 1=realtime, 2=hourly, 3=daily, 4=manual
    folder_type INTEGER, -- 1=offering, 2=matter, 3=client, 4=template, 5=archive
    business_area VARCHAR(255),
    enable_direct_edit BOOLEAN DEFAULT TRUE,
    show_in_explorer BOOLEAN DEFAULT TRUE,
    inherit_permissions BOOLEAN DEFAULT TRUE,
    inserted_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    inserted_by_id INTEGER,
    last_updated_by_id INTEGER,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Video Resources
CREATE TABLE video_resources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    video_url VARCHAR(500) NOT NULL,
    duration INTEGER NOT NULL, -- seconds
    resolution VARCHAR(20),
    format VARCHAR(10),
    file_size BIGINT,
    thumbnail_url VARCHAR(500),
    preview_gif_url VARCHAR(500),
    poster_image_url VARCHAR(500),
    transcript_text TEXT,
    hosting_platform INTEGER, -- 1=internal, 2=youtube, 3=vimeo, 4=sharepoint, 5=azure_media
    streaming_url VARCHAR(500),
    download_url VARCHAR(500),
    embed_code TEXT,
    video_type INTEGER, -- 1=training, 2=explanation, 3=procedure, 4=presentation, 5=demo
    difficulty INTEGER, -- 1=beginner, 2=intermediate, 3=advanced
    target_audience INTEGER, -- 1=lawyers, 2=staff, 3=clients, 4=all
    has_closed_captions BOOLEAN DEFAULT FALSE,
    has_audio_description BOOLEAN DEFAULT FALSE,
    is_sign_language_available BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    average_watch_time INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0,
    last_viewed TIMESTAMP,
    processing_status INTEGER DEFAULT 1, -- 1=pending, 2=processing, 3=ready, 4=error
    is_live BOOLEAN DEFAULT FALSE,
    scheduled_publish_date TIMESTAMP,
    expiry_date TIMESTAMP,
    inserted_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    inserted_by_id INTEGER,
    last_updated_by_id INTEGER,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Video Chapters
CREATE TABLE video_chapters (
    id SERIAL PRIMARY KEY,
    video_resource_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    start_time INTEGER NOT NULL, -- seconds
    end_time INTEGER NOT NULL, -- seconds
    description TEXT,
    thumbnail_url VARCHAR(500),
    chapter_order INTEGER,
    inserted_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    inserted_by_id INTEGER,
    last_updated_by_id INTEGER,
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (video_resource_id) REFERENCES video_resources(id)
);

-- Video Subtitles
CREATE TABLE video_subtitles (
    id SERIAL PRIMARY KEY,
    video_resource_id INTEGER NOT NULL,
    language VARCHAR(10) NOT NULL,
    subtitle_url VARCHAR(500) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    inserted_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    inserted_by_id INTEGER,
    last_updated_by_id INTEGER,
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (video_resource_id) REFERENCES video_resources(id)
);

-- Video Quality Levels
CREATE TABLE video_quality_levels (
    id SERIAL PRIMARY KEY,
    video_resource_id INTEGER NOT NULL,
    resolution VARCHAR(20) NOT NULL,
    bitrate INTEGER,
    quality_url VARCHAR(500) NOT NULL,
    file_size BIGINT,
    inserted_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    inserted_by_id INTEGER,
    last_updated_by_id INTEGER,
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (video_resource_id) REFERENCES video_resources(id)
);
```

### 4.2 API Endpoint Specifications

**Base Resource Endpoints**:
```
GET    /api/resources/{entityType}/{entityId}
POST   /api/resources/{entityType}/{entityId}
PUT    /api/resources/{resourceId}
DELETE /api/resources/{resourceId}
```

**Type-Specific Endpoints**:
```
-- Video Resources
GET    /api/resources/videos/{videoId}/chapters
POST   /api/resources/videos/{videoId}/chapters
GET    /api/resources/videos/{videoId}/analytics
POST   /api/resources/videos/{videoId}/view-event

-- VD SharePoint Folders
POST   /api/resources/sharepoint-folders/{folderId}/sync
GET    /api/resources/sharepoint-folders/{folderId}/permissions
PUT    /api/resources/sharepoint-folders/{folderId}/permissions

-- Forms
GET    /api/resources/forms/{formId}/submissions
POST   /api/resources/forms/{formId}/submit
GET    /api/resources/forms/{formId}/analytics

-- Email Templates
POST   /api/resources/email-templates/{templateId}/use
GET    /api/resources/email-templates/{templateId}/preview

-- Documents
GET    /api/resources/documents/{documentId}/versions
POST   /api/resources/documents/{documentId}/lock
DELETE /api/resources/documents/{documentId}/lock

-- URLs
POST   /api/resources/urls/{urlId}/check-status
GET    /api/resources/urls/{urlId}/analytics
```

### 4.3 Component Architecture

**Core Components**:
```typescript
// Base resource components
ResourceCard.vue
ResourceDetailModal.vue
ResourceFilters.vue
ResourceSearch.vue

// Type-specific components
DocumentViewer.vue
VideoPlayer.vue
FormRenderer.vue
EmailTemplateEditor.vue
SharePointFolderBrowser.vue
UrlStatusChecker.vue

// Integration components
ResourceSelector.vue
ResourceUploader.vue
ResourceBulkActions.vue
```

---

## 5. Data Migration Strategy

### 5.1 Migration Phases

**Phase 1: Schema Extension**
- Add new tables for videos and VD SharePoint folders
- Extend existing resource tables with new fields
- Create migration scripts for data transformation

**Phase 2: Data Migration**
- Migrate existing documents from `documents` table
- Migrate existing URLs from `resource_urls` table
- Migrate existing forms from `syntaq_forms` table
- Migrate existing email templates from `email_templates` table

**Phase 3: Enhancement**
- Add new video resources
- Configure VD SharePoint folder integrations
- Implement enhanced metadata for all types

### 5.2 Migration Scripts

**Document Migration**:
```sql
INSERT INTO portal_resources (
    id, name, description, type, created_at, updated_at,
    file_name, file_extension, file_size, mime_type,
    storage_identifier, version, extracted_text
)
SELECT 
    d.id,
    d.file_name,
    COALESCE(d.extracted_text, ''),
    'document',
    d.inserted_at,
    d.updated_at,
    d.file_name,
    d.file_extension,
    dv.file_size,
    CASE 
        WHEN d.file_extension = 'pdf' THEN 'application/pdf'
        WHEN d.file_extension = 'docx' THEN 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ELSE 'application/octet-stream'
    END,
    dv.file_storage_identifier,
    dv.version_number,
    d.extracted_text
FROM documents d
JOIN document_versions dv ON d.id = dv.document_id
WHERE d.discriminator = 'ResourceDocument'
AND dv.version_number = (
    SELECT MAX(version_number) 
    FROM document_versions 
    WHERE document_id = d.id
);
```

### 5.3 Data Validation

**Validation Checks**:
- Verify all existing resources are migrated
- Validate file accessibility and URLs
- Check metadata integrity
- Confirm permission mappings
- Test search functionality

---

## 6. Security & Access Control

### 6.1 Access Level Definitions

**Public**: Available to all authenticated users
**Restricted**: Available to specific roles or users
**Confidential**: Available only to designated users with explicit permissions

### 6.2 Permission Model

```typescript
interface ResourcePermission {
  resourceId: string
  principalType: 'user' | 'role' | 'group'
  principalId: string
  permissionLevel: 'read' | 'write' | 'admin'
  grantedBy: string
  grantedAt: string
  expiresAt?: string
}
```

### 6.3 Audit Trail

All resource operations are logged:
- Resource creation, modification, deletion
- Access attempts and permissions changes
- File downloads and views
- Form submissions and email template usage

---

## 7. UI/UX Specifications

### 7.1 Resource Icons

| Resource Type | Icon | Color |
|---------------|------|-------|
| Document | FileText | Blue (#3B82F6) |
| URL | Link + ExternalLink | Green (#10B981) |
| Form | FormInput | Purple (#8B5CF6) |
| Email Template | Mail | Orange (#F59E0B) |
| VD SharePoint Folder | Folder | Indigo (#6366F1) |
| Video | Play | Red (#EF4444) |

### 7.2 Resource Card Layouts

**Compact Mode** (for lists):
- Icon + Name + Type badge
- Single line description (truncated)
- Quick action buttons (hover)

**Detailed Mode** (for modals):
- Large icon + Full name + Type badge
- Full description (up to 4 lines)
- Complete metadata display
- All available action buttons

### 7.3 Modal Specifications

**Resource Detail Modal**:
- Header: Icon, name, type badge, close button
- Content: Description, metadata, preview (if applicable)
- Actions: Type-specific action buttons
- Footer: Created/modified information

---

## 8. Integration Points

### 8.1 SharePoint Integration

**Authentication**: OAuth 2.0 with Microsoft Graph API
**Permissions**: Inherit from SharePoint site permissions
**Sync**: Real-time webhooks + periodic batch sync
**Navigation**: Direct deep-linking to folders and files

### 8.2 Video Hosting Platforms

**Internal (Azure Media Services)**:
- Direct upload and encoding
- Adaptive streaming
- Analytics integration

**YouTube/Vimeo**:
- Embed code integration
- Thumbnail extraction
- View count synchronization

### 8.3 External System Connections

**Syntaq Forms**: Direct API integration for form management
**Azure Storage**: Document storage and retrieval
**Microsoft Graph**: SharePoint and email integration
**Analytics Platforms**: Usage tracking and reporting

---

## 9. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [ ] Database schema updates
- [ ] Base resource type interfaces
- [ ] Core API endpoints
- [ ] Basic UI components

### Phase 2: Core Types (Weeks 3-4)
- [ ] Document resource implementation
- [ ] URL resource implementation
- [ ] Form resource implementation
- [ ] Email template resource implementation

### Phase 3: New Types (Weeks 5-6)
- [ ] VD SharePoint folder implementation
- [ ] Video resource implementation
- [ ] Integration testing
- [ ] Performance optimization

### Phase 4: Enhancement (Weeks 7-8)
- [ ] Advanced search and filtering
- [ ] Analytics and reporting
- [ ] Bulk operations
- [ ] Mobile responsiveness

### Phase 5: Migration & Launch (Weeks 9-10)
- [ ] Data migration scripts
- [ ] User acceptance testing
- [ ] Documentation and training
- [ ] Production deployment

---

## 10. Success Metrics

### 10.1 Technical Metrics
- Resource load time < 2 seconds
- Search response time < 500ms
- 99.9% uptime for resource access
- Zero data loss during migration

### 10.2 User Experience Metrics
- Resource discovery time reduced by 50%
- User satisfaction score > 4.5/5
- Support tickets related to resources reduced by 75%
- Resource usage increased by 40%

### 10.3 Business Metrics
- Time to find relevant resources reduced by 60%
- Improved matter completion times
- Enhanced client service delivery
- Reduced training time for new staff

---

## Conclusion

This specification provides a comprehensive framework for implementing an enhanced resource type system in the ALP Portal. The design maintains backward compatibility with existing systems while introducing powerful new capabilities for video content and SharePoint integration.

The modular architecture ensures that each resource type can be developed and deployed independently, allowing for iterative improvement and feature enhancement over time.

**Next Steps**:
1. Review and approve this specification
2. Begin Phase 1 implementation
3. Set up development environment and testing frameworks
4. Establish integration testing protocols with existing ALP systems

---

**Document Control**:
- **Version**: 1.0
- **Last Updated**: January 2025
- **Next Review**: March 2025
- **Approval Required**: Technical Lead, Product Owner, Security Team
