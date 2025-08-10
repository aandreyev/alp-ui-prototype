// Normalize simplified offerings data to shapes consumed by legacy-like views
// Converts associatedResources -> resources at each level.

export interface NormalizedComponent<TResource = any> {
  id: string
  title?: string
  name?: string
  status?: 'pending' | 'in-progress' | 'completed'
  units?: { completed: number; total: number } | number
  budget?: number
  dueDate?: Date | string
  resources: TResource[]
}

export interface NormalizedOutcome<TResource = any> {
  id: string
  title: string
  resources: TResource[]
  components: NormalizedComponent<TResource>[]
}

export interface NormalizedOffering<TResource = any> {
  id: string
  name: string
  sharePointUrl: string
  resources: TResource[]
  outcomes: NormalizedOutcome<TResource>[]
}

export function normalizeOfferings<TResource = any>(data: any): NormalizedOffering<TResource>[] {
  if (!data || !Array.isArray(data.offerings)) return []
  return data.offerings.map((o: any) => ({
    id: o.id,
    name: o.name,
    sharePointUrl: o.sharePointUrl,
    resources: Array.isArray(o.associatedResources) ? o.associatedResources : [],
    outcomes: Array.isArray(o.outcomes)
      ? o.outcomes.map((out: any) => ({
          id: out.id,
          title: out.title,
          resources: Array.isArray(out.associatedResources) ? out.associatedResources : [],
          components: Array.isArray(out.components)
            ? out.components.map((c: any) => ({
                id: c.id,
                title: c.name ?? c.title,
                name: c.name,
                resources: Array.isArray(c.associatedResources) ? c.associatedResources : [],
                units: c.units,
                budget: c.budget,
                dueDate: c.dueDate,
              }))
            : [],
        }))
      : [],
  }))
}
