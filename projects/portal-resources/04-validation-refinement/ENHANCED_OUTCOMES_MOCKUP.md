# Enhanced Outcomes Tab Mockup - Resource Integration

## 🎯 Overview

This mockup shows the enhanced Outcomes tab with integrated resource links, providing additional point-of-access to resources directly within the outcome workflow.

## 📋 Enhanced Structure

### **Visual Hierarchy**
```
Offering (Bordered Container - Clickable to SharePoint)
├── Outcome 1 (Bordered Container)
│   ├── Outcome Resources (Nested, Indented)
│   │   ├── 📄 Resource Name [Detail] [Open]
│   │   └── 🔗 Resource Name [Detail] [Open]
│   ├── Component 1.1 (Checkbox + Play Button)
│   │   └── Component Resources (Nested, Indented)
│   │       ├── 📝 Resource Name [Detail] [Open]
│   │       └── 📄 Resource Name [Detail] [Open]
│   └── Component 1.2 (Checkbox + Play Button)
│       └── Component Resources (Nested, Indented)
│           └── 🔗 Resource Name [Detail] [Open]
└── Outcome 2 (Bordered Container)
    ├── Outcome Resources (Nested, Indented)
    └── Component 2.1 (Checkbox + Play Button)
        └── Component Resources (Nested, Indented)
```

## 🎨 Detailed Mockup

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ Search ...                                                           [+ Add Outcome]    │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ 📁 Make a claim for unfair dismissal                    [📁 Open SharePoint Folder]     │
│                                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ You would like us to act as your executor and/or trustee.                          │ │
│ │                                                                                     │ │
│ │   📄 Executor Appointment Guide                        [Detail] [Open]             │ │
│ │   📝 Trustee Responsibilities Checklist               [Detail] [Open]             │ │
│ │                                                                                     │ │
│ │   ☐ 'Charging Letter' for executor role               ▶️  - / 0 units  Due Date  🗑️ │ │
│ │       📝 Executor Charging Letter Template            [Detail] [Open]             │ │
│ │       📄 Fee Structure Guidelines                     [Detail] [Open]             │ │
│ │                                                                                     │ │
│ └─────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ You would like to update your estate planning documents to pass on your wealth     │ │
│ │ when you die, including an update to your Will and associated documents.           │ │
│ │                                                                                     │ │
│ │   📄 Estate Planning Overview                          [Detail] [Open]             │ │
│ │   🔗 Estate Planning Resources Database                [Detail] [Open]             │ │
│ │                                                                                     │ │
│ │   ☐ Prepare an update to existing Wills               ▶️  - / 22 units Due Date  🗑️ │ │
│ │       📝 Will Amendment Template                       [Detail] [Open]             │ │
│ │       📄 Will Review Checklist                        [Detail] [Open]             │ │
│ │       🔗 Legal Precedents Database                    [Detail] [Open]             │ │
│ │                                                                                     │ │
│ │   ☐ Prepare a Codicil                                 ▶️  - / 22 units Due Date  🗑️ │ │
│ │       📝 Codicil Template                             [Detail] [Open]             │ │
│ │       📄 Codicil Drafting Guidelines                  [Detail] [Open]             │ │
│ │                                                                                     │ │
│ └─────────────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ 📁 TEST Offering                                       [📁 Open SharePoint Folder]     │
│                                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ TEST Offering Outcome                                                               │ │
│ │                                                                                     │ │
│ │   📄 Test Resource Document                           [Detail] [Open]             │ │
│ │                                                                                     │ │
│ │   ☐ TEST DELETE ME                                    ▶️  - / 10 units Due Date  🗑️ │ │
│ │       📝 Test Component Template                      [Detail] [Open]             │ │
│ │       🔗 Test External Link                          [Detail] [Open]             │ │
│ │                                                                                     │ │
│ └─────────────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

## 🔍 Key Design Elements

