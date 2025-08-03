# Existing System Analysis - ALP Integration

## Current ALP Architecture Overview

### Technology Stack
- **Frontend**: Vue 3 + TypeScript + Vite
- **UI Framework**: shadcn/ui (New York variant) + Tailwind CSS
- **State Management**: Pinia stores
- **Routing**: Vue Router
- **Component Architecture**: Composition API pattern

### Existing Matter Management System

#### Matter List View (`/matters`)
- **Location**: `ALP-reference/ALP/App/src/components/ui/matters/`
- **Key Components**: 
  - `InlineMatter.vue` - Matter card display
  - Matter filtering and search functionality
  - List/grid view toggles

#### Matter Detail View (`/matters/:id`)
- **Current Tabs**: Overview, Info, Outcomes, Time Entry, Trust, Disbursements, etc.
- **Tab Architecture**: Vue Router based navigation
- **Layout Pattern**: Consistent header + tabbed content area
- **URL Pattern**: `/matters/{matter-id}/{tab-name}`

### Component Patterns for Integration

#### Hierarchical Display Components
- **Offering Components**: `InlineOfferingComponent.vue`, `InlineOfferingOutcome.vue`
- **Pattern**: Card-based display with expandable sections
- **Data Structure**: Offering → Outcome → Component hierarchy
- **Interaction**: Modal dialogs for detailed views

#### Resource Management Components
- **Resource URLs**: `ResourceUrlSelector.vue`
- **Pattern**: Modal-based selection with categorization
- **Integration**: Form-based resource association
- **Data Handling**: Reactive forms with validation

#### Modal System
- **Pattern**: Overlay dialogs with backdrop
- **Components**: Standardized modal wrapper components
- **Interaction**: Click-outside-to-close, ESC key support
- **Accessibility**: Focus trapping, ARIA labels

### UI Patterns & Standards

#### Design System
- **ALP**: Match to design element choices adopted in ALP codebase in ALP-reference folder
- **Color Scheme**: See existing colour palette adopted in ALP codebase in ALP-reference folder
- **Typography**: System font stack, consistent sizing scale
- **Spacing**: Tailwind spacing utilities (4px grid)
- **Shadows**: Subtle drop shadows for depth
- **Borders**: Consistent border radius and colors

#### Component Structure
```vue
<template>
  <!-- Consistent component structure -->
</template>

<script setup lang=\"ts\">
// Composition API pattern
// TypeScript interfaces
// Reactive data management
</script>

<style scoped>
/* Minimal scoped styles */
/* Tailwind utilities preferred */
</style>
```

#### Responsive Design
- **Breakpoints**: Desktop-first responsive design
- **Grid System**: CSS Grid and Flexbox
- **Navigation**: Collapsible sidebar on mobile
- **Touch Targets**: Appropriate sizing for touch interfaces

### Integration Points for Portal Resources

#### 1. Matter Detail Navigation
- **Current Pattern**: Horizontal tab navigation
- **Integration**: Add \"Resources\" tab to existing structure
- **Router Integration**: `/matters/{id}/resources` route
- **State Management**: Share matter context across tabs

#### 2. Hierarchical Data Display
- **Existing Pattern**: Offering → Outcome → Component cards
- **Resource Extension**: Associate resources at each level
- **Data Structure**: Extend existing hierarchy with resource metadata
- **Visual Consistency**: Follow existing card design patterns

#### 3. Modal Interactions
- **Current System**: Standardized modal components
- **Resource Modals**: Resource detail views, selection dialogs
- **Interaction Patterns**: Consistent with existing resource selection
- **Data Flow**: Reactive updates to parent components

#### 4. External System Integration
- **SharePoint Links**: Direct navigation to external resources
- **URL Handling**: New tab/window opening patterns. Always open new window
- **Security**: CSP considerations for external links
- **Error Handling**: Network failure and permission error handling

### Technical Constraints & Opportunities

#### Constraints
1. **No Backend Changes**: Prototype must use static/mock data
2. **UI Consistency**: Must follow existing design patterns exactly
3. **Performance**: Large resource lists need efficient rendering
4. **Browser Support**: IE11 not required, modern browsers only

#### Opportunities
1. **Component Reuse**: Extensive existing component library
2. **Styling System**: Comprehensive Tailwind configuration
3. **Type Safety**: Strong TypeScript integration
4. **Development Tools**: Established build and dev environment

### Recommended Integration Approach

#### Phase 1: Tab Integration
1. Add Resources tab to Matter detail view
2. Implement basic resource list display
3. Follow existing tab routing patterns

#### Phase 2: Hierarchical Display
1. Extend existing Offering/Outcome component patterns
2. Add resource associations to hierarchy levels
3. Implement expandable resource sections

#### Phase 3: Modal Enhancement
1. Create resource-specific modal components
2. Implement resource type handling (Forms, Documents, URLs, Templates)
3. Add resource management actions

#### Phase 4: External Integration
1. Implement SharePoint link handling
2. Add VD Offering Folder integration
3. Handle external system error states

### Development Environment Setup

- **Primary Development**: `/alp-workspace/src/components/business/resources/`
- **Reference Components**: `/ALP-reference/ALP/App/src/components/ui/`
- **Test Data**: JSON files in `/alp-workspace/src/alp-data/`
- **Database Schema**: Reference `/alp-documentation/alp_database_structure.sql`
- **Styling**: Extend existing Tailwind configuration
- **TypeScript**: Follow existing interface patterns

### Test Data Strategy

#### Example Offering Structure
**Offering**: "Make a claim for unfair dismissal"

**Outcome 1**: "Understanding your rights and deciding the best claim to make"
- Component 1: "Understanding your position and providing high-level guidance"
- Component 2: "Providing you with our written advice"

**Outcome 2**: "Bringing a formal complaint against your employer"  
- Component 1: "Preparing and lodging your claim"
- Component 2: "Negotiating with your employer"
- Component 3: "Entering a Settlement Deed"

#### Data Sources
- **ALP Database Schema**: Use existing structure from alp-documentation
- **Resource Types**: Forms, Documents, URLs, Templates
- **SharePoint URLs**: Mock static URLs for VD Offering Folders
- **Resource Metadata**: Based on existing ALP data patterns