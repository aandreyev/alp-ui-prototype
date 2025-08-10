# Resource Management: Migration Plan to Simplified Resource Types

## Goal
Replace the existing `ResourceListPage.vue` view with a new, simpler main page that uses the simplified resource create/edit flows from `src/components/business/resources-add-edit`. The new page and related views will live under `src/components/business/resource-management/`.

## Context
- Entry point: `App-resource-types.vue` leads to the admin resources UI.
- Current page: `components/ui/admin/resources/components/ResourceListPage.vue` with complex, type-specific modals and config.
- New simplified stack:
  - `SimplifiedResourceModal.vue` — central modal for create/edit
  - Type configs: `SimplifiedDocumentConfig.vue`, `SimplifiedUrlConfig.vue`, `SimplifiedFormConfig.vue`, `SimplifiedEmailTemplateConfig.vue`, `SimplifiedVideoConfig.vue`, `SimplifiedVDFolderConfig.vue`
- Data fixtures: centralized in `src/alp-data` and lazy loaded in harnesses.

## Scope
- Create a new main page at `src/components/business/resource-management/ResourceManagementPage.vue` that:
  - Lists resources for a selected type
  - Supports Create/Edit using `SimplifiedResourceModal`
  - Reuses existing shared UI (TagInput, table cells) where compatible
  - Leaves the old page intact for reference until we cut over

## Design decisions
- Use consistent bindings:
  - Input/Textarea/Select with `modelValue`/`update:modelValue`
  - Child emits `update:field` for field-level changes
  - Parent owns form object and mutates via `Object.assign` (avoid replacing)
- Modal API: `isOpen`, `mode`, `resourceType`, `resource`, emits `close`, `created`, `updated`
- Read-only fields display via `modelValue` (no `value`)
- ResourceType import: from the same module as the config map to avoid type/index errors
 - Reference docs:
   - `VUE_DATA_BINDING_PATTERNS.md` (binding/reactivity standards)
   - `DESIGN_PATTERNS.md` (modal API, composition, enums)

## Page outline
- Toolbar
  - Resource type selector (Document, URL, Form, Email Template, Video, SharePoint Folder)
  - Search, tag filter, and quick actions
- Table/List
  - Columns: Name, Type, Tags, Updated, Actions
  - Click row to Edit
- Create/Edit
  - Use `SimplifiedResourceModal` with selected `resourceType`
  - Hook up `created`/`updated` events to insert/update list

## Data flow
- Source initial data from API (later) or unified JSON catalog (now):
  - Import from `src/alp-data/resources/all-resources.json` via `loadAllResources.ts`
  - Data already conforms to the common Resource shape expected by the modal
- Keep per-type derived fields (e.g., file props, URLs) within the same resource object

## Migration steps
1. Create `ResourceManagementPage.vue` under `src/components/business/resource-management/`
2. Implement toolbar with type selector and search
3. Render list filtered by selected type
4. Wire Create action to open `SimplifiedResourceModal` in create mode
5. Wire row click/Edit action to open in edit mode with that resource
6. Handle `created`/`updated` events to update local list
7. Add small adapter if current table cells expect older shapes
8. Keep feature-flag switch (route or config) to toggle between old/new until stable

## Routing / Entry
- For now, route it from `App-resource-types.vue` when selecting a type
- Optionally add a direct route path (e.g., `/admin/resources/manage`)

## Testing
- Manual: verify create/edit for each type pre-fills correctly
- Unit: minimal tests for event emissions and list updates
- Data: keep fixtures in sync with Select option values

## Risks & mitigations
- Binding regressions: enforced via docs + code review
- Type drift: import `ResourceType` from the canonical module with the map
- Reactivity bugs: mutate existing `formData` objects; re-key content if replacing

## Cutover plan
- Ship new page behind a switch
- Gather feedback, then retire `ResourceListPage.vue`

## Next actions
- [ ] Implement `ResourceManagementPage.vue`
- [ ] Wire to `App-resource-types.vue` for the prototype
- [ ] Add feature flag/switch
- [ ] Validate all resource types end-to-end
