# ALP Component Integration Guide

This guide explains how to integrate components built in the ALP workspace with the existing ALP system.

## Integration Overview

Components built in this workspace are designed to be drop-in replacements or additions to ALP's existing system with minimal modification required.

## Pre-Integration Checklist

Before integrating any component:

### 1. Data Compatibility
- [ ] Component uses ALP's actual field names (e.g., `matter_id`, `client_id`)
- [ ] Data types match ALP's database schema
- [ ] API response formats are compatible
- [ ] Validation rules match ALP's business logic

### 2. Styling Compatibility
- [ ] Component uses ALP's existing CSS classes
- [ ] Colors match ALP's brand guidelines
- [ ] Typography follows ALP's style guide
- [ ] Responsive behavior matches ALP's patterns

### 3. Functionality Compatibility
- [ ] Component integrates with ALP's existing JavaScript/PHP
- [ ] Event handling follows ALP's patterns
- [ ] Form submissions work with ALP's backend
- [ ] Error handling matches ALP's approach

## Integration Process

### Step 1: Prepare Component Files
```bash
# Copy component files to ALP's structure
cp alp-workspace/src/alp-components/matter/MatterCard.php /path/to/alp/components/
cp alp-workspace/src/alp-components/matter/matter-card.css /path/to/alp/assets/css/
```

### Step 2: Update ALP's Asset Pipeline
```php
// Add to ALP's CSS compilation
@import 'components/matter-card.css';
```

### Step 3: Register Component
```php
// In ALP's component registry
$components['matter-card'] = new MatterCard();
```

### Step 4: Update Database Queries
```php
// Ensure queries return data in expected format
$matter = $db->query("
    SELECT 
        matter_id,
        matter_name,
        matter_number,
        client_id,
        matter_status,
        priority_level,
        assigned_solicitor_id,
        created_date,
        due_date,
        estimated_budget,
        actual_costs
    FROM matters 
    WHERE matter_id = ?
", [$matter_id]);
```

## Common Integration Patterns

### 1. .NET Core Component Integration
```csharp
// ALP Matter Card Component
public class ALPMatterCardComponent : ViewComponent
{
    private readonly IAlpDbContext _context;
    private readonly IMapper _mapper;
    
    public ALPMatterCardComponent(IAlpDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }
    
    public async Task<IViewComponentResult> InvokeAsync(int matterId)
    {
        var matter = await _context.Matters
            .Include(m => m.Client)
            .Include(m => m.AssignedSolicitor)
            .Where(m => m.MatterId == matterId && !m.IsDeleted)
            .FirstOrDefaultAsync();
            
        if (matter == null)
            return Content("Matter not found");
            
        var viewModel = _mapper.Map<MatterCardViewModel>(matter);
        return View(viewModel);
    }
}

// Matter Card View Model
public class MatterCardViewModel
{
    public int MatterId { get; set; }
    public string MatterName { get; set; }
    public string MatterNumber { get; set; }
    public int ClientId { get; set; }
    public string ClientName { get; set; }
    public MatterStatus MatterStatus { get; set; }
    public PriorityLevel PriorityLevel { get; set; }
    public int AssignedSolicitorId { get; set; }
    public string SolicitorName { get; set; }
    public string SolicitorInitials { get; set; }
    public DateTime? DueDate { get; set; }
    public decimal? EstimatedBudget { get; set; }
    public decimal ActualCosts { get; set; }
    public decimal BillableHours { get; set; }
}

// Entity Framework Models
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
    public string Description { get; set; }
    public string Notes { get; set; }
    public DateTime LastUpdated { get; set; }
    public int UpdatedBy { get; set; }
    public bool IsDeleted { get; set; }
    
    // Navigation Properties
    public virtual Client Client { get; set; }
    public virtual Solicitor AssignedSolicitor { get; set; }
    public virtual ICollection<TimeEntry> TimeEntries { get; set; }
    public virtual ICollection<Invoice> Invoices { get; set; }
}

// Enums
public enum MatterStatus
{
    ToBeQuoted = 1,
    QuotedAwaitingAcceptance = 2,
    Lost = 3,
    Open = 4,
    Closed = 5,
    Finalised = 6
}

public enum PriorityLevel
{
    Low = 1,
    Medium = 2,
    High = 3,
    Urgent = 4
}
```

