# ALP-Specific Component Workspace

This workspace is designed specifically for prototyping components that will integrate with the existing ALP (Australian Legal Practice) system.

## Purpose

Unlike the general prototype playground, this workspace:
- Mirrors ALP's actual codebase structure and patterns
- Uses ALP's real data structures and field names
- Follows ALP's existing CSS classes and styling conventions
- Implements components that can be directly integrated into ALP

## Workspace Structure

```
alp-workspace/
├── README.md                    # This file
├── SETUP.md                     # Setup instructions for ALP integration
├── src/
│   ├── alp-components/          # Components matching ALP's structure
│   │   ├── matter/              # Matter-related components
│   │   ├── client/              # Client-related components
│   │   ├── invoice/             # Invoice-related components
│   │   └── shared/              # Shared ALP components
│   ├── alp-data/                # Sample data matching ALP's database schema
│   │   ├── matter-samples.json  # Real ALP matter structure
│   │   ├── client-samples.json  # Real ALP client structure
│   │   └── schema/              # Database schema documentation
│   ├── alp-styles/              # ALP's actual CSS classes and styles
│   │   ├── alp-base.css         # Base ALP styles
│   │   ├── alp-components.css   # Component-specific styles
│   │   └── alp-variables.css    # ALP CSS variables
│   ├── alp-types/               # TypeScript interfaces matching ALP models
│   │   ├── matter.types.ts      # Matter model interfaces
│   │   ├── client.types.ts      # Client model interfaces
│   │   └── api.types.ts         # API response interfaces
│   └── alp-utils/               # ALP-specific utilities and helpers
│       ├── formatters.ts        # Data formatting utilities
│       ├── validators.ts        # Validation rules
│       └── api-helpers.ts       # API integration helpers
├── documentation/               # ALP-specific documentation
│   ├── component-specs/         # Component specifications
│   ├── data-models/             # Data model documentation
│   └── integration-guide.md     # How to integrate with ALP
└── examples/                    # Working examples
    ├── matter-card-alp.html     # ALP-style matter card
    ├── client-form-alp.html     # ALP-style client form
    └── integration-demo.html    # Full integration demo
```

## Development Workflow

1. **Load ALP Documentation**
   - Place ALP documentation in `/documentation/`
   - Analyze existing ALP patterns and structures
   - Document current CSS classes and component patterns

2. **Create ALP-Compatible Components**
   - Build components in `/src/alp-components/`
   - Use ALP's actual CSS classes and naming conventions
   - Follow ALP's data structure patterns
   - Implement ALP's business logic and validation rules

3. **Test with Real ALP Data**
   - Use sample data that matches ALP's database schema
   - Test with ALP's actual API response formats
   - Validate against ALP's business rules

4. **Integration Ready**
   - Components built here should be directly transferable to ALP
   - Minimal modification needed for production integration
   - Follows ALP's existing architecture patterns

## Key Differences from General Prototype

| Aspect | General Prototype | ALP Workspace |
|--------|------------------|---------------|
| **Purpose** | UI exploration & learning | Direct ALP integration |
| **CSS** | Tailwind + shadcn/ui | ALP's actual CSS classes |
| **Data** | Clean modern interfaces | ALP's database schema |
| **Structure** | Modern Vue patterns | ALP's existing patterns |
| **Integration** | Standalone demo | Drop-in ALP components |

## Getting Started

1. Load ALP documentation into `/documentation/`
2. Analyze ALP's existing component patterns
3. Create sample data matching ALP's schema in `/alp-data/`
4. Build components following ALP's conventions
5. Test integration with ALP's actual systems

This workspace ensures that prototyped components will seamlessly integrate with the existing ALP codebase.
