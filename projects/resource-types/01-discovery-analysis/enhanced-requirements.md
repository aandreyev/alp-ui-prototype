# Enhanced Resource Type Requirements

**Document Purpose**: Define comprehensive requirements for the enhanced resource type system, focusing on new Video and VD SharePoint Folder types, plus enhancements to existing types.

---

## Executive Summary

This document outlines the functional and technical requirements for enhancing the ALP resource system from 4 basic types to 6 comprehensive types with rich metadata, type-specific interactions, and advanced capabilities.

## Enhanced System Overview

### Resource Type Evolution

| Resource Type | Current State | Enhanced State | Priority |
|---------------|---------------|----------------|----------|
| **Documents** | ✅ Basic | 🔄 Enhanced | High |
| **URLs** | ✅ Basic | 🔄 Enhanced | High |
| **Forms** | ✅ Basic | 🔄 Enhanced | Medium |
| **Email Templates** | ✅ Basic | 🔄 Enhanced | Medium |
| **VD SharePoint Folders** | ❌ None | 🆕 New | High |
| **Videos** | ❌ None | 🆕 New | High |

## Requirements by Resource Type

### 1. Enhanced Document Resources

#### Functional Requirements

**FR-DOC-001: Rich File Metadata**
- **Requirement**: System must capture and display comprehensive file metadata
- **Details**: MIME type, file size, page count, word count, creation date, author
- **Priority**: High
- **Acceptance Criteria**: All supported file types display relevant metadata

**FR-DOC-002: Document Categorization**
- **Requirement**: System must support document type classification (Types already in Portal but need to be reviewed)
- **Details**: Template, Guide, Form, Reference, Legal, Other
- **Priority**: High
- **Acceptance Criteria**: Users can filter and search by document type

USER - Consider file types, e.g. DOCX, PDF, JPEG, etc.

**FR-DOC-003: Preview Generation**
- **Requirement**: System must generate previews for supported file types
- **Details**: PDF thumbnails, Office document previews, image thumbnails
- **Priority**: Medium
- **Acceptance Criteria**: Previews load within 2 seconds

**FR-DOC-005: Checksum Validation**
- **Requirement**: System must validate document integrity
- **Details**: SHA-256 checksum generation and validation
- **Priority**: Medium
- **Acceptance Criteria**: Corrupted files are detected and flagged

**FR-DOC-004: Security Classification** (Note a priority)
- **Requirement**: System must support document security levels
- **Details**: Public, Restricted, Confidential classifications
- **Priority**: High
- **Acceptance Criteria**: Access control enforced based on classification

#### Technical Requirements

**TR-DOC-001: Enhanced Database Schema**
```sql
ALTER TABLE documents ADD COLUMN mime_type VARCHAR(255);
ALTER TABLE documents ADD COLUMN document_type INTEGER;
ALTER TABLE documents ADD COLUMN security_classification INTEGER;
ALTER TABLE documents ADD COLUMN page_count INTEGER;
ALTER TABLE documents ADD COLUMN word_count INTEGER;
ALTER TABLE documents ADD COLUMN checksum VARCHAR(64);
ALTER TABLE documents ADD COLUMN preview_url VARCHAR(500);
```
USER - include file type?

**TR-DOC-002: Preview Service Integration**
- Integration with Azure Cognitive Services or similar for preview generation
- Support for PDF, Office documents, images
- Fallback to file type icons for unsupported formats

### 2. Enhanced URL Resources

#### Functional Requirements

**FR-URL-001: URL Validation and Health Checking**
- **Requirement**: System must validate URLs and check accessibility
- **Details**: HTTP status checking, response time measurement, SSL validation
- **Priority**: High
- **Acceptance Criteria**: URL status updated within 24 hours

USER - Change status to broken if not available?

**FR-URL-002: Link Categorization**
- **Requirement**: System must categorize URLs by type
- **Details**: External, SharePoint, Website, Internal, Government, Legal Database
- **Priority**: High
- **Acceptance Criteria**: Users can filter by link category

**FR-URL-003: Content Preview**
- **Requirement**: System must extract and display URL metadata
- **Details**: Page title, meta description, favicon, preview image
- **Priority**: Medium
- **Acceptance Criteria**: Metadata displayed within 5 seconds of URL entry

