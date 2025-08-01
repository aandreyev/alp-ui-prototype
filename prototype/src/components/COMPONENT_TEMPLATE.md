# Component Development Template

## 🎯 **Component Specification Template**

Use this template when creating new ALP UI components:

### **Component Name**: `[ComponentName].vue`
**Category**: `business` | `forms` | `layout` | `data` | `workflow`
**Status**: 🚧 Draft | 🔄 Review | ✅ Approved | 🎯 Production

### **Business Context**
- **ALP Module**: Matter Management | Invoicing | Time Tracking | Trust Accounting | etc.
- **User Story**: As a [user type], I want to [action] so that [benefit]
- **Business Rules**: Key business logic and constraints

### **Component Requirements**
- **Primary Purpose**: What this component does
- **Key Features**: List of main features
- **Data Requirements**: What data the component needs
- **User Interactions**: How users interact with it

### **Technical Specification**

#### **Props Interface**
```typescript
interface ComponentProps {
  // Required props
  data: DataType
  
  // Optional props with defaults
  variant?: 'default' | 'compact' | 'detailed'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  
  // Event handlers
  onAction?: (data: DataType) => void
  onError?: (error: Error) => void
}
```

#### **Events**
```typescript
// Events emitted by component
interface ComponentEvents {
  'update:data': [data: DataType]
  'action': [action: string, payload: any]
  'error': [error: Error]
}
```

#### **Slots**
```vue
<!-- Available slots -->
<slot name="header" />
<slot name="content" />
<slot name="actions" />
<slot name="footer" />
```

### **Design Requirements**
- **Visual Style**: Matches ALP design system
- **Responsive**: Mobile-first approach
- **Accessibility**: WCAG 2.1 AA compliance
- **States**: Loading, error, empty, success states

### **Test Cases**
- [ ] **Happy Path**: Normal usage with valid data
- [ ] **Edge Cases**: Empty data, large datasets, edge values
- [ ] **Error States**: Invalid data, network errors, validation errors
- [ ] **Loading States**: Async operations and loading indicators
- [ ] **Responsive**: All screen sizes and orientations
- [ ] **Accessibility**: Keyboard navigation and screen readers

### **Integration Notes**
- **Dependencies**: Required external libraries or components
- **API Integration**: Backend endpoints or data sources
- **State Management**: Pinia store integration if needed
- **Routing**: Vue Router integration if needed

---

## 🚀 **Quick Development Workflow**

### **Step 1: Specification**
```markdown
1. Copy this template
2. Fill in component requirements
3. Define props and events interface
4. Identify test cases
```

### **Step 2: Implementation**
```vue
<!-- Create component file -->
<template>
  <!-- Component template -->
</template>

<script setup lang="ts">
// Component logic
</script>
```

### **Step 3: Testing**
```vue
<!-- Add to App.vue playground -->
<NewComponent :data="testData" />
<NewComponent :data="testData" variant="compact" />
<NewComponent :data="testData" :loading="true" />
```

### **Step 4: Documentation**
```markdown
1. Document usage examples
2. Add prop descriptions
3. Document integration steps
4. Update component status
```

---

## 📋 **Example: InvoiceCard Component**

### **Component Name**: `InvoiceCard.vue`
**Category**: `business`
**Status**: 🚧 Draft

### **Business Context**
- **ALP Module**: Invoicing & Billing System
- **User Story**: As a legal professional, I want to view invoice summaries so that I can quickly assess billing status and amounts
- **Business Rules**: 
  - Calculate amounts from line items (never use stored totals)
  - Handle both fixed-price and time-based invoices
  - Show GST calculations and compliance status

### **Component Requirements**
- **Primary Purpose**: Display invoice summary with key financial and status information
- **Key Features**: 
  - Invoice amount calculation
  - Payment status tracking
  - Client information display
  - Due date warnings
  - Action buttons for common tasks
- **Data Requirements**: Invoice data with line items, client info, payment status
- **User Interactions**: View details, send invoice, record payment, download PDF

### **Technical Specification**

#### **Props Interface**
```typescript
interface InvoiceCardProps {
  invoice: Invoice
  variant?: 'default' | 'compact' | 'detailed'
  showActions?: boolean
  readonly?: boolean
}

interface Invoice {
  id: number
  invoiceNumber: string
  client: ClientInfo
  status: InvoiceStatus
  type: 'FixedPrice' | 'TimeEntry'
  lineItems: InvoiceLineItem[]
  issueDate: string
  dueDate: string
  paidDate?: string
  gstAmount: number
  totalAmount: number
}
```

This template provides a structured approach for AI-driven component development with clear requirements and testing criteria.
