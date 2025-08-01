# Sample Data Structure

This directory contains JSON files with sample data for prototyping ALP UI components.

## Files

### `sample-matters.json`
Contains sample legal matters with the following structure:
- **id**: Unique identifier
- **name**: Matter name/description
- **client**: Client information (name, email)
- **status**: Current status (Open, Closed, On Hold, Cancelled)
- **priority**: Priority level (Low, Medium, High, Urgent)
- **coordinator**: Assigned coordinator (name, initials, email)
- **progress**: Task completion tracking (completed/total)
- **estimatedBudget**: Budget estimate in dollars
- **actualCosts**: Current costs in dollars
- **dueDate**: Due date in YYYY-MM-DD format
- **offerings**: Array of service offerings with colors

### `sample-clients.json`
Contains sample client data with the following structure:
- **id**: Unique identifier
- **name**: Client name
- **email**: Contact email
- **phone**: Phone number
- **status**: Client status (Active, Inactive, Prospect)
- **contactPerson**: Primary contact person
- **createdDate**: Date client was added (YYYY-MM-DD)
- **totalBilled**: Total amount billed to client

## Usage

The data is consumed through the `useData()` composable located at `/src/composables/useData.ts`.

### Example Usage:
```typescript
import { useData } from '@/composables/useData'

const { getMatters, getClients, matterStats } = useData()

// Get all matters
const matters = getMatters.value

// Get matters by status
const openMatters = getMattersByStatus('Open')

// Get statistics
const stats = matterStats.value
```

## Adding New Data

To add new sample data:

1. **For Matters**: Add new objects to the `sample-matters.json` array
2. **For Clients**: Add new objects to the `sample-clients.json` array
3. **For New Entity Types**: Create new JSON files and update the `useData()` composable

## Data Relationships

- Matters reference clients by name (in a real system, this would be by ID)
- Coordinators are referenced by name and initials
- Offerings use color codes for visual differentiation

## Color Codes for Offerings

Available colors: `blue`, `green`, `purple`, `orange`, `red`, `pink`, `indigo`, `teal`

These map to specific hex colors in the component styling.
