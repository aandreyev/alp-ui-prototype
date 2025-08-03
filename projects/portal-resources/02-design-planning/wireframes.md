# UI Wireframes & Interaction Designs - Portal Resources

## Design System Reference

**Base Design**: Follow existing ALP UI patterns using shadcn/ui (New York variant) + Tailwind CSS  
**Icons**: Lucide icons consistent with existing ALP usage  
**Typography**: System font stack with consistent sizing scale  
**Colors**: Existing ALP color palette and variables  

---

## Wireframe 1: Resources Tab - Main View

### Layout Structure
```
┌─────────────────────────────────────────────────────────────────────┐
│ MATTER DETAIL HEADER                                                 │
│ Matter Name | Matter ID | Status                                     │
└─────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────┐
│ TAB NAVIGATION                                                       │
│ [Overview] [Info] [Outcomes] [Resources] [Time Entry] [Trust] [...]  │
└─────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────┐
│ RESOURCES TAB CONTENT                                                │
│                                                                     │
│ ┌─ Resources Header ──────────────────────────────────────────────┐ │
│ │ 📁 Matter Resources                           [+ Add] [🔄 Refresh] │ │
│ │ Access all resources for this matter at point of need           │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ┌─ VD Offering Folders ──────────────────────────────────────────┐ │
│ │ 🔗 VD Offering Folders for this matter                         │ │
│ │                                                                │ │
│ │ ┌─ Unfair Dismissal - VD Folder ────────────────────────────┐  │ │
│ │ │ 📂 Unfair Dismissal Resources           [Open Folder] 🔗  │  │ │
│ │ │ SharePoint folder with precedents and resources           │  │ │
│ │ └───────────────────────────────────────────────────────────┘  │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ┌─ Resource Filters ─────────────────────────────────────────────┐ │
│ │ [All Resources ▼] [All Types ▼] [🔍 Search resources...]      │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ┌─ Resource Hierarchy ───────────────────────────────────────────┐ │
│ │                                                                │ │
│ │ ▼ 📋 Make a claim for unfair dismissal              [🔗 VD Folder] │ │
│ │   ├─ 📄 Offering Overview Document                     [View]   │ │
│ │   ├─ 🔗 General Unfair Dismissal Resources            [Open]   │ │
│ │   │                                                            │ │
│ │   ▼ 🎯 Understanding your rights and deciding best claim       │ │
│ │     ├─ 📝 Initial Assessment Form                     [Open]   │ │
│ │     ├─ 📄 Rights Summary Template                     [View]   │ │
│ │     │                                                          │ │
│ │     ▼ 📋 Understanding your position (Component)               │ │
│ │       ├─ 📝 Position Analysis Form                   [Open]   │ │
│ │       ├─ 📄 Case Law Research Template               [View]   │ │
│ │       ├─ 🔗 Employment Law Database                  [Open]   │ │
│ │       └─ ⚠️ Resources updated in offering (if applicable)      │ │
│ │                                                                │ │
│ │     ▼ 📋 Providing written advice (Component)                 │ │
│ │       ├─ 📄 Advice Letter Template                   [View]   │ │
│ │       └─ 📄 Client Communication Template            [View]   │ │
│ │                                                                │ │
│ │   ▼ 🎯 Bringing a formal complaint                             │ │
│ │     ├─ 📄 Complaint Process Guide                     [View]   │ │
│ │     │                                                          │ │
│ │     ▼ 📋 Preparing and lodging claim (Component)              │ │
│ │       ├─ 📝 FWC Application Form                     [Open]   │ │
│ │       └─ 📄 Evidence Checklist                       [View]   │ │
│ │                                                                │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Visual Design Notes
- **Headers**: H2 for main sections, H3 for subsections
- **Cards**: White background, subtle border, hover shadow
- **Icons**: 16px Lucide icons with muted foreground color
- **Hierarchy**: Indentation using padding-left, connecting lines optional. Do not use excessive indentation. Use light connecting lines to show nested structure
- **Actions**: Small outline buttons, primary for main actions
- **External Links**: Blue text with external link icon

---

## Wireframe 2: Resource Modal - Detail View

### Modal Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│                            MODAL BACKDROP                            │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ RESOURCE MODAL                                           [✕]  │  │
│  │                                                               │  │
│  │ ┌─ Modal Header ──────────────────────────────────────────┐   │  │
│  │ │ 📝 Initial Assessment Form                              │   │  │
│  │ │ Component: Understanding your position                   │   │  │
│  │ └─────────────────────────────────────────────────────────┘   │  │
│  │                                                               │  │
│  │ ┌─ Resource Details ──────────────────────────────────────┐   │  │
│  │ │ Type: Syntaq Form                                       │   │  │
│  │ │ Description: Client intake form for initial assessment  │   │  │
│  │ │ of unfair dismissal claims                              │   │  │
│  │ │                                                         │   │  │
│  │ │ Hierarchy Path:                                         │   │  │
│  │ │ Unfair Dismissal > Understanding rights > Position     │   │  │
│  │ │                                                         │   │  │
│  │ │ Metadata:                                               │   │  │
│  │ │ • Author: Legal Team                                    │   │  │
│  │ │ • Version: 2.1                                          │   │  │
│  │ │ • Last Updated: 15 Jan 2024                             │   │  │
│  │ │ • Tags: intake, assessment, unfair-dismissal            │   │  │
│  │ └─────────────────────────────────────────────────────────┘   │  │
│  │                                                               │  │
│  │ ┌─ Quick Actions ─────────────────────────────────────────┐   │  │
│  │ │ [👁️ Preview] [📱 Open] [🔗 Copy Link] [⬇️ Download]      │   │  │
│  │ └─────────────────────────────────────────────────────────┘   │  │
│  │                                                               │  │
│  │ ┌─ Related Resources ─────────────────────────────────────┐   │  │
│  │ │ Other resources for this component:                     │   │  │
│  │ │                                                         │   │  │
│  │ │ 📄 Position Analysis Guidelines            [View]       │   │  │
│  │ │ 🔗 Employment Law Database                 [Open]       │   │  │
│  │ │ 📄 Case Law Research Template              [View]       │   │  │
│  │ └─────────────────────────────────────────────────────────┘   │  │
│  │                                                               │  │
│  │ ┌─ Modal Footer ──────────────────────────────────────────┐   │  │
│  │ │                           [Cancel] [Open Resource]      │   │  │
│  │ └─────────────────────────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Modal Behavior
- **Trigger**: Click on any resource card
- **Size**: Medium (max-width: 2xl)
- **Close**: ESC key, click backdrop, or X button
- **Actions**: Primary button opens resource, secondary actions available
- **Focus**: Trap focus within modal, return to trigger element on close

---

## Wireframe 3: Mobile Responsive Layout

### Mobile View (< 768px)
```
┌─────────────────────────┐
│ MATTER HEADER           │
│ Matter Name             │
│ [≡] Navigation          │
└─────────────────────────┘
┌─────────────────────────┐
│ TAB NAVIGATION          │
│ ← → [Resources]         │
└─────────────────────────┘
┌─────────────────────────┐
│ 📁 Matter Resources     │
│ Point-of-need access    │
│                         │
│ [+ Add] [🔄 Refresh]    │
└─────────────────────────┘
┌─────────────────────────┐
│ 🔗 VD Folders           │
│                         │
│ ┌─ Unfair Dismissal ─┐ │
│ │ 📂 VD Folder   [>] │ │
│ │ SharePoint folder  │ │
│ └───────────────────┘ │
└─────────────────────────┘
┌─────────────────────────┐
│ [Filter ▼] [🔍 Search]  │
└─────────────────────────┘
┌─────────────────────────┐
│ ACCORDION HIERARCHY     │
│                         │
│ ▼ 📋 Unfair Dismissal   │
│   ├─ 📄 Overview   [>] │
│   │                    │
│   ▼ 🎯 Understanding   │
│     ├─ 📝 Form     [>] │
│     ├─ 📄 Template [>] │
│     │                  │
│     ▼ 📋 Position      │
│       ├─ 📝 Form   [>] │
│       └─ 📄 Guide  [>] │
└─────────────────────────┘
```

### Mobile Interactions
- **Accordion**: Collapsible hierarchy sections
- **Horizontal Scroll**: Tab navigation if needed
- **Touch Targets**: Minimum 44px tap targets
- **Bottom Sheet**: Modal alternative for mobile

---

## Wireframe 4: Filter & Search States

### Filter Dropdown Active
```
┌─────────────────────────────────────────────────────────────────────┐
│ ┌─ Resource Filters ─────────────────────────────────────────────┐ │
│ │ [All Resources ▼] [All Types ▼] [🔍 Search resources...]      │ │
│ │                   ┌─ Type Filter ────────────────────────────┐ │ │
│ │                   │ ✓ All Types                             │ │ │
│ │                   │ ○ Forms                                 │ │ │
│ │                   │ ○ Documents                             │ │ │
│ │                   │ ○ URLs                                  │ │ │
│ │                   │ ○ Templates                             │ │ │
│ │                   └─────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ┌─ Filtered Results ─────────────────────────────────────────────┐ │
│ │ Showing 12 of 45 resources                                     │ │
│ │ [Clear Filters]                                                │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Search Active State
```
┌─────────────────────────────────────────────────────────────────────┐
│ ┌─ Resource Filters ─────────────────────────────────────────────┐ │
│ │ [All Resources ▼] [All Types ▼] [🔍 "assessment form"...]     │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ┌─ Search Results ───────────────────────────────────────────────┐ │
│ │ 3 resources found for "assessment form"                        │ │
│ │                                                                │ │
│ │ 📝 Initial Assessment Form                              [View] │ │
│ │ 📝 Position Analysis Form                               [View] │ │
│ │ 📄 Assessment Guidelines Template                       [View] │ │
│ │                                                                │ │
│ │ [Clear Search]                                                 │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Wireframe 5: Loading & Error States

### Loading State
```
┌─────────────────────────────────────────────────────────────────────┐
│ ┌─ Resources Loading ────────────────────────────────────────────┐ │
│ │ 📁 Matter Resources                                            │ │
│ │ Loading resources...                                           │ │
│ │                                                                │ │
│ │ ┌─ Skeleton Card ─────────────────────────────────────────┐   │ │
│ │ │ ████████████████████                              │   │ │
│ │ │ ████████████████████████████████                  │   │ │
│ │ │ ████████████████                                  │   │ │
│ │ └───────────────────────────────────────────────────────┘   │ │
│ │                                                                │ │
│ │ ┌─ Skeleton Card ─────────────────────────────────────────┐   │ │
│ │ │ ████████████████████                              │   │ │
│ │ │ ████████████████████████████████                  │   │ │
│ │ │ ████████████████                                  │   │ │
│ │ └───────────────────────────────────────────────────────┘   │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Error State
```
┌─────────────────────────────────────────────────────────────────────┐
│ ┌─ Error Loading Resources ──────────────────────────────────────┐ │
│ │ ⚠️ Unable to load resources                                    │ │
│ │                                                                │ │
│ │ There was a problem loading resources for this matter.         │ │
│ │ Please check your connection and try again.                    │ │
│ │                                                                │ │
│ │ [Try Again] [Report Issue]                                     │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### External Link Error
```
┌─────────────────────────────────────────────────────────────────────┐
│                         ERROR MODAL                                  │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ ⚠️ External Link Failed                                   [✕] │  │
│  │                                                               │  │
│  │ The external link could not be opened. This may be due to:   │  │
│  │ • Pop-up blocker settings                                    │  │
│  │ • Network connectivity issues                                │  │
│  │ • Resource permissions                                       │  │
│  │                                                               │  │
│  │ The link has been copied to your clipboard.                  │  │
│  │                                                               │  │
│  │ Link: https://syntaq.example.com/forms/assessment             │  │
│  │                                                               │  │
│  │                                    [Copy Link] [Try Again]   │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Interaction Flows