### 2. JavaScript Integration
```javascript
// ALP Matter Card JavaScript
class ALPMatterCard {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            apiEndpoint: '/api/matters',
            ...options
        };
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.loadData();
    }
    
    bindEvents() {
        // Use ALP's existing event patterns
        this.element.addEventListener('click', (e) => {
            if (e.target.matches('.alp-matter-action')) {
                this.handleAction(e.target.dataset.action);
            }
        });
    }
    
    async loadData() {
        // Use ALP's existing API patterns
        const response = await ALPApi.get(this.options.apiEndpoint);
        this.render(response.data);
    }
    
    handleAction(action) {
        // Integrate with ALP's existing action handlers
        switch(action) {
            case 'view-details':
                ALPModal.open('matter-details', { matterId: this.matterId });
                break;
            case 'edit':
                ALPRouter.navigate(`/matters/${this.matterId}/edit`);
                break;
        }
    }
}
```

### 3. CSS Integration
```css
/* ALP Matter Card Styles */
.alp-matter-card {
    /* Use ALP's existing card base styles */
    @extend .alp-card;
    
    /* Component-specific styles */
    border-radius: var(--alp-border-radius);
    box-shadow: var(--alp-card-shadow);
    background: var(--alp-card-background);
}

.alp-matter-card__header {
    /* Use ALP's existing header styles */
    @extend .alp-card-header;
    
    padding: var(--alp-spacing-md);
    border-bottom: 1px solid var(--alp-border-color);
}

.alp-matter-card__status {
    /* Use ALP's existing status badge styles */
    @extend .alp-badge;
}

.alp-matter-card__status--open {
    @extend .alp-badge--success;
}

.alp-matter-card__status--urgent {
    @extend .alp-badge--danger;
}
```

## Testing Integration

### 1. Unit Tests
```php
<?php
class ALPMatterCardTest extends PHPUnit\Framework\TestCase {
    public function testRenderWithValidData() {
        $matter_data = [
            'matter_id' => 1001,
            'matter_name' => 'Test Matter',
            'client_id' => 501,
            'matter_status' => 'open'
        ];
        
        $card = new ALPMatterCard($matter_data);
        $html = $card->render();
        
        $this->assertStringContains('Test Matter', $html);
        $this->assertStringContains('alp-matter-card', $html);
    }
}
?>
```

### 2. Integration Tests
```php
<?php
class ALPMatterCardIntegrationTest extends PHPUnit\Framework\TestCase {
    public function testIntegrationWithDatabase() {
        // Test with real ALP database
        $matter = Matter::find(1001);
        $card = new ALPMatterCard($matter->toArray());
        
        $this->assertInstanceOf(ALPMatterCard::class, $card);
        $this->assertNotEmpty($card->render());
    }
}
?>
```

## Deployment Steps

### 1. Staging Deployment
1. Deploy to ALP's staging environment
2. Run integration tests
3. Verify component functionality
4. Check for conflicts with existing components

### 2. Production Deployment
1. Create database backup
2. Deploy component files
3. Update asset compilation
4. Clear ALP's cache
5. Monitor for errors

### 3. Rollback Plan
```bash
# If issues occur, rollback steps:
git checkout previous-version
php artisan cache:clear
php artisan config:clear
```

## Monitoring and Maintenance

### Performance Monitoring
- Monitor page load times
- Check database query performance
- Verify memory usage

### Error Tracking
- Monitor ALP's error logs
- Set up alerts for component-related errors
- Track user interaction metrics

### Updates and Maintenance
- Keep components synchronized with ALP updates
- Regular testing with new ALP versions
- Documentation updates as needed

This integration guide ensures smooth deployment of prototyped components into the ALP production environment.