**FR-URL-004: Usage Analytics**
- **Requirement**: System must track URL usage
- **Details**: Click count, last accessed date, user analytics
- **Priority**: Medium
- **Acceptance Criteria**: Analytics available in resource dashboard

#### Technical Requirements

**TR-URL-001: Enhanced Database Schema**
```sql
ALTER TABLE resource_urls ADD COLUMN link_type INTEGER;
ALTER TABLE resource_urls ADD COLUMN domain VARCHAR(255);
ALTER TABLE resource_urls ADD COLUMN last_checked TIMESTAMP;
ALTER TABLE resource_urls ADD COLUMN is_accessible BOOLEAN;
ALTER TABLE resource_urls ADD COLUMN http_status INTEGER;
ALTER TABLE resource_urls ADD COLUMN response_time INTEGER;
ALTER TABLE resource_urls ADD COLUMN ssl_status INTEGER;
ALTER TABLE resource_urls ADD COLUMN click_count INTEGER DEFAULT 0;
ALTER TABLE resource_urls ADD COLUMN last_accessed TIMESTAMP;
ALTER TABLE resource_urls ADD COLUMN title VARCHAR(500);
ALTER TABLE resource_urls ADD COLUMN meta_description TEXT;
ALTER TABLE resource_urls ADD COLUMN favicon_url VARCHAR(500);
ALTER TABLE resource_urls ADD COLUMN preview_image_url VARCHAR(500);
```

### 3. Enhanced Form Resources

> **📋 Integration Reference**: For detailed technical implementation of Syntaq form integration, including current architecture, API endpoints, and recommended enhancements, see [Syntaq Form Integration Analysis](./Syntaq_Form_Integration.md).

#### Functional Requirements

**FR-FORM-001: Form Classification and Categorization**
- **Requirement**: System must support form categorization by business function
- **Details**: Marketing, Sales, VD, Legal, Administrative categories with metadata
- **Priority**: High
- **Acceptance Criteria**: Forms can be filtered and discovered by category
- **Implementation**: See [Syntaq Form Integration Analysis](./Syntaq_Form_Integration.md) for detailed approach

**FR-FORM-002: Enhanced Form Discovery**
- **Requirement**: System must provide advanced form search and filtering
- **Details**: Search by category, resource type, tags, and business function
- **Priority**: High
- **Acceptance Criteria**: Users can quickly find relevant forms for their context
- **Implementation**: Leverages existing Syntaq integration with enhanced metadata

**FR-FORM-003: Form Analytics**
- **Requirement**: System must provide comprehensive form analytics
- **Details**: Submission count, completion rate, average completion time
- **Priority**: Medium
- **Acceptance Criteria**: Analytics dashboard available for form owners
- **Note**: Future enhancement - not in current scope

**FR-FORM-004: Form Versioning**
- **Requirement**: System must support form version control
- **Details**: Version history, rollback capability, change tracking
- **Priority**: Medium
- **Acceptance Criteria**: Users can view and revert to previous versions
- **Note**: Future enhancement - not in current scope

#### Technical Requirements

**TR-FORM-001: Enhanced Syntaq Form Metadata**
```sql
-- Extends existing SyntaqForm model with classification fields
ALTER TABLE syntaq_forms ADD COLUMN category VARCHAR(100);
ALTER TABLE syntaq_forms ADD COLUMN resource_type VARCHAR(100);
ALTER TABLE syntaq_forms ADD COLUMN tags VARCHAR(500);
ALTER TABLE syntaq_forms ADD COLUMN sort_order INTEGER;

-- Add indexes for performance
CREATE INDEX IX_SyntaqForms_Category ON syntaq_forms(category);
CREATE INDEX IX_SyntaqForms_ResourceType ON syntaq_forms(resource_type);
```

**TR-FORM-002: Integration with Existing Architecture**
- Builds on existing `OfferingComponentResource` polymorphic system
- Maintains current Syntaq API integration patterns
- Extends existing service layer with category-based queries
- **Reference**: [Syntaq Form Integration Analysis](./Syntaq_Form_Integration.md) for complete technical details

### 4. Enhanced Email Template Resources

#### Functional Requirements

**FR-EMAIL-002: Template Categorization**
- **Requirement**: System must categorize email templates
- **Details**: Client Communication, Internal, Marketing, Legal Notice, System
- **Priority**: Medium
- **Acceptance Criteria**: Users can filter by template category

