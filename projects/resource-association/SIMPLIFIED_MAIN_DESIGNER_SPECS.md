# Simplified Main Offering Designer Specifications

## Overview

This document outlines the specifications for a simplified main offering designer page that focuses on clear hierarchy display and streamlined component management. This redesign removes inline editing complexity and provides a clean, read-only view with targeted editing capabilities.

## Current State vs. New Design

### Current Main Designer Issues
- **Complex Inline Editing** - Full component forms displayed on main page
- **Overwhelming Interface** - Too many editable fields visible simultaneously
- **Poor Hierarchy** - Hard to see offering → outcome → component structure
- **No Resource Visibility** - Resources not visible in main view

### New Simplified Design Goals
- **Read-Only Display** - Clean, scannable interface with inline outcome editing
- **Clear Hierarchy** - Offering → Outcomes → Components → Resources (three-level resource association)
- **Targeted Editing** - Associate resources at offering/outcome level on main page. Edit outcome descriptions inline. Edit components via dedicated drawer interface.
- **Resource Visibility** - Show associated resources under each element using consistent display component
- **Context Preservation** - Maintain overview while editing
- **Unified Resource Management** - Same modal reused for all resource association levels

## Page Structure

### 1. Offering Header
```
License your software (licensor)
Protect and exploit your intellectual property (IP) [This is the 'Offering Category' for this Offering. This is set on the Info tab]
[Button: Duplicate Offering]
Offering Resources: (1)
- Offering Overview.docx
[+ Add Offering Resource]
[+ Create Outcome]
```
Note that Offering VD Folder and other Offering details are edited on the Offering Info tab which is separate to the main offering design page. The main offering design page is primarily concerned with Outcomes/Resources

**Elements:**
- **Offering Title** - Main offering name. This is editted on the Info tab
- **Offering Category** - This is the Offering Category to which this Offering is associated. This is editted on the Info tab
- **Duplicate Offering** - This button creates a new Offering with the settings as the existing offering
- **SharePoint Folder Button** - Link to offering's SharePoint folder. This is set on the Info tab
- **Add Offering Resource Button** - Create new Resource that is associated at the Offering level
- **Add Outcome Button** - Create new outcome

### 2. Outcomes Section
```
Outcomes (2)

┌─ You would like assistance settling on licensing business model ─────────┐
│ Associated Resources (1)                                                 |
| 📄 Outcome Checklist.docx                                                |
| [+ Add Resource]                                                         |
|                                                                        │
│ Components (1)                                                           │
│ ┌─ Strategy Paper on Business Models ──────────────────── [Edit] ───┐   │
│ │ 60 units • $4500 • Intellectual property law                      │   │
│ │ We will walk you through various alternative business models...    │   │
│ │                                                                    │   │
│ │ Associated Resources (3)                                           │   │
│ │ 📄 Business Model Template.docx                                   │   │
│ │ 📄 Licensing Agreement Template.pdf                               │   │
│ │ 📄 Market Analysis Guide.pdf                                      │   │
│ └────────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│ [+ Add Component]                                                        │
└──────────────────────────────────────────────────────────────────────────┘
```

**Hierarchy Structure:**
- **Outcome Container** - Expandable section for each outcome
- **Component Cards** - Clean cards showing component summary
- **Resource List** - Associated resources displayed under each component
- **Action Buttons** - Edit component, Add component

### 3. Component Card Design
```
┌─ Component Name ──────────────────────────────────────── [Edit] ───┐
│ Units • Budget • Law Area                                          │
│ Component description (truncated if long)                         │
│                                                                    │
│ Associated Resources (count)                                       │
│ 📄 Resource Name 1                                                │
│ 📄 Resource Name 2                                                │
│ 🔗 Resource Name 3                                                │
│ ... and X more                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Component Card Elements:**
- **Component Name** - Clear, readable title
- **Summary Line** - Units, budget, law area in compact format
- **Description** - Truncated description (expand on hover/click)
- **Edit Button** - Opens Component Designer Drawer
- **Resource Count** - Shows total associated resources
- **Resource List** - First few resources with icons, "and X more" if many
- **Resource Icons** - Visual indicators for resource types

## User Workflows

### 1. Browse Offering Structure
```
1. User lands on simplified main designer
2. User sees clear offering → outcomes → components hierarchy
3. User can expand/collapse outcome sections
4. User can see offering resources at a glance
5. User can see Outcome resources at a glance
6. User can see component summaries and associated resources at a glance
7. User can quickly identify which components need attention
```

### 2. Edit Component
```
1. User clicks "Edit" button on component card
2. Component Designer Drawer opens (90% screen overlay)
3. User edits component details and manages resources
4. User saves changes and drawer closes
5. Main designer updates with new information
```

### 3. Add New Component
```
1. User clicks "Add Component" under an outcome
2. Component Designer Drawer opens in creation mode
3. User fills out component details and associates resources
4. User saves new component
5. New component appears in main designer
```

### 4. Three-Level Resource Management
```
1. User can see offering-level resources at the top
2. User can see outcome-level resources under each outcome
3. User can see component-level resources under each component
4. User can add resources at any level using the same modal
5. User can edit outcome descriptions inline on main page
6. User clicks "Edit" component to manage component details in drawer
```

### 5. Unified Resource Association Workflow
```
1. User clicks "Add Resource" at any level (offering/outcome/component)
2. Same ResourceAssociationModal opens with appropriate context
3. User can associate existing resources or create new ones
4. Resource is automatically associated with the correct entity level
5. Main designer updates immediately with new resource
```

## Visual Design Principles

### 1. Information Hierarchy
- **Level 1: Offering** - Main container with blue accent
- **Level 2: Outcomes** - Secondary containers with gray background
- **Level 3: Components** - White cards with subtle borders
- **Level 4: Resources** - Compact list items with icons

### 2. Visual Indicators
- **Resource Count Badges** - Show number of associated resources
- **Resource Type Icons** - 📄 Documents, 🔗 URLs, 📝 Forms, etc.
- **Status Indicators** - Visual cues for component completion status
- **Action Buttons** - Clear, consistent button styling

### 3. Responsive Design
- **Mobile Friendly** - Cards stack vertically on smaller screens
- **Touch Optimized** - Adequate touch targets for mobile use
- **Flexible Layout** - Adapts to different screen sizes

## Technical Implementation

### Component Structure
```
SimplifiedOfferingDesigner.vue
├── OfferingHeader.vue
├── OutcomeSection.vue
│   ├── ComponentCard.vue
│   │   ├── ComponentSummary.vue
│   │   └── AssociatedResourcesList.vue
│   └── AddComponentButton.vue
└── ComponentDesignerDrawer.vue (overlay)
```

### Data Model
```typescript
interface SimplifiedOffering {
  id: string
  name: string
  description: string
  category: string
  sharePointUrl: string
  associatedResources: ResourceSummary[]
  resourceCount: number
  outcomes: SimplifiedOutcome[]
}

interface SimplifiedOutcome {
  id: string
  title: string
  description?: string // Inline editable
  associatedResources: ResourceSummary[]
  resourceCount: number
  components: SimplifiedComponent[]
}

interface SimplifiedComponent {
  id: string
  name: string
  description: string
  units: number
  budget: number
  lawArea: string
  lawSubArea: string
  associatedResources: ResourceSummary[]
  resourceCount: number
}

interface ResourceSummary {
  id: string
  name: string
  type: 'document' | 'url' | 'form' | 'email' | 'video' | 'folder'
  icon: string
}

