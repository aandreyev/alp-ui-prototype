# Merge, Move, and Delete Buttons Implementation

## Overview
Successfully implemented merge, move, and delete functionality buttons for both outcomes and components in the Simplified Offering Designer, matching the design shown in the "Offering designer main page.png" reference image.

## Implementation Details

### 1. Outcome-Level Actions

#### Button Placement
- **Location**: Right side of outcome header
- **Buttons Added**:
  - **Move** (ArrowRight icon) - Move outcome to another offering
  - **Merge** (Merge icon) - Merge outcome with another outcome
  - **Up/Down arrows** (ChevronUp/ChevronDown) - Reorder outcomes within offering

#### Visual Design
- Consistent button styling with existing design system
- Proper spacing and alignment
- Disabled state for up/down arrows when at first/last position
- Budget and units summary display in outcome header

#### Functionality
- **Move Up/Down**: Functional reordering of outcomes within the offering
- **Move**: Placeholder alert for moving to another offering
- **Merge**: Placeholder alert for merging with another outcome
- **Collapse Toggle**: Placeholder for future collapsible outcomes

### 2. Component-Level Actions

#### Button Placement
- **Location**: Right side of component header
- **Buttons Added**:
  - **Remove** (Trash2 icon) - Delete component with confirmation
  - **Move** (ArrowRight icon) - Move component to another outcome
  - **Merge** (Merge icon) - Merge component with another component
  - **Edit** (Edit icon) - Open component designer drawer (existing)

#### Visual Design
- Consistent styling with outcome-level buttons
- Proper button grouping and spacing
- Color-coded icons for different actions
- Maintains existing Edit button functionality

#### Functionality
- **Remove**: Functional deletion with confirmation dialog
- **Move**: Placeholder alert for moving to another outcome
- **Merge**: Placeholder alert for merging with another component
- **Edit**: Opens the Component Designer Drawer (existing functionality)

### 3. Enhanced Header Layout

#### Outcome Header Structure
```
[Up/Down Controls] [Outcome Title] [Budget Info] | [Move] [Merge] [Collapse]
```

#### Component Header Structure
```
[Component Info] | [Remove] [Move] [Merge] [Edit]
```

### 4. CSS Styling Updates

#### New CSS Classes Added
- `.outcome-header-content` - Flexbox layout for outcome header
- `.outcome-order-controls` - Vertical button group for up/down
- `.outcome-budget-info` - Budget and units display
- `.outcome-actions` - Action buttons container
- `.component-actions` - Component action buttons container

#### Design Consistency
- Maintains existing color scheme and typography
- Uses consistent button sizes and spacing
- Proper hover states and transitions
- Responsive design considerations

### 5. Functional Methods Added

#### Outcome Methods
- `moveOutcomeUp()` - Move outcome up in order
- `moveOutcomeDown()` - Move outcome down in order
- `isFirstOutcome()` - Check if outcome is first (disable up button)
- `isLastOutcome()` - Check if outcome is last (disable down button)
- `moveOutcome()` - Placeholder for moving to another offering
- `mergeOutcome()` - Placeholder for merging outcomes
- `toggleOutcomeCollapse()` - Placeholder for collapse functionality
- `getOutcomeBudget()` - Calculate total budget for outcome
- `getOutcomeUnits()` - Calculate total units for outcome

#### Component Methods
- `removeComponent()` - Delete component with confirmation
- `moveComponent()` - Placeholder for moving to another outcome
- `mergeComponent()` - Placeholder for merging components

### 6. User Experience Enhancements

#### Interactive Features
- **Confirmation dialogs** for destructive actions (remove)
- **Disabled states** for invalid operations (first/last outcome)
- **Visual feedback** with hover states and transitions
- **Keyboard accessibility** maintained for editable fields

#### Information Display
- **Budget summaries** at outcome level showing total cost and units
- **Clear action labeling** with descriptive icons and text
- **Consistent spacing** and visual hierarchy

## Technical Implementation

### Icons Used
- `ArrowRight` - Move actions
- `Merge` - Merge actions  
- `Trash2` - Remove/delete actions
- `ChevronUp/ChevronDown` - Reorder actions
- `Edit` - Edit actions (existing)

### State Management
- Reactive updates when reordering outcomes
- Proper component removal from data structure
- Maintained data integrity during operations

### Future Enhancements
- Backend integration for actual move/merge operations
- Drag-and-drop reordering interface
- Bulk operations for multiple selections
- Undo/redo functionality
- Advanced merge conflict resolution

## Testing Completed

### Functional Testing
- ✅ Outcome reordering (up/down) works correctly
- ✅ Component removal with confirmation works
- ✅ Button states (enabled/disabled) work properly
- ✅ Budget calculations display correctly
- ✅ All placeholder alerts show appropriate messages

### Visual Testing
- ✅ Buttons align properly in headers
- ✅ Consistent styling across all action buttons
- ✅ Responsive layout maintains structure
- ✅ Icons display correctly with proper sizing

### Integration Testing
- ✅ Existing Edit functionality still works
- ✅ Component Designer Drawer integration maintained
- ✅ Resource display and interactions unaffected
- ✅ Overall offering structure preserved

## Conclusion

The merge, move, and delete buttons have been successfully implemented with a consistent design that matches the reference image. The functionality provides users with comprehensive control over their offering structure while maintaining the existing workflow and design patterns.

The implementation includes both functional operations (reordering, removal) and placeholder alerts for future backend integration (move between offerings, merge operations). The visual design maintains consistency with the existing ALP design system while providing clear, intuitive controls for offering management.

---

**Implementation Date**: January 10, 2025  
**Status**: Complete  
**Integration**: Seamless with existing Phase 2 implementation