**FR-EMAIL-003: Usage Tracking**
- **Requirement**: System must track template usage
- **Details**: Usage count, last used date, user analytics
- **Priority**: Low
- **Acceptance Criteria**: Usage statistics available in dashboard

**FR-EMAIL-001: Template Variables**
- **Requirement**: System must support dynamic template variables
- **Details**: Variable definition, validation, default values
- **Priority**: Medium
- **Acceptance Criteria**: Variables can be inserted and validated

USER - I assume these variables come from Portal data?

#### Technical Requirements

**TR-EMAIL-001: Enhanced Database Schema**
```sql
ALTER TABLE email_templates ADD COLUMN description TEXT;
ALTER TABLE email_templates ADD COLUMN body_html TEXT;
ALTER TABLE email_templates ADD COLUMN body_text TEXT;
ALTER TABLE email_templates ADD COLUMN template_category INTEGER;
ALTER TABLE email_templates ADD COLUMN usage_count INTEGER DEFAULT 0;
ALTER TABLE email_templates ADD COLUMN last_used TIMESTAMP;
ALTER TABLE email_templates ADD COLUMN template_variables JSONB;
```

### 5. VD SharePoint Folder Resources (NEW)

#### Functional Requirements

**FR-VDF-004: Direct Navigation**
- **Requirement**: System must provide direct folder access
- **Details**: Open in SharePoint, open in Explorer, direct file access
- **Priority**: High
- **Acceptance Criteria**: Folders open in new window/tab

**FR-VDF-001: SharePoint Integration**
- **Requirement**: System must integrate with SharePoint Online
- **Details**: OAuth authentication, folder access, permission inheritance
- **Priority**: High
- **Acceptance Criteria**: Users can access SharePoint folders seamlessly

**FR-VDF-002: Folder Synchronization**
- **Requirement**: System must synchronize folder metadata
- **Details**: Item count, folder structure, last modified dates
- **Priority**: High
- **Acceptance Criteria**: Folder metadata updated within 1 hour

**FR-VDF-003: Permission Management**
- **Requirement**: System must manage folder permissions
- **Details**: User/group permissions, inheritance settings, access levels
- **Priority**: High
- **Acceptance Criteria**: Permissions enforced consistently

#### Technical Requirements

**TR-VDF-001: New Database Tables**
```sql
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
    sync_status INTEGER DEFAULT 1,
    -- Additional fields as per specification
);

CREATE TABLE sharepoint_folder_permissions (
    id SERIAL PRIMARY KEY,
    folder_id INTEGER NOT NULL,
    principal_type INTEGER NOT NULL,
    principal_name VARCHAR(255) NOT NULL,
    permission_level INTEGER NOT NULL,
    -- Audit fields
);
```

### 6. Video Resources (NEW)

#### Functional Requirements

**FR-VID-001: Video Metadata Management**
- **Requirement**: System must capture comprehensive video metadata
- **Details**: Duration, resolution, format, file size, hosting platform
- **Priority**: High
- **Acceptance Criteria**: All video metadata displayed accurately

**FR-VID-002: Multiple Hosting Support**
- **Requirement**: System must support multiple video hosting platforms
- **Details**: Internal, YouTube, Vimeo, SharePoint, Azure Media Services
- **Priority**: High
- **Acceptance Criteria**: Videos play regardless of hosting platform

**FR-VID-003: Chapter Management**
- **Requirement**: System must support video chapters
- **Details**: Chapter titles, timestamps, descriptions, thumbnails
- **Priority**: Medium
- **Acceptance Criteria**: Users can navigate to specific chapters

**FR-VID-004: Accessibility Features**
- **Requirement**: System must support accessibility features
- **Details**: Closed captions, subtitles, audio descriptions
- **Priority**: High
- **Acceptance Criteria**: Accessibility features available when provided

**FR-VID-005: Video Analytics**
- **Requirement**: System must track video usage
- **Details**: View count, watch time, completion rate, last viewed
- **Priority**: Medium
- **Acceptance Criteria**: Analytics available in dashboard

#### Technical Requirements

**TR-VID-001: New Database Tables**
```sql
CREATE TABLE video_resources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    video_url VARCHAR(500) NOT NULL,
    duration INTEGER NOT NULL,
    resolution VARCHAR(20),
    format VARCHAR(10),
    file_size BIGINT,
    hosting_platform INTEGER,
    video_type INTEGER,
    view_count INTEGER DEFAULT 0,
    -- Additional fields as per specification
);

CREATE TABLE video_chapters (
    id SERIAL PRIMARY KEY,
    video_resource_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    start_time INTEGER NOT NULL,
    end_time INTEGER NOT NULL,
    -- Additional fields
);
```