interface ResourceAssociationContext {
  entityType: 'offering' | 'outcome' | 'component'
  entityId: string
  entityName: string
}
```

### State Management
- **Read-Only State** - Main designer is primarily read-only
- **Drawer State** - Manage drawer open/close and selected component
- **Resource Updates** - Reflect resource changes from drawer back to main view
- **Optimistic Updates** - Update UI immediately, sync with backend

## Integration with Component Designer Drawer

### 1. Drawer Trigger
- **Edit Button** - Each component card has an "Edit" button
- **Context Passing** - Pass component data to drawer
- **State Management** - Track which component is being edited

### 2. Drawer Overlay Behavior
- **90% Screen Coverage** - Drawer covers 90% of screen
- **Context Preservation** - 10% of main designer remains visible
- **Modal Behavior** - Clicking outside drawer area closes it
- **Escape Key** - ESC key closes drawer

### 3. Data Synchronization
- **Save Changes** - Update main designer when drawer saves
- **Cancel Changes** - Revert to original state if cancelled
- **Real-time Updates** - Reflect resource associations immediately
- **Validation** - Ensure data consistency between views

## Mock Data Requirements

### Sample Offering Structure
```json
{
  "id": "offering-1",
  "name": "License your software (licensor)",
  "description": "Protect and exploit your intellectual property (IP)",
  "category": "Intellectual Property",
  "sharePointUrl": "https://sharepoint.example.com/licensing",
  "resourceCount": 1,
  "associatedResources": [
    {
      "id": "offering-resource-1",
      "name": "Offering Overview.docx",
      "type": "document",
      "icon": "📄"
    }
  ],
  "outcomes": [
    {
      "id": "outcome-1",
      "title": "You would like assistance settling on licensing business model",
      "description": "We will help you determine the best licensing approach for your software",
      "resourceCount": 1,
      "associatedResources": [
        {
          "id": "outcome-resource-1",
          "name": "Outcome Checklist.docx",
          "type": "document",
          "icon": "📄"
        }
      ],
      "components": [
        {
          "id": "component-1",
          "name": "Strategy Paper on Business Models",
          "description": "We will walk you through various alternative business models...",
          "units": 60,
          "budget": 4500,
          "lawArea": "Intellectual property law",
          "lawSubArea": "Copyright",
          "resourceCount": 3,
          "associatedResources": [
            {
              "id": "component-resource-1",
              "name": "Business Model Template.docx",
              "type": "document",
              "icon": "📄"
            },
            {
              "id": "component-resource-2",
              "name": "Licensing Agreement Template.pdf",
              "type": "document",
              "icon": "📄"
            },
            {
              "id": "component-resource-3",
              "name": "Market Analysis Guide.pdf",
              "type": "document",
              "icon": "📄"
            }
          ]
        }
      ]
    }
  ]
}
```

## Success Criteria

### Functional Requirements
- ✅ Clear offering → outcomes → components → resources hierarchy
- ✅ Read-only main interface with targeted editing
- ✅ Component Designer Drawer integration
- ✅ Resource visibility and management
- ✅ Responsive design across devices

### User Experience Requirements
- ✅ Simplified, scannable interface
- ✅ Quick component editing workflow
- ✅ Clear visual hierarchy and information architecture
- ✅ Consistent with existing ALP design patterns
- ✅ Fast loading and smooth interactions

### Technical Requirements
- ✅ Integration with existing ALP components
- ✅ Proper state management and data flow
- ✅ Performance with large offerings (100+ components)
- ✅ Accessibility compliance (WCAG 2.1 AA)
- ✅ Mobile-responsive design

## Future Enhancements

### Phase 2 Features
- **Bulk Component Operations** - Select multiple components for bulk actions
- **Component Templates** - Quick creation from predefined templates
- **Search and Filter** - Find components and resources quickly

### Phase 3 Features
- **Drag and Drop** - Reorder components and outcomes
- **Component Dependencies** - Show relationships between components
- **Progress Tracking** - Visual progress indicators for components
- **Collaborative Editing** - Multiple users editing simultaneously

---

**Next Steps:**
1. Create mock data structure for simplified offering
2. Implement SimplifiedOfferingDesigner.vue component
3. Build ComponentCard.vue with resource display
4. Integrate with ComponentDesignerDrawer.vue
5. Test complete workflow and refine UX
