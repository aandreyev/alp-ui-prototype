# ALP Workspace Setup Guide

This guide explains how to set up and use the ALP-specific workspace for component development.

## Prerequisites

Before starting, ensure you have:
- Access to ALP documentation and codebase
- Understanding of ALP's current technology stack
- Sample data from ALP's database
- ALP's CSS framework and component library

## Initial Setup Steps

### 1. Documentation Analysis
```bash
# Place ALP documentation in the documentation folder
alp-workspace/documentation/
├── ALP_Component_Guide.md
├── ALP_Database_Schema.sql
├── ALP_CSS_Framework.md
└── ALP_API_Documentation.md
```

### 2. Extract ALP Styles
```bash
# Copy ALP's actual CSS files
alp-workspace/src/alp-styles/
├── alp-base.css          # From ALP's main CSS
├── alp-components.css    # Component-specific styles
└── alp-variables.css     # CSS custom properties
```

### 3. Create ALP Data Models
```bash
# Export sample data from ALP database
alp-workspace/src/alp-data/
├── matter-samples.json   # Real matter records
├── client-samples.json   # Real client records
└── schema/
    ├── matter-schema.sql
    └── client-schema.sql
```

## Development Process

### Phase 1: Analysis
1. **Load ALP Documentation**
   - Import all relevant ALP docs into `/documentation/`
   - Analyze existing component patterns
   - Document current CSS classes and conventions

2. **Extract Data Structures**
   - Export sample data from ALP database
   - Create TypeScript interfaces matching ALP models
   - Document field names, types, and relationships

3. **Identify Integration Points**
   - Map ALP's current component architecture
   - Identify where new components will integrate
   - Document required APIs and data flows

### Phase 2: Setup
1. **Create ALP Types**
   ```typescript
   // alp-workspace/src/alp-types/matter.types.ts
   export interface ALPMatter {
     matter_id: number;           // ALP's actual field names
     matter_name: string;
     matter_number: string;
     client_id: number;
     matter_status: 'open' | 'closed' | 'pending' | 'on_hold' | 'cancelled';
     matter_type: string;
     priority_level: 'low' | 'medium' | 'high' | 'urgent';
     assigned_solicitor_id: number;
     created_date: string;
     due_date: string | null;
     estimated_budget: number | null;
     actual_costs: number;
     billable_hours: number;
     is_deleted: boolean;         // ALP's soft delete pattern
     // ... other ALP-specific fields
   }
   ```

2. **Create .NET Core Models**
   ```csharp
   // alp-workspace/src/alp-components/models/Matter.cs
   public class Matter
   {
       public int MatterId { get; set; }
       public string MatterName { get; set; }
       public string MatterNumber { get; set; }
       public int ClientId { get; set; }
       public MatterStatus MatterStatus { get; set; }
       public string MatterType { get; set; }
       public PriorityLevel PriorityLevel { get; set; }
       public int AssignedSolicitorId { get; set; }
       public DateTime CreatedDate { get; set; }
       public DateTime? DueDate { get; set; }
       public decimal? EstimatedBudget { get; set; }
       public decimal ActualCosts { get; set; }
       public decimal BillableHours { get; set; }
       public bool IsDeleted { get; set; }
       
       // Navigation Properties
       public virtual Client Client { get; set; }
       public virtual Solicitor AssignedSolicitor { get; set; }
   }
   ```

3. **Import ALP Styles**
   ```css
   /* alp-workspace/src/alp-styles/alp-base.css */
   /* Import ALP's actual CSS classes */
   .alp-card { /* ALP's card styling */ }
   .alp-button { /* ALP's button styling */ }
   .alp-form-field { /* ALP's form styling */ }
   ```

3. **Create Sample Data**
   ```json
   // alp-workspace/src/alp-data/matter-samples.json
   [
     {
       "matter_id": 1,
       "matter_name": "Smith Property Purchase",
       "client_id": 101,
       "matter_status": "open"
       // ... using ALP's actual field structure
     }
   ]
   ```

### Phase 3: Component Development
1. **Build ALP-Compatible Components**
   ```html
   <!-- Use ALP's actual CSS classes -->
   <div class="alp-card alp-matter-card">
     <div class="alp-card-header">
       <!-- Follow ALP's HTML structure -->
     </div>
   </div>
   ```

2. **Follow ALP Patterns**
   - Use ALP's naming conventions
   - Follow ALP's component structure
   - Implement ALP's business logic
   - Use ALP's validation rules

3. **Test Integration**
   - Test with ALP's actual data formats
   - Validate against ALP's business rules
   - Ensure compatibility with ALP's existing systems

## File Organization

### Component Structure
```
alp-workspace/src/alp-components/
├── matter/
│   ├── MatterCard.php           # PHP component (if ALP uses PHP)
│   ├── MatterCard.vue           # Vue component (if ALP uses Vue)
│   ├── matter-card.css          # Component-specific styles
│   └── matter-card.test.js      # Component tests
├── client/
│   ├── ClientForm.php
│   ├── ClientForm.vue
│   └── client-form.css
└── shared/
    ├── ALPButton.php
    ├── ALPModal.php
    └── shared-components.css
```

### Data Structure
```
alp-workspace/src/alp-data/
├── matter-samples.json          # Real ALP matter data
├── client-samples.json          # Real ALP client data
├── invoice-samples.json         # Real ALP invoice data
└── schema/
    ├── database-schema.sql      # ALP's actual schema
    ├── api-responses.json       # Sample API responses
    └── validation-rules.json    # ALP's validation rules
```

## Integration Checklist

Before integrating components into ALP:

- [ ] Component uses ALP's actual CSS classes
- [ ] Data structure matches ALP's database schema
- [ ] Field names match ALP's conventions
- [ ] Business logic follows ALP's rules
- [ ] Validation matches ALP's requirements
- [ ] Component integrates with ALP's existing systems
- [ ] Testing completed with real ALP data
- [ ] Documentation updated for ALP team

## Common Patterns

### ALP Data Formatting
```javascript
// Use ALP's actual field names and formats
const formatALPMatter = (matter) => ({
  matter_id: matter.matter_id,
  matter_name: matter.matter_name,
  client_name: matter.client?.client_name,
  matter_status: matter.matter_status,
  created_date: formatALPDate(matter.created_date)
});
```

### ALP CSS Classes
```css
/* Follow ALP's existing CSS patterns */
.alp-matter-card {
  /* ALP's card styling */
}

.alp-status-open {
  /* ALP's status styling */
}

.alp-priority-urgent {
  /* ALP's priority styling */
}
```

This setup ensures components built in this workspace will integrate seamlessly with ALP's existing codebase.