## Cross-Cutting Requirements

### Performance Requirements

**PR-001: Response Time**
- Resource loading: < 2 seconds
- Search operations: < 500ms
- Preview generation: < 3 seconds

**PR-002: Scalability**
- Support 10,000+ resources per matter
- Handle 100+ concurrent users
- Scale to 1TB+ of video content

**PR-003: Availability**
- 99.9% uptime for resource access
- Graceful degradation for external services
- Offline capability for critical resources

### Security Requirements

**SR-001: Access Control**
- Resource-level permissions
- Role-based access control
- Audit trail for all access

**SR-002: Data Protection**
- Encryption at rest for sensitive content
- Secure transmission (HTTPS/TLS)
- Data retention policies

**SR-003: Compliance**
- Legal industry compliance requirements
- GDPR compliance for personal data
- Audit logging for compliance reporting

### Integration Requirements

**IR-001: API Compatibility**
- Maintain backward compatibility
- RESTful API design
- Comprehensive error handling

**IR-002: External System Integration**
- SharePoint Online integration
- Azure Media Services integration
- Syntaq platform integration

**IR-003: Portal Integration**
- Seamless integration with existing portal
- Consistent UI/UX patterns
- Mobile-responsive design

## User Experience Requirements

### Usability Requirements

**UR-001: Intuitive Interface**
- Type-specific icons and visual cues
- Consistent interaction patterns
- Clear action buttons and feedback

**UR-002: Search and Discovery**
- Advanced search capabilities
- Type-specific filtering
- Resource recommendations

**UR-003: Mobile Experience**
- Responsive design for all screen sizes
- Touch-friendly interactions
- Offline access for critical resources

### Accessibility Requirements

**AR-001: WCAG Compliance**
- WCAG 2.1 AA compliance
- Screen reader compatibility
- Keyboard navigation support

**AR-002: Multi-language Support**
- Not required

## Implementation Priorities

### Phase 1: Foundation (High Priority)
- Enhanced document metadata
- URL validation and categorization
- VD SharePoint folder basic integration
- Video resource basic functionality

### Phase 2: Enhancement (Medium Priority)
- Preview generation for documents
- Form analytics and versioning
- Video chapters and analytics
- Advanced search capabilities

### Phase 3: Optimization (Low Priority)
- Email template variables
- Advanced video features
- Performance optimizations
- Mobile enhancements

## Success Criteria

### Functional Success Criteria
- [ ] All 6 resource types fully functional
- [ ] Type-specific UI components implemented
- [ ] Search and filtering capabilities operational
- [ ] Integration with external systems working

### Performance Success Criteria
- [ ] Resource loading < 2 seconds
- [ ] Search response < 500ms
- [ ] 99.9% uptime achieved
- [ ] Zero data loss during migration

### User Experience Success Criteria
- [ ] User satisfaction score > 4.5/5
- [ ] Resource discovery time reduced by 50%
- [ ] Support tickets reduced by 75%
- [ ] Training time reduced by 40%

## Risk Assessment

### Technical Risks
- **High**: SharePoint API limitations
- **Medium**: Video hosting platform reliability
- **Low**: Database performance with large datasets

### Business Risks
- **High**: User adoption of new features
- **Medium**: Training requirements for new functionality
- **Low**: Integration complexity with existing workflows

### Mitigation Strategies
- Comprehensive testing and validation
- Phased rollout approach
- User training and documentation
- Fallback mechanisms for external services

---

## Conclusion

The enhanced resource type system will provide comprehensive capabilities for managing all forms of legal practice resources. The requirements outlined in this document ensure:

1. **Rich Functionality**: Advanced features for each resource type
2. **Seamless Integration**: Compatibility with existing ALP systems
3. **Excellent User Experience**: Intuitive and efficient interfaces
4. **Robust Performance**: Fast, reliable, and scalable system
5. **Strong Security**: Comprehensive access control and data protection

Implementation should follow the phased approach to ensure successful delivery and user adoption.

---

**Document Status**: ✅ Complete  
**Next Document**: [User Stories](./user-stories.md)  
**Review Required**: Product Owner, Technical Lead, Security Team