### **Offering Container**
- **Larger border** around entire offering section
- **Slightly larger text** for offering name
- **SharePoint folder icon and button** for direct access
- **Clickable offering name** that also opens SharePoint folder

### **Outcome Containers**
- **Medium border** around each outcome section
- **Standard text size** for outcome descriptions
- **Nested resource section** immediately under outcome title

### **Component Items**
- **Existing checkbox and play button** maintained
- **Nested resource section** under each component
- **Consistent styling** with current ALP patterns

### **Resource Items**
- **Icon-based type identification**:
  - 📝 Forms/Templates
  - 📄 Documents
  - 🔗 URLs/Links
- **Resource name** with consistent text size
- **Two action buttons**: [Detail] [Open]
- **Indented/nested** under parent outcome or component
- **Subtle background** or border to distinguish from parent items

## 🎨 Styling Specifications

### **Visual Hierarchy**
1. **Offering Level**: Largest border, slightly larger text, prominent SharePoint integration
2. **Outcome Level**: Medium border, standard text, resource grouping
3. **Component Level**: Existing styling maintained, nested resources
4. **Resource Level**: Smallest visual weight, clearly subordinate, action-focused

### **Resource Item Styling**
```css
.resource-item {
  padding: 8px 16px;
  margin: 4px 0;
  background: rgba(0,0,0,0.02);
  border-left: 3px solid #e5e7eb;
  margin-left: 20px; /* Indentation */
}

.resource-icon {
  width: 16px;
  height: 16px;
  margin-right: 8px;
}

.resource-actions {
  margin-left: auto;
  gap: 8px;
}
```

### **Container Styling**
```css
.offering-container {
  border: 2px solid #d1d5db;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
}

.outcome-container {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 12px;
  margin: 8px 0;
}
```

## 🔄 Interaction Patterns

### **Resource Actions**
- **Detail Button**: Opens existing ResourceModal component
- **Open Button**: Direct resource access (varies by type):
  - Forms: Open in new tab/window
  - Documents: Download or open in viewer
  - URLs: Navigate to external link
  - Templates: Download or open in editor

### **Offering Actions**
- **Offering Name Click**: Opens SharePoint folder
- **SharePoint Button**: Opens SharePoint folder
- **Consistent behavior** with existing ALP patterns

### **Existing Functionality**
- **All current interactions maintained**:
  - Checkboxes for completion tracking
  - Play buttons for workflow actions
  - Unit tracking and due dates
  - Delete functionality

## 📋 Implementation Considerations

### **Data Structure**
```typescript
interface EnhancedOutcome {
  id: string
  title: string
  offeringId: string
  offeringName: string
  offeringSharePointUrl: string
  outcomeResources: Resource[]
  components: EnhancedComponent[]
}

interface EnhancedComponent {
  id: string
  title: string
  status: 'pending' | 'in-progress' | 'completed'
  units: { completed: number, total: number }
  dueDate?: Date
  componentResources: Resource[]
}

interface Resource {
  id: string
  name: string
  type: 'form' | 'document' | 'url' | 'template'
  icon: string
  url: string
  metadata: ResourceMetadata
}
```

### **Component Integration**
- **Leverage existing ResourceModal** for Detail actions
- **Use existing resource action patterns** for Open actions
- **Maintain ALP styling consistency** throughout
- **Responsive design** following current ALP patterns

## 🎯 Benefits

### **Enhanced User Experience**
- **Point-of-need access** to resources within workflow context
- **Multiple access paths** to same resources (Outcomes tab + Resources tab)
- **Contextual resource discovery** based on current task
- **Familiar interaction patterns** consistent with ALP

### **Business Value**
- **Improved efficiency** through contextual resource access
- **Better resource utilization** through increased visibility
- **Enhanced workflow integration** without disrupting existing patterns
- **Scalable pattern** for future resource integration

---

**Mockup Date**: January 2025  
**Based on**: Enhanced Outcomes tab requirements  
**Integration**: Existing ALP Outcomes tab + Portal Resources components  
**Status**: Ready for implementation planning
