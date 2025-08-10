# ALP Data Fixtures

This folder contains unified JSON fixtures and small loaders used by the prototype.

## Resources Catalog
- `resources/all-resources.json`: Single catalog for all resource objects used across the prototype.
- `resources/loadAllResources.ts`: Loader that returns the catalog (lazy import).

## Offerings Structure and Associations
- `resource-association/simplified-offerings-structure.json`: Offerings → outcomes → components with `associatedResourceIds`.
- `resource-association/loadSimplifiedOfferings.ts`: Resolves the structure to the same shape used by views by mapping `associatedResourceIds` to full resource objects from the catalog.

## Matters and Offering Metadata
- `resources/matter-elements.json`: Matter outcomes/components with `linkedOfferingElementId` that points to the current structure ID (e.g., `outcome-1`, `component-1`).
- `resources/offerings.json`: Optional offering metadata (e.g., `vdFolderUrl`), not currently used by the active views.

## Conventions
- Keep the catalog (`all-resources.json`) as the single source of truth for resources.
- Structure files should reference resources by `id` only; resolution happens in loaders.
- `linkedOfferingElementId` should store the actual structure ID so no mapping is needed in the UI.

## Removed Legacy/Sample Files
The following have been removed in favor of the unified approach:
- `resources/offering-resources.json` → replaced by structure + catalog resolution
- `resource-association/simplified-offerings.json` → replaced by `simplified-offerings-structure.json`
- `resources/sample-resources.json`, `resources/loadSampleResources.ts` → replaced by `all-resources.json` + `loadAllResources.ts`

## Data flow diagram

```mermaid
flowchart LR
	subgraph Catalog & Structure
		RJSON[[resources/all-resources.json]]
		LAR[(resources/loadAllResources.ts)]
		SJSON[[resource-association/simplified-offerings-structure.json]]
		LSO[(resource-association/loadSimplifiedOfferings.ts)]
		MJSON[[resources/matter-elements.json]]
		OJSON[[resources/offerings.json]]
	end

	RJSON --> LAR
	SJSON --> LSO
	RJSON --> LSO

	subgraph Views
		RMP[ResourceManagementPage.vue]
		SRMT[SimplifiedResourceModalTest.vue]
		RAM[ResourceAssociationModal.vue]
		EOT[EnhancedOutcomesTab.vue]
		SOD[SimplifiedOfferingDesigner.vue]
		MRT[MatterResourcesTab.vue]
	end

	LAR --> RMP
	LAR --> SRMT
	LAR --> RAM

	LSO --> EOT
	LSO --> SOD
	MJSON --> MRT
	LSO --> MRT
	%% offerings.json is not wired to active views currently
```

Legend:
- LAR resolves the unified catalog for flat resource lists.
- LSO resolves `associatedResourceIds` in the structure to full resource objects from the catalog.
- MRT builds a hierarchy by joining `matter-elements.json` (linkedOfferingElementId) to resolved structure nodes.

## Component to data mapping

```mermaid
graph TD
	A[ResourceManagementPage.vue] -->|loadAllResources| R[[all-resources.json]]
	B[SimplifiedResourceModalTest.vue] -->|loadAllResources| R
	C[ResourceAssociationModal.vue] -->|loadAllResources| R

	D[EnhancedOutcomesTab.vue] -->|loadSimplifiedOfferings| S[[structure + catalog]]
	E[SimplifiedOfferingDesigner.vue] -->|loadSimplifiedOfferings| S

		F[MatterResourcesTab.vue] -->|matter-elements + loadSimplifiedOfferings| S
```

Notes:
- `linkedOfferingElementId` in matter elements stores the actual structure ID (e.g., `outcome-1`, `component-1`).
- `simplified-offerings-structure.json` is the single place where associations live (`associatedResourceIds`).
- Views never duplicate resources; they resolve via loaders.