### Flow 1: Basic Resource Access
1. **User arrives at Matter detail** → Sees Resources tab with badge count
2. **Clicks Resources tab** → Loads hierarchical resource view
3. **Scans resource hierarchy** → Identifies relevant section/resource
4. **Clicks resource card** → Opens resource modal with details
5. **Reviews resource information** → Confirms it's the right resource
6. **Clicks "Open Resource"** → External resource opens in new tab
7. **Returns to ALP** → Continues matter work with resource available

### Flow 2: VD Folder Exploration
1. **Accesses Resources tab** → Sees VD Offering Folders section
2. **Clicks VD Folder link** → SharePoint folder opens in new tab
3. **Browses precedent resources** → Finds additional relevant materials
4. **Returns to ALP tab** → Continues with matter-specific resources

### Flow 3: Filtered Resource Discovery
1. **Opens Resources tab** → Sees all resources displayed
2. **Clicks filter dropdown** → Selects "Forms" to narrow focus
3. **Reviews filtered results** → Sees only form-type resources
4. **Uses search within forms** → Types "assessment" to find specific form
5. **Clicks target resource** → Opens modal and accesses form

### Flow 4: Error Recovery
1. **Clicks resource link** → External system unavailable/error
2. **Sees error modal** → Clear explanation of issue and options
3. **Copies link to clipboard** → Can paste in browser or save for later
4. **Tries VD folder alternative** → Accesses backup resource location

---

## Accessibility Considerations

### Keyboard Navigation
- **Tab Order**: Logical progression through interface elements
- **Focus Indicators**: Clear visual focus states for all interactive elements
- **Keyboard Shortcuts**: Space/Enter to activate, ESC to close modals
- **Screen Reader**: Proper ARIA labels and descriptions

### Visual Design
- **Color Contrast**: WCAG AA compliant contrast ratios
- **Focus States**: High contrast focus indicators
- **Text Size**: Scalable typography, readable at 200% zoom
- **Icon Labels**: Text alternatives for all icons

### Motor Accessibility
- **Click Targets**: Minimum 44px touch targets
- **Hover States**: Not required for functionality
- **Timing**: No auto-disappearing content
- **Motion**: Reduced motion preferences respected

---

This wireframe specification provides a complete visual foundation for Phase 3 implementation while ensuring consistency with ALP design patterns and optimal user experience across devices.