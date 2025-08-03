# User Journey Maps - Portal Resources

## Primary User Persona: Legal Professional (Lawyer)

**Context**: Experienced ALP user working on matters, needs efficient access to resources during matter execution.

---

## Journey 1: Accessing Resources During Matter Work (Primary Flow)

### Scenario
Sarah is working on an "Unfair Dismissal" matter and needs to access relevant resources to complete the next component in her workflow.

### Current State Pain Points
- Resources scattered across different systems (SharePoint, email templates, precedent folders)
- Manual searching through generic folder structures
- Time lost switching between systems
- Uncertainty about which resources are most appropriate

### Future State Journey

#### **Phase 1: Arriving at Matter**
**Trigger**: Sarah opens a matter in ALP to continue work

1. **Opens Matter Detail View**
   - *Action*: Clicks on matter from matter list
   - *System*: Loads matter detail with standard tabs
   - *Expectation*: Fast loading, familiar interface

2. **Notices Resources Tab**
   - *Action*: Sees "Resources" tab alongside existing tabs (Overview, Info, Outcomes, etc.)
   - *System*: Tab displays resource count badge if resources available
   - *Expectation*: Clear indication of available resources

#### **Phase 2: Resource Discovery**

3. **Clicks Resources Tab**
   - *Action*: Clicks "Resources" tab
   - *System*: Loads resources organized by hierarchy
   - *Expectation*: Under 2 seconds load time

4. **Sees Organized Resource Structure**
   - *Observation*: Resources displayed by:
     - VD Offering Folders (top level)
     - Offering: "Make a claim for unfair dismissal" [Ability to click on icon and be taken directly to VD Offering Folder]
       - Outcome 1: "Understanding your rights..."
         - Component 1: "Understanding your position..."
         [List of resources attached to this component]
         - Component 2: "Providing written advice..."
         [List of resources attached to this component]
       - Outcome 2: "Bringing a formal complaint..."
         - Component 1: "Preparing and lodging..."
         [List of resources attached to this component]
         - Component 2: "Negotiating with employer..."
         [List of resources attached to this component]
         - Component 3: "Entering Settlement Deed..."
         [List of resources attached to this component]
   - *System*: Hierarchical display with clear visual organization of all offering resources under each Component
   - *Expectation*: Immediate understanding of offering structure and associated resources
   
#### **Phase 3: Resource Selection**

5. **Identifies Relevant Resources**
   - *Action*: Scans resources for current work context
   - *Mental Model*: "I'm working on Component 1 of Outcome 2, what resources do I need?"
   - *System*: Clear visual hierarchy helps identify relevant section and resources

6. **Clicks on Specific Resource within hierarchy**
   - *Action*: Clicks on a document/form/template needed
   - *System*: Opens resource modal with details
   - *Expectation*: Quick preview of resource information

#### **Phase 4: Resource Access**

7. **Reviews Resource Details**
   - *Observation*: Modal shows:
     - Resource type (Document/Form/URL/Template)
     - Brief description
     - Associated hierarchy level
     - Action buttons (Preview, Open, Copy Link, Download)
   - *Decision Point*: Confirms this is the right resource

8. **Accesses Resource**
   - *Action*: Clicks "Open" button
   - *System*: Opens resource in appropriate application/new tab
   - *Expectation*: Seamless transition to resource

#### **Phase 5: Workflow Continuation**

9. **Returns to ALP**
   - *Context*: Has resource open, continues matter work
   - *System*: ALP matter remains accessible
   - *Benefit*: No time lost navigating back to work context

---

## Journey 2: Browsing VD Offering Folders (Secondary Flow)

### Scenario
Mark needs to explore general precedents and resources for unfair dismissal matters beyond the specific resources assigned to components.

### Journey Steps

#### **Discovery Phase**
1. **Accesses Resources Tab**
   - Same as Journey 1, steps 1-3

2. **Notices VD Offering Folders Section**
   - *Observation*: Prominent section at top of resources
   - *Content*: "VD Offering Folders for this matter"
   - *Visual*: External link indicators

#### **Exploration Phase**
3. **Clicks VD Offering Folder Link**
   - *Action*: Clicks "Unfair Dismissal - VD Offering Folder"
   - *System*: Opens SharePoint folder in new tab
   - *Expectation*: Direct access to broader precedent collection

4. **Browses SharePoint Resources**
   - *Context*: Now in SharePoint with offering-specific folder
   - *Benefit*: Access to accumulated precedents and resources
   - *Return*: Can return to ALP when needed

---

## Journey 3: Filtering and Quick Access (Efficiency Flow)

### Scenario
Lisa knows she needs a specific type of resource (e.g., a form) and wants to quickly filter to find it.

### Journey Steps

#### **Efficiency Phase**
1. **Accesses Resources Tab**
   - Same as Journey 1, steps 1-3

2. **Uses Resource Filter**
   - *Action*: Clicks filter dropdown or buttons
   - *Options*: "All", "Forms", "Documents", "URLs", "Templates"
   - *System*: Real-time filtering without page reload

3. **Sees Filtered Results**
   - *Display*: Only selected resource type shown
   - *Hierarchy*: Maintains organizational structure
   - *Count*: Shows filtered count vs total

4. **Quick Resource Access**
   - *Action*: Clicks directly on filtered resource
   - *System*: Same modal/access flow as Journey 1
   - *Benefit*: Faster discovery for known resource types

---

## Journey 4: Error Handling and Edge Cases

### Scenario
Resources are unavailable or links are broken.

### Journey Steps

#### **Error Discovery**
1. **Attempts Resource Access**
   - *Action*: Clicks on resource as normal
   - *System Issue*: SharePoint link broken, file moved, or permissions issue

2. **Receives Clear Error Message**
   - *Display*: Modal with specific error information
   - *Options*: "Try Again", "Report Issue", "Cancel"
   - *Guidance*: Clear next steps for user

3. **Alternative Actions**
   - *Fallback*: User can try VD Offering Folder for alternative resources
   - *Support*: Clear path to get help if needed

---

## Journey Success Metrics

### Efficiency Gains
- **Time to Resource**: Under 30 seconds from matter access to resource open
- **Context Switching**: Eliminate 3-4 system switches per resource access
- **Discovery Time**: Reduce resource discovery from 5+ minutes to under 1 minute

### User Experience Success
- **Cognitive Load**: Clear hierarchy reduces decision complexity
- **Workflow Integration**: No disruption to existing matter workflows
- **Learning Curve**: Familiar ALP interface patterns, minimal training needed

### Business Impact
- **Resource Utilization**: Increased use of appropriate resources
- **Matter Efficiency**: Faster component completion
- **Knowledge Sharing**: Better visibility of available resources

---

## Key Design Implications

### Interface Requirements
1. **Visual Hierarchy**: Clear Offering → Outcome → Component structure
2. **Resource Indicators**: Type, description, external link indicators
3. **Quick Actions**: Preview, open, copy, download options
4. **Filter Controls**: Intuitive filtering by resource type
5. **Modal Design**: Consistent with existing ALP modal patterns

### Performance Requirements
1. **Load Speed**: Resources tab under 2 seconds
2. **Filter Response**: Real-time filtering, no delays
3. **Modal Speed**: Resource details under 1 second
4. **External Links**: New tab opening, no page redirects

### Integration Requirements
1. **Tab Consistency**: Matches existing ALP tab design
2. **Navigation**: Seamless integration with matter workflow
3. **State Management**: Maintains context when switching tabs
4. **Error Handling**: Consistent with ALP error patterns