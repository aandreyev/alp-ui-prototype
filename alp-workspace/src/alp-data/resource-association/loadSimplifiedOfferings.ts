// Centralized loader for simplified offerings/outcomes/components mock data
export interface SimplifiedOfferingsData<TResource = any> {
  offerings: Array<{
    id: string
    name: string
    description: string
    category: string
    sharePointUrl: string
    resourceCount: number
    associatedResources: TResource[]
    outcomes: Array<{
      id: string
      title: string
      description: string
      resourceCount: number
      associatedResources: TResource[]
      components: Array<{
        id: string
        name: string
        description: string
        type?: string
        units: number
        budget: number
        lawArea: string
        lawSubArea: string
        instructions?: string
        templateName?: string
        resourceCount: number
        associatedResources: TResource[]
      }>
    }>
  }>
}

// Loader now resolves structure + resources into the same shape as before
export async function loadSimplifiedOfferings<TResource = any>(): Promise<SimplifiedOfferingsData<TResource>> {
  const structureMod: any = await import('./simplified-offerings-structure.json')
  const resourcesMod: any = await import('../resources/all-resources.json')
  const structure = structureMod.default as any
  const resources = (resourcesMod.default as any[]) || []
  const byId = new Map<string, any>(resources.map(r => [r.id, r]))

  const resolveIds = (ids: string[] | undefined) =>
    (ids || []).map(id => byId.get(id)).filter(Boolean)

  const resolved = {
    offerings: (structure.offerings || []).map((o: any) => ({
      id: o.id,
      name: o.name,
      description: o.description,
      category: o.category,
      sharePointUrl: o.sharePointUrl,
      resourceCount: o.resourceCount,
      associatedResources: resolveIds(o.associatedResourceIds),
      outcomes: (o.outcomes || []).map((out: any) => ({
        id: out.id,
        title: out.title,
        description: out.description,
        resourceCount: out.resourceCount,
        associatedResources: resolveIds(out.associatedResourceIds),
        components: (out.components || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          description: c.description,
          type: c.type,
          units: c.units,
          budget: c.budget,
          lawArea: c.lawArea,
          lawSubArea: c.lawSubArea,
          instructions: c.instructions,
          templateName: c.templateName,
          resourceCount: c.resourceCount,
          associatedResources: resolveIds(c.associatedResourceIds),
        })),
      })),
    })),
  } as SimplifiedOfferingsData<TResource>

  return resolved
}
