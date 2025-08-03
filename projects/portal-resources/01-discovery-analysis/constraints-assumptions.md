# Constraints & Assumptions - Portal Resources Project

## Project Constraints

### Technical Constraints

#### Development Environment
- **Location**: Development must occur in `/alp-workspace/src/components/business/resources/`
- **Framework**: Must use existing ALP architecture (Vue 3 + TypeScript + Vite)
- **UI Consistency**: Must follow existing ALP UI patterns and shadcn/ui (New York variant)
- **Integration**: Must integrate seamlessly with existing Matter workflow

#### Prototype Limitations
- **No Backend Changes**: Prototype uses static/mock data only
- **No Live Integration**: No live SharePoint or external system connections
- **No Data Persistence**: No backend database modifications
- **Static URLs**: SharePoint links will be static mock URLs
- **Test Data Only**: All data will be JSON-based test scenarios

#### Browser & Performance
- **Target**: Modern browsers only (no IE11 requirement)
- **Performance**: Desktop-first responsive design
- **External Links**: Always open in new window/tab

### Business Constraints

#### Organizational
- **Small Organization**: 20 lawyers, streamlined decision-making
- **Single Approver**: CEO has final authority on all decisions
- **Resource Allocation**: Limited development time and resources
- **Existing Workflows**: Cannot disrupt current ALP Matter processes

#### Functional Scope
- **Display Only**: Resources display and organization, no editing/management
- **Permission Model**: Single permission level (no role-based restrictions)
- **External Systems**: No changes to existing SharePoint structures
- **Data Sources**: Resources maintained in external systems unchanged

### Timeline Constraints
- **Prototype Development**: 4-6 week development window
- **Phase-Gate Approach**: Must complete each phase before proceeding
- **Approval Gates**: CEO approval required between phases

## Key Assumptions

### Business Assumptions

#### User Behavior
1. **ALP Familiarity**: Lawyers are familiar with existing ALP interface patterns
2. **Modal Acceptance**: Modal-based interactions are acceptable for resource management
3. **Workflow Integration**: Adding Resources tab to Matter workflow is intuitive
4. **Point-of-Need Access**: Users will prefer contextual resource access over separate systems

#### Data & Content
1. **Test Data Sufficiency**: JSON test data will adequately demonstrate functionality
2. **Resource Metadata**: Existing ALP database schema provides sufficient resource structure
3. **SharePoint URLs**: Mock SharePoint URLs will effectively demonstrate VD Offering Folder concept
4. **Content Variety**: Single offering example ("Unfair Dismissal") sufficient for prototype validation

### Critical Data Architecture Constraint: Offering-Matter Resource Linking

**Complex Relationship**: Offerings exist separately from Matters with specific linking behavior:

1. **Matter Creation Process**:
   - When a matter is created, offering outcomes/components are **COPIED** to the matter
   - Matter maintains ID links back to original offering outcomes/components
   - These links enable analytics and tracking

2. **Offering Evolution**:
   - Offerings can be redesigned (outcomes/components moved, merged, deleted)
   - Changes to offerings do NOT affect existing matter structures
   - Matter outcomes/components remain as originally copied

3. **Resource Linking Strategy**:
   - Resources are **NOT copied** when matters are created
   - Each matter element fetches resources from its linked offering element
   - Background process updates links when offerings are redesigned
   - Matter UI automatically reflects current offering resources

**Impact on Prototype**: 
- Test data must simulate matter elements with linkedOfferingElementId
- UI displays matter structure but fetches resources from offering elements
- Handle empty states when offering elements are deleted

**Reference Documentation**: 
- `alp_offering_architecture.md` - Detailed offering structure
- `alp_analytics_offering_matters.md` - Analytics and linking patterns

### Technical Assumptions

#### System Integration
1. **ALP Database Schema**: Existing schema in `alp-documentation/alp_database_structure.sql` provides complete data model
2. **Component Reusability**: Existing ALP components can be extended for resource functionality
3. **URL Construction**: Static URLs adequate for prototype (sophisticated URL construction not required)
4. **MS Graph Simulation**: Static SharePoint URLs effectively simulate MS Graph integration

#### Development Environment
1. **alp-workspace Maturity**: `/alp-workspace/` environment is fully functional for development
2. **Reference Codebase**: `/ALP-reference/` provides complete patterns for component development
3. **Test Data Creation**: Can create appropriate test data as components are developed
4. **Component Architecture**: Existing hierarchical patterns (Offering → Outcome → Component) support resource associations

### Validation Assumptions

#### Success Measurement
1. **Qualitative Validation**: User feedback and CEO approval sufficient for success validation
2. **Workflow Demonstration**: Prototype can effectively demonstrate improved resource access workflow
3. **Business Value**: Visual demonstration will clearly show business value without quantitative metrics
4. **User Adoption**: Interface consistency with existing ALP will ensure user adoption

## Risk Mitigation

### Technical Risks
- **Integration Complexity**: Mitigated by using existing ALP patterns and components
- **Data Model Mismatch**: Mitigated by using actual ALP database schema for test data
- **Performance Issues**: Mitigated by following existing ALP performance patterns

### Business Risks  
- **User Resistance**: Mitigated by maintaining existing workflow patterns
- **Scope Creep**: Mitigated by clear phase gates and single approver
- **Timeline Pressure**: Mitigated by limiting scope to display-only functionality

## Validation Criteria

### Technical Validation
- Components integrate seamlessly with existing ALP architecture
- Performance matches existing ALP page load times
- UI consistency maintained across all new components

### Business Validation
- CEO confirms alignment with business objectives
- Lawyers validate improved workflow efficiency
- Prototype demonstrates clear business value

### Functional Validation
- All user stories completed with acceptance criteria met
- Resource hierarchy properly displays and functions
- Modal interactions work as designed
- External link handling functions correctly

## Future Considerations

### Post-Prototype Assumptions
1. **Production Implementation**: Successful prototype may lead to production development
2. **Live Integration**: Future versions may include live SharePoint/MS Graph integration
3. **Data Management**: Future versions may include resource editing/management features
4. **Permission Enhancement**: Future versions may include role-based access control

### Environment Migration
1. **Prototype Cleanup**: `/prototype/` folder may be deleted after successful `/alp-workspace/` implementation
2. **Component Reusability**: Components developed in prototype can be migrated to production ALP
3. **Test Data Evolution**: Test data patterns can be adapted for production data integration