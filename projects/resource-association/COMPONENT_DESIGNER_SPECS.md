# Component Designer Page - Resource Association Specifications

## Overview

This document outlines the specifications for a new streamlined Component Designer page within the Offering Designer that focuses on efficient resource association functionality. This page will replace or complement the existing component designer with enhanced resource management capabilities.

## Current State Analysis

### Existing System Context
1. **Offering Designer Main Page** - Shows overall offering design starting with outcomes
2. **Component Selection** - Components can be selected from existing templates or created new
3. **Current Resource Association** - Resources can be associated with:
   - Components (via Component Designer page)
   - Offerings (via Resources tab on main page)

### Identified Gaps
- **Complex Resource Association Flow** - Current process may be cumbersome
- **Limited Resource Visibility** - Hard to see all associated resources at once
- **Fragmented Experience** - Resource association scattered across different interfaces

## New Component Designer Page Specifications

### Page Purpose
Create a dedicated, streamlined interface for managing component details and their associated resources in a single, efficient workflow. This drawer interface covers 90% of the screen to maintain context while providing focused editing capabilities.

### Page Structure

This page is hosted in a drawer that overlays 90% of the screen from the Offering Designer main page. When the drawer is closed the user returns to the Offering Designer with 10% of the main page remaining visible for context.

### Resource Type Scope
**Phase 1 Implementation**: Focus on Documents only to establish the pattern, then extend to all other resource types (URLs, Forms, Email Templates, Videos, VD Folders) in subsequent phases.

#### 1. Header Section
```
Component Designer: [Component Name]
┌─────────────────────────────────────────────────────────────┐
│ [< Back to Offering] [Component Name Input] [Save] [Cancel] │
│ Component Type: [Dropdown] | Template: [Template Name]      │
└─────────────────────────────────────────────────────────────┘
```

**Elements:**
- **Breadcrumb Navigation**: Back to main Offering Designer in the context of the Offering being designed
- **Component Name**: Editable inline text field
- **Component Type**: Dropdown selector
- **Template Reference**: All components become templates. At present, a change to the template updates the components in all associated Offerings
- **Action Buttons**: Save changes, Cancel (return to main page)

#### 2. Component Details Section
```
Component Information
┌─────────────────────────────────────────────────────────────┐
│ Name: [Input Field]                                         │
│ Description: [Textarea]                                     │
│ Type: [Dropdown: Task, Deliverable, Milestone, etc.]       │
│ Estimated units: [Input-time in units] | Budget: [Input-$]  │
│ Law Sub-Area: [Dropdown]                                    │
│ Instructions: [Rich Text Editor]                           │
└─────────────────────────────────────────────────────────────┘
```

**Fields:**
- **Name**: Component title (editable)
- **Description**: Brief component description
- **Type**: Component classification
- **Estimated Units**: Estimated time in units
- **Budget**: Estimated value in dollars (for creating budgets)
- **Law Sub-Area**: Associated law sub-area relevant to component
- **Instructions**: Detailed component instructions

#### 3. Associated Resources Section (Primary Focus)
```
Associated Resources (5)                    [+ Add Resources]
┌─────────────────────────────────────────────────────────────┐
│ [📄] Purchase Agreement Template              [Edit] [×]    │
│     Document • Updated 2 days ago • Legal Documents        │
│                                                             │
│ [🔗] Property Search Checklist               [Edit] [×]    │
│     URL • Updated 1 week ago • Checklists                  │
│                                                             │
│ [📝] Client Information Form                 [Edit] [×]    │
│     Form • Updated 3 days ago • Data Collection            │
│                                                             │
│ [📧] Initial Contact Email                   [Edit] [×]    │
│     Email Template • Updated 5 days ago • Communication    │
│                                                             │
│ [🎥] Property Inspection Guide               [Edit] [×]    │
│     Video • Updated 1 week ago • Training Materials        │
│                                                             │
│ [📁] VD Shared Folder - Property Files      [Edit] [×]    │
│     VD Folder • Updated 2 days ago • File Storage          │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- **Resource Count**: Display total associated resources
- **Resource Cards**: Compact display with key information
- **Resource Icons**: Visual indicators for each resource type
- **Quick Actions**: Edit and Remove buttons for each resource
- **Resource Metadata**: Type, last updated, category/tags
- **Sort**: By resource type

#### 4. Add Resources Workflow
```
[+ Add Resources] → Resource Association Modal
┌─────────────────────────────────────────────────────────────┐
│ Add Resources to: Property Purchase Component              │
│ ┌─ Existing Resources ─┐ ┌─ Create New ─┐                  │
│ │ [Active Tab]         │ │              │                  │
│ └──────────────────────┘ └─-────────────┘                  │
│                                                             │
│ Search: [_______________] 🔍 Type: [All ▼] [🔄 Refresh]     │
│                                                             │
│ ☐ Select All | ☐ Documents ☐ URLs ☐ Forms ☐ Email ☐ Video │
│                                                             │
│ ☐ [📄] Property Contract Template                          │
│   Document • Legal Templates • 2MB                         │
│                                                             │
│ ☐ [🔗] Property Valuation Tool                            │
│   URL • External Tools • Updated yesterday                  │
│                                                             │
│ ☐ [📝] Property Inspection Checklist                      │
│   Form • Quality Assurance • Created last week             │
│                                                             │
│ ... [Load More] [12 of 45 resources]                       │
│                                                             │
│ [Cancel] [Associate Selected (3)]                          │
└─────────────────────────────────────────────────────────────┘
```

**Modal Features:**
- **Tab Navigation**: Switch between "Existing Resources" and "Create New"
- **Search Functionality**: Real-time search across title, description, metadata
- **Type Filtering**: Filter by resource type(s)
- **Bulk Selection**: Checkbox selection with "Select All" option
- **Resource Preview**: Show key details without opening full view
- **Pagination**: Handle large resource libraries efficiently
- **Association Count**: Show how many resources will be associated

### User Workflows

#### 1. Edit Component with Resource Association
```
1. User navigates to Component Designer from Offering Designer
2. Page loads with component details and existing associated resources
3. User can:
   - Edit component information inline
   - View all associated resources at a glance
   - Remove resources with single click
   - Edit individual resources via quick actions
4. User clicks "Add Resources" to associate more resources
5. Modal opens with search and selection interface
6. User selects multiple resources and confirms association
7. Page updates with new resources immediately visible
8. User saves component changes
```

#### 2. Create New Resource During Association
```
1. User clicks "Add Resources" button
2. Modal opens, user switches to "Create New" tab
3. User selects resource type and fills out creation form
4. New resource is created and automatically associated
5. User returns to component designer with new resource visible
6. User saves component changes
```

#### 3. Bulk Resource Management
```
1. User sees list of associated resources
2. User can select multiple resources (future enhancement)
3. User can perform bulk actions:
   - Remove multiple resources
   - Apply bulk tags/categories
   - Export resource list
```

### Technical Implementation

#### Component Structure
```
ComponentDesignerPage.vue
├── ComponentHeader.vue
├── ComponentDetailsForm.vue
├── AssociatedResourcesList.vue
│   ├── ResourceCard.vue (compact version)
│   └── ResourceActions.vue
├── AddResourcesButton.vue
└── ResourceAssociationModal.vue (shared component)
    ├── ExistingResourcesBrowser.vue
    └── CreateNewResourceForm.vue
```

#### Data Model
```typescript
interface ComponentWithResources {
  id: string
  name: string
  description: string
  type: ComponentType
  duration?: number
  priority: 'high' | 'medium' | 'low'
  instructions?: string
  templateId?: string
  associatedResources: ResourceAssociation[]
  metadata: {
    createdAt: Date
    updatedAt: Date
    createdBy: string
  }
}

interface ResourceAssociation {
  id: string
  resourceId: string
  associatedAt: Date
}
```

#### API Endpoints
```typescript
// Get component with associated resources
GET /api/components/{componentId}/with-resources

// Update component details
PUT /api/components/{componentId}

// Add resource associations
POST /api/components/{componentId}/resources
Body: { resourceIds: string[] }

// Remove resource association
DELETE /api/components/{componentId}/resources/{resourceId}

// Search available resources for association
GET /api/resources/search?q={query}&type={type}&exclude={componentId}
```

### UI/UX Design Principles

#### 1. Streamlined Experience
- **Single Page Focus**: All component and resource management in one place
- **Minimal Navigation**: Reduce clicks between different interfaces
- **Quick Actions**: Common tasks accessible with single clicks

#### 2. Visual Hierarchy
- **Clear Sections**: Distinct areas for component details vs resources
- **Resource Prominence**: Associated resources highly visible
- **Action Clarity**: Clear distinction between view, edit, and delete actions

#### 3. Efficient Workflows
- **Bulk Operations**: Handle multiple resources efficiently
- **Search Integration**: Fast resource discovery
- **Immediate Feedback**: Real-time updates when associations change

#### 4. Responsive Design
- **Mobile Friendly**: Usable on tablets and mobile devices
- **Flexible Layout**: Adapts to different screen sizes
- **Touch Interactions**: Optimized for touch interfaces

### Success Metrics

#### Functional Requirements
- ✅ Component details editing in single interface
- ✅ Clear visibility of all associated resources
- ✅ One-click resource association and removal
- ✅ Efficient bulk resource selection
- ✅ Search across all resource attributes
- ✅ Create new resources during association workflow

#### Performance Requirements
- ✅ Page loads in under 2 seconds
- ✅ Search results appear in under 1 second
- ✅ Resource association updates immediately
- ✅ Handles 100+ associated resources efficiently

#### User Experience Requirements
- ✅ Intuitive workflow for new users
- ✅ Efficient workflow for power users
- ✅ Clear visual feedback for all actions
- ✅ Consistent with existing Offering Designer design

### Future Enhancements

#### Phase 2 Features
- **Resource Templates**: Pre-defined resource sets for component types
- **Smart Suggestions**: AI-recommended resources based on component type
- **Resource Dependencies**: Show relationships between resources
- **Version Management**: Track resource versions and updates

#### Phase 3 Features
- **Collaborative Editing**: Multiple users editing simultaneously
- **Resource Analytics**: Usage statistics and optimization suggestions
- **Integration Hub**: Connect with external resource repositories
- **Automation Rules**: Auto-associate resources based on triggers

### Questions for Clarification

1. **Component Types**: What are the specific component types available?
2. **Resource Limits**: Is there a maximum number of resources per component?
3. **Permissions**: Who can edit components and manage resource associations?
4. **Templates**: How should template-based components handle resource inheritance?
5. **Validation**: Any business rules for required resources per component type?
6. **Integration**: How does this integrate with existing component workflows?

---

**Next Steps:**
1. Review and validate specifications
2. Create wireframes/mockups for the page layout
3. Begin implementation of core component structure
4. Implement resource association functionality
5. Add search and bulk selection features
6. User testing and iteration
