# ALP UI Component Library Structure

## 📁 Component Organization

### **Core Business Components** (`/business/`)
- `MatterCard.vue` - Matter display and management
- `ClientCard.vue` - Client information display
- `InvoiceCard.vue` - Invoice and billing components
- `TimeEntryCard.vue` - Time tracking components
- `TrustAccountCard.vue` - Trust accounting components
- `ProjectCard.vue` - Project management components

### **Form Components** (`/forms/`)
- `MatterForm.vue` - Matter creation/editing
- `ClientForm.vue` - Client management forms
- `TimeEntryForm.vue` - Time entry forms
- `InvoiceForm.vue` - Invoice generation forms

### **Layout Components** (`/layout/`)
- `Sidebar.vue` - Navigation sidebar
- `Header.vue` - Application header
- `Dashboard.vue` - Dashboard layouts
- `PageLayout.vue` - Standard page layouts

### **Data Display** (`/data/`)
- `DataTable.vue` - Enhanced data tables
- `MetricsCard.vue` - KPI and metrics display
- `ChartCard.vue` - Data visualization
- `StatusIndicator.vue` - Status and progress indicators

### **Workflow Components** (`/workflow/`)
- `WorkflowStep.vue` - Process step indicators
- `ApprovalFlow.vue` - Approval workflow components
- `StatusTimeline.vue` - Matter/project timelines

## 🏷️ **Component Naming Convention**

- **Business entities**: `[Entity]Card.vue`, `[Entity]Form.vue`, `[Entity]List.vue`
- **UI patterns**: `[Pattern]Component.vue` (e.g., `SearchableSelect.vue`)
- **Layout**: `[Area]Layout.vue` (e.g., `DashboardLayout.vue`)
- **Variants**: Use props for variants, not separate files

## 🎨 **Component Variants**

Each component should support variants via props:
```typescript
interface ComponentProps {
  variant?: 'default' | 'compact' | 'detailed' | 'minimal'
  size?: 'sm' | 'md' | 'lg'
  state?: 'loading' | 'error' | 'empty' | 'success'
}
```

## 📋 **Development Status Tracking**

Use component status indicators:
- 🚧 **Draft** - Initial concept, needs refinement
- 🔄 **Review** - Ready for feedback and iteration
- ✅ **Approved** - Ready for production integration
- 🎯 **Production** - Integrated into main ALP application

## 🧪 **Testing Strategy**

Each component should be tested in `App.vue` with:
- Multiple data states (empty, loading, error, success)
- Different variants and sizes
- Responsive behavior
- Accessibility features
- Interactive states (hover, focus, active)
