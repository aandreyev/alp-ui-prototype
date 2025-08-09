# Resource Association Design Document

## Overview

This document outlines the design and implementation plan for enabling resource association functionality within the offering designer. This feature will allow users to associate existing resources or create new resources at the offering, outcome, and component levels.

## Current State Analysis

### Existing Systems
1. **Resource Types Management** (`/components/ui/admin/resources/`)
   - Resource creation, editing, deletion
   - 6 resource types: Documents, URLs, Forms, Email Templates, Videos, VD SharePoint Folders
   - Configuration-driven approach with type-specific forms

2. **Portal Resources** (`/components/business/resources/`)
   - Hierarchical display of offerings → outcomes → components
   - Resource filtering and search
   - Static resource associations in test data

### Gap Identification
- **No dynamic resource association** - Resources are currently hard-coded in test data
- **No resource selection interface** - No way to browse and select existing resources
- **No resource creation workflow** - Cannot create new resources from within the offering designer
- **No association management** - Cannot add/remove resource associations

## Functional Requirements

### 1. Unified Resource Association Modal
**Primary Interface:** A single reusable modal dialog that allows users to associate resources with any entity (offering/outcome/component)

**Key Features:**
- **Context-Aware**: Automatically adapts based on entity type (offering/outcome/component)
- **Entity Context Display**: Clear indication of which entity resources are being associated with
- **Dual Functionality**: 
  - Associate existing resources
  - Create new resources (integrated sub-process)
- **Phase 1 Scope**: Focus on Documents only, extend to other types later
- **Search & Browse**: Search existing resources by name, type, tags
- **Preview**: Show resource details before association
- **Bulk Operations**: Select multiple resources at once
- **Unified Experience**: Same modal interface regardless of association level

### 2. Resource Creation Workflow
**Integration Point:** Leverage existing `ResourceAddModal` component

**Enhanced Features:**
- **Context Awareness**: Pre-populate relevant fields based on the entity being associated
- **Return to Association**: After creating a resource, automatically associate it with the entity
- **Validation**: Ensure required fields are completed before association

### 3. Association Management
**CRUD Operations:**
- **Create**: Add new resource associations
- **Read**: Display current associations in hierarchy
- **Update**: Modify association metadata (e.g., relationship type, priority)
- **Delete**: Remove associations (soft delete to maintain audit trail)

### 4. Enhanced Hierarchy Display
**Current `EnhancedOutcomesTab.vue` Enhancements:**
- **Association Indicators**: Visual cues showing resource count per entity
- **Quick Actions**: Add/manage resources directly from hierarchy view
- **Contextual Menus**: Right-click or action buttons for resource operations

## Technical Architecture

### 1. Component Structure
```
ResourceAssociationModal.vue (NEW)
├── ResourceSelector.vue (NEW)
│   ├── ExistingResourceBrowser.vue (NEW)
│   └── NewResourceCreator.vue (ENHANCED ResourceAddModal)
├── ResourceAssociationList.vue (NEW)
└── AssociationMetadata.vue (NEW)
```

### 2. Data Model Extensions

#### Simplified Association Entity
```typescript
interface ResourceAssociation {
  id: string
  resourceId: string
  entityType: 'offering' | 'outcome' | 'component'
  entityId: string
  addedAt: Date
}
```

#### Enhanced Entity Interfaces
```typescript
interface EnhancedOffering {
  // ... existing properties
  resourceAssociations?: ResourceAssociation[]
}

interface EnhancedOutcome {
  // ... existing properties  
  resourceAssociations?: ResourceAssociation[]
}

interface EnhancedComponent {
  // ... existing properties
  resourceAssociations?: ResourceAssociation[]
}
```

### 3. API Integration Points

#### Resource Browsing
- **Search Endpoint**: Filter resources by type, name, tags
- **Pagination**: Handle large resource libraries
- **Type-specific Queries**: Optimized queries per resource type

#### Association Management
- **Create Association**: POST `/api/associations`
- **List Associations**: GET `/api/entities/{id}/associations`
- **Update Association**: PUT `/api/associations/{id}`
- **Delete Association**: DELETE `/api/associations/{id}`

## User Experience Design

### 1. Workflow: Associate Existing Resource

```
1. User clicks "Add Resource" on offering/outcome/component
2. ResourceAssociationModal opens
3. User selects "Associate Existing Resource"
4. User selects resource type (optional filter)
5. User searches/browses available resources
6. User previews selected resource
7. User confirms association
8. Modal closes, hierarchy updates with new association
```

### 2. Workflow: Create New Resource

```
1. User clicks "Add Resource" on offering/outcome/component
2. ResourceAssociationModal opens
3. User selects "Create New Resource"
4. User selects resource type
5. NewResourceCreator (enhanced ResourceAddModal) opens
6. User fills out resource details
7. Resource is created and automatically associated
8. Modal closes, hierarchy updates with new resource
```

### 3. Visual Design Patterns

#### Modal Layout
- **Header**: Entity context (e.g., "Add Resource to Outcome: Property Settlement")
- **Tab Navigation**: "Existing Resources" | "Create New"
- **Main Content**: Search/browse interface or creation form
- **Footer**: Action buttons (Cancel, Associate/Create)

#### Resource Browser
- **Search Bar**: Real-time filtering
- **Type Filter**: Chips or dropdown for resource types
- **Resource Cards**: Compact cards showing key resource details
- **Selection State**: Clear indication of selected resources
- **Pagination**: Handle large result sets

#### Association Display
- **Hierarchy Integration**: Resources shown under each entity level
- **Resource Badges**: Type indicators, association type
- **Quick Actions**: Edit association, remove association
- **Expandable Details**: Click to show full resource information

## Implementation Phases

### Phase 1: Foundation (Core Modal & Selection)
**Components to Build:**
- `ResourceAssociationModal.vue`
- `ExistingResourceBrowser.vue`
- Basic search and selection functionality

### Phase 2: Resource Creation Integration
**Enhancements:**
- Integrate `ResourceAddModal` into association workflow
- Context-aware resource creation
- Automatic association after creation

### Phase 3: Association Management
**Features:**
- Association metadata management
- CRUD operations for associations
- Enhanced hierarchy display

### Phase 4: Advanced Features
**Enhancements:**
- Bulk operations
- Association types and priorities
- Advanced filtering and search

## Technical Considerations

### 1. State Management
- **Local State**: Modal state, selection state, form state
- **Global State**: Resource library, association cache
- **Reactivity**: Ensure hierarchy updates reflect associations

### 2. Performance
- **Lazy Loading**: Load resources on-demand
- **Caching**: Cache resource lists and search results
- **Virtualization**: Handle large resource libraries efficiently

### 3. Data Consistency
- **Optimistic Updates**: Update UI before server confirmation
- **Error Handling**: Rollback on failures
- **Conflict Resolution**: Handle concurrent modifications

### 4. Testing Strategy
- **Unit Tests**: Component behavior, data transformations
- **Integration Tests**: Modal workflows, API interactions
- **E2E Tests**: Complete user workflows

## Requirements Clarified ✅

1. **Association Types**: ❌ No different types needed - simple associations only
2. **Permissions**: ✅ Anyone can associate/disassociate resources
3. **Validation Rules**: ❌ No restrictions on resource associations
4. **Bulk Operations**: ✅ High priority - checkbox selection for multiple resources
5. **Search Scope**: ✅ Search title, description, and metadata fields
6. **Historical Data**: ❌ No association history tracking needed

## Success Criteria

### Functional
- ✅ Users can associate existing resources with entities
- ✅ Users can create new resources during association workflow
- ✅ Associations are properly displayed in hierarchy
- ✅ Users can manage (edit/remove) associations

### Technical
- ✅ Components are reusable and maintainable
- ✅ Performance is acceptable with large resource libraries
- ✅ Integration with existing systems is seamless
- ✅ Error handling is robust and user-friendly

### User Experience
- ✅ Workflow is intuitive and efficient
- ✅ Visual feedback is clear and immediate
- ✅ Search and browsing is responsive
- ✅ Context is preserved throughout the workflow

---

**Next Steps:**
1. Review and validate requirements
2. Create wireframes/mockups for key interfaces
3. Begin Phase 1 implementation
4. Iterate based on user feedback
