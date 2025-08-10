// Loader for unified resources catalog
export async function loadAllResources<T = any>(): Promise<T[]> {
  const mod: any = await import('./all-resources.json')
  return (mod.default as any[]) as T[]
}
