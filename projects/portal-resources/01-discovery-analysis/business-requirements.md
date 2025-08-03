# Business Requirements - Portal Resources

## Primary Business Objective

**"To make resources available to users at the 'point of need' - the most appropriate resource at the most appropriate time during matter execution."**

## Core Business Problems Addressed

### 1. Knowledge Management Challenge
- **Problem**: Resources scattered across different locations and taxonomies
- **Impact**: Users waste time searching for appropriate resources
- **Solution**: Centralized, contextual resource delivery

### 2. Resource Duplication & Management
- **Problem**: Multiple copies of resources difficult to maintain. Have one copy of the resource that is linked to in the appropriate context
- **Impact**: Version control issues, inconsistent information
- **Solution**: Single source of truth with proper linking

### 3. Context-Aware Resource Delivery
- **Problem**: Generic resource access not tailored to current work context
- **Impact**: Information overload, reduced efficiency. Hard to find resources when they are needed
- **Solution**: Matter-specific, workflow-integrated resource access

## Functional Requirements

### Resource Hierarchy Management
- **VD Offering Folders**: Direct SharePoint links to offering-specific resources
- **Three-tier structure**: Offering → Outcome → Component level resources
- **Resource types**: Syntaq Forms, Documents, URLs, Templates

### User Interface Requirements
- **Matter Integration**: Resources tab within existing Matter detail view
- **Modal Interactions**: Overlay dialogs for resource selection and management
- **Responsive Design**: Support for desktop and tablet usage
- **Search & Filter**: Quick access to specific resources

### Technical Requirements
- **SharePoint Integration**: Seamless linking to existing document repositories
- **ALP UI Consistency**: Follow existing design patterns and components
- **Permission Model**: Single permission level (no role-based restrictions)
- **Performance**: Fast loading and responsive interactions

## Business Rules

### Resource Association
1. Resources can be associated at Offering, Outcome, or Component level
2. Lower-level associations take precedence (Component > Outcome > Offering)
3. VD Offering Folders available only at Offering level

### Access Control
1. All users have same access level (simplified permission model)
2. Resources inherit matter-level access permissions. All users have full matter-level access
3. SharePoint links respect existing SharePoint permissions. The ALP has machine-to-machine SharePoint access using the MS Graph

### Data Management
1. Some resources are maintained in external systems (SharePoint, Syntaq). ALP stores only metadata and links
1. Some resources are stored in the ALP database, e.g. documents, template emails 
3. External resource updates managed in source systems
4. Internal resource updates managed in ALP. This is currently an 'overwrite' of data, rather than a full version control system

## Success Criteria

### User Experience
- Resources available at point-of-need during matter execution
- Increase resource utilization by 60%
- Achieve intuitive, efficient resource access workflow
- Clear visual organization by Offering → Outcome → Component hierarchy

### System Performance
- Page load times under 2 seconds
- Modal interactions under 1 second
- Responsive interface matching existing ALP performance

### Business Impact
- Improved matter execution efficiency
- Reduced time spent on resource discovery
- Enhanced knowledge sharing across teams
- Seamless integration with existing ALP workflows

## Constraints

### Technical Constraints
- Must integrate with existing ALP architecture
- Limited to prototype/demonstration functionality
- No backend database modifications
- Test data only (no live SharePoint integration)

### Business Constraints
- Cannot modify existing SharePoint structures
- Must maintain existing ALP workflows
- No changes to current permission systems

## Assumptions

1. SharePoint URLs will be provided as static test data
2. Resource metadata will be maintained manually for prototype. There are existing metadata lists in ALP that can be accessed to generate test data
3. Users familiar with existing ALP interface patterns
4. Modal-based interactions acceptable for resource management
5. Existing Matter workflow remains unchanged