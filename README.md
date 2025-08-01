# ALP UI Prototype Environment

A comprehensive prototyping environment for building and testing UI components for the Australian Legal Practice (ALP) system.

## 🎯 Overview

This repository contains two distinct workspaces:

1. **General Prototype Playground** (`/prototype/`) - Modern Vue 3 + TypeScript environment for UI exploration
2. **ALP-Specific Workspace** (`/alp-workspace/`) - Production-ready components that integrate with ALP's .NET Core system

## 🚀 Quick Start

### General Prototype Playground
```bash
cd prototype
npm install
npm run prototype
```
Visit `http://localhost:5173` to see the interactive prototype playground.

### ALP-Specific Development
See `/alp-workspace/SETUP.md` for detailed setup instructions for building production-ready ALP components.

## 📁 Project Structure

```
├── prototype/                    # General prototyping environment
│   ├── src/
│   │   ├── components/          # Vue components organized by type
│   │   ├── data/               # JSON sample data
│   │   ├── composables/        # Vue composables for data management
│   │   └── types/              # TypeScript type definitions
│   └── package.json
├── alp-workspace/               # ALP-specific development workspace
│   ├── src/
│   │   ├── alp-components/     # Components matching ALP's structure
│   │   ├── alp-data/          # Sample data matching ALP's schema
│   │   ├── alp-types/         # TypeScript interfaces for ALP
│   │   └── alp-styles/        # ALP's actual CSS classes
│   └── documentation/          # ALP integration guides
├── documentation/              # General ALP documentation
└── WORKFLOW.md                # Development workflow guide
```

## 🛠️ Technology Stack

### General Prototype
- **Frontend**: Vue 3 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Pinia
- **Development**: Hot reload, component testing

### ALP Integration
- **Backend**: .NET Core 6+ with Entity Framework Core
- **Frontend**: Vue.js 3 with TypeScript
- **Database**: PostgreSQL
- **Cloud**: Microsoft Azure

## 📚 Documentation

- **[WORKFLOW.md](./WORKFLOW.md)** - Complete development workflow
- **[ALP Workspace Setup](./alp-workspace/SETUP.md)** - ALP-specific development guide
- **[Integration Guide](./alp-workspace/documentation/integration-guide.md)** - Production deployment guide
- **[Component Templates](./prototype/src/components/COMPONENT_TEMPLATE.md)** - Component development standards

## 🎨 Features

### General Prototype Playground
- ✅ Interactive component testing environment
- ✅ Live component variants and state testing
- ✅ JSON-based sample data management
- ✅ TypeScript type safety
- ✅ Hot reload development
- ✅ Component documentation system

### ALP-Specific Workspace
- ✅ .NET Core ViewComponent integration patterns
- ✅ Entity Framework model compatibility
- ✅ ALP database schema alignment
- ✅ Production-ready component architecture
- ✅ Integration testing framework
- ✅ Deployment guides and checklists

## 🔧 Development Workflow

### For UI Exploration
1. Use the general prototype playground
2. Build and test components interactively
3. Iterate on design and functionality
4. Document component specifications

### For ALP Production Components
1. Load ALP documentation into `/alp-workspace/documentation/`
2. Create components following ALP's patterns
3. Test with ALP's actual data structures
4. Deploy using integration guides

## 📊 Sample Data

The environment includes comprehensive sample data:
- **Legal Matters** with realistic case information
- **Client Records** with contact and billing data
- **Time Entries** and billing information
- **Invoice Data** with financial calculations

All sample data follows ALP's actual database schema and business logic.

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd alp-ui-prototype
   ```

2. **For general prototyping:**
   ```bash
   cd prototype
   npm install
   npm run prototype
   ```

3. **For ALP-specific development:**
   - Review `/alp-workspace/README.md`
   - Follow setup guide in `/alp-workspace/SETUP.md`
   - Load ALP documentation as needed

## 🤝 Contributing

1. Follow the component template structure
2. Update documentation for new components
3. Test components in both environments as appropriate
4. Follow TypeScript best practices
5. Maintain compatibility with ALP's existing systems

## 📝 License

This project is for internal ALP development use.

## 🔗 Related Documentation

- ALP Business Application Overview
- ALP Database Structure Documentation
- Component Development Standards
- Integration Testing Guidelines

---

**Last Updated**: January 2025  
**Environment Version**: 1.0  
**ALP Compatibility**: .NET Core 6+, Vue.js 3, PostgreSQL
