export type WorkspaceEnvelope<T> = {
  id: 'current' | 'recovery'
  schemaVersion: 1
  savedAt: string
  data: T
}

export type AssetRecord = {
  id: string
  blob: Blob
  createdAt: string
  name?: string
  type?: string
}

export type LoadedWorkspace<T> = {
  data: T | null
  source: 'current' | 'recovery' | 'empty'
  savedAt?: string
}

export type AssetMetadata = {
  id?: string
  name?: string
  createdAt?: string
}

type ReferenceLike = {
  imageAssetId?: string
  imageData?: string
}

type SnapshotLike = {
  references?: ReferenceLike[]
}

type ProjectLike = {
  references?: ReferenceLike[]
  snapshots?: SnapshotLike[]
}

const DB_NAME = 'rverse-blueprint'
const DB_VERSION = 1
const WORKSPACE_STORE = 'workspace'
const ASSET_STORE = 'assets'

let databasePromise: Promise<IDBDatabase> | null = null

const requestResult = <T,>(request: IDBRequest<T>) => new Promise<T>((resolve, reject) => {
  request.onsuccess = () => resolve(request.result)
  request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed.'))
})

const transactionDone = (transaction: IDBTransaction) => new Promise<void>((resolve, reject) => {
  transaction.oncomplete = () => resolve()
  transaction.onerror = () => reject(transaction.error ?? new Error('IndexedDB transaction failed.'))
  transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB transaction was aborted.'))
})

const openDatabase = () => {
  if (databasePromise) return databasePromise
  if (typeof indexedDB === 'undefined') return Promise.reject(new Error('IndexedDB is unavailable in this browser.'))

  databasePromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(WORKSPACE_STORE)) db.createObjectStore(WORKSPACE_STORE, { keyPath: 'id' })
      if (!db.objectStoreNames.contains(ASSET_STORE)) db.createObjectStore(ASSET_STORE, { keyPath: 'id' })
    }
    request.onsuccess = () => {
      const db = request.result
      db.onversionchange = () => db.close()
      resolve(db)
    }
    request.onerror = () => {
      databasePromise = null
      reject(request.error ?? new Error('Could not open Blueprint local storage.'))
    }
    request.onblocked = () => {
      databasePromise = null
      reject(new Error('Blueprint local storage upgrade is blocked by another open tab.'))
    }
  })

  return databasePromise
}

const isWorkspaceEnvelope = <T,>(value: unknown): value is WorkspaceEnvelope<T> => {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<WorkspaceEnvelope<T>>
  return (candidate.id === 'current' || candidate.id === 'recovery') && candidate.schemaVersion === 1 && typeof candidate.savedAt === 'string' && 'data' in candidate
}

export async function loadWorkspace<T>(validator?: (data: unknown) => data is T): Promise<LoadedWorkspace<T>> {
  const db = await openDatabase()
  const transaction = db.transaction(WORKSPACE_STORE, 'readonly')
  const done = transactionDone(transaction)
  const store = transaction.objectStore(WORKSPACE_STORE)
  const [current, recovery] = await Promise.all([
    requestResult(store.get('current')),
    requestResult(store.get('recovery')),
  ])
  await done

  const usable = (value: unknown): value is WorkspaceEnvelope<T> =>
    isWorkspaceEnvelope<T>(value) && (!validator || validator(value.data))

  if (usable(current)) return { data: current.data, source: 'current', savedAt: current.savedAt }
  if (usable(recovery)) return { data: recovery.data, source: 'recovery', savedAt: recovery.savedAt }
  return { data: null, source: 'empty' }
}

export async function saveWorkspace<T>(data: T, options: { updateRecovery?: boolean } = {}): Promise<string> {
  const db = await openDatabase()
  const updateRecovery = options.updateRecovery ?? true
  let previous: unknown

  if (updateRecovery) {
    const previousTransaction = db.transaction(WORKSPACE_STORE, 'readonly')
    const previousDone = transactionDone(previousTransaction)
    previous = await requestResult(previousTransaction.objectStore(WORKSPACE_STORE).get('current'))
    await previousDone
  }

  const savedAt = new Date().toISOString()
  const transaction = db.transaction(WORKSPACE_STORE, 'readwrite')
  const done = transactionDone(transaction)
  const store = transaction.objectStore(WORKSPACE_STORE)
  if (updateRecovery && isWorkspaceEnvelope<T>(previous)) {
    store.put({ ...previous, id: 'recovery' } satisfies WorkspaceEnvelope<T>)
  }
  store.put({ id: 'current', schemaVersion: 1, savedAt, data } satisfies WorkspaceEnvelope<T>)
  await done
  return savedAt
}

export async function putAsset(blob: Blob, metadata: AssetMetadata = {}): Promise<string> {
  const db = await openDatabase()
  const id = metadata.id ?? `asset-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  const transaction = db.transaction(ASSET_STORE, 'readwrite')
  const done = transactionDone(transaction)
  transaction.objectStore(ASSET_STORE).put({
    id,
    blob,
    createdAt: metadata.createdAt ?? new Date().toISOString(),
    name: metadata.name,
    type: blob.type || undefined,
  } satisfies AssetRecord)
  await done
  return id
}

export async function getAssetBlob(id: string): Promise<Blob | null> {
  const db = await openDatabase()
  const transaction = db.transaction(ASSET_STORE, 'readonly')
  const done = transactionDone(transaction)
  const record = await requestResult(transaction.objectStore(ASSET_STORE).get(id)) as AssetRecord | undefined
  await done
  return record?.blob instanceof Blob ? record.blob : null
}

export async function deleteAssets(ids: Iterable<string>): Promise<void> {
  const unique = Array.from(new Set(ids))
  if (!unique.length) return
  const db = await openDatabase()
  const transaction = db.transaction(ASSET_STORE, 'readwrite')
  const done = transactionDone(transaction)
  const store = transaction.objectStore(ASSET_STORE)
  unique.forEach((id) => store.delete(id))
  await done
}

export function collectReferencedAssetIds(projects: ProjectLike[]): string[] {
  const ids = new Set<string>()
  const collect = (references?: ReferenceLike[]) => references?.forEach((reference) => {
    if (reference.imageAssetId) ids.add(reference.imageAssetId)
  })
  projects.forEach((project) => {
    collect(project.references)
    project.snapshots?.forEach((snapshot) => collect(snapshot.references))
  })
  return Array.from(ids)
}

export function collectWorkspaceAssetIds(...values: unknown[]): string[] {
  const ids = new Set<string>()
  values.forEach((value) => {
    const data = isWorkspaceEnvelope<unknown>(value) ? value.data : value
    if (!data || typeof data !== 'object') return
    const projects = (data as { projects?: unknown }).projects
    if (!Array.isArray(projects)) return
    collectReferencedAssetIds(projects as ProjectLike[]).forEach((id) => ids.add(id))
  })
  return Array.from(ids)
}

export async function cleanupOrphanAssets(referencedIds: Iterable<string>): Promise<number> {
  const protectedIds = new Set(referencedIds)
  const db = await openDatabase()
  const transaction = db.transaction([WORKSPACE_STORE, ASSET_STORE], 'readwrite')
  const done = transactionDone(transaction)
  const workspaceStore = transaction.objectStore(WORKSPACE_STORE)
  const assetStore = transaction.objectStore(ASSET_STORE)
  const [current, recovery, keys] = await Promise.all([
    requestResult(workspaceStore.get('current')),
    requestResult(workspaceStore.get('recovery')),
    requestResult(assetStore.getAllKeys()),
  ])

  // Recovery is only useful if every asset it references survives cleanup.
  collectWorkspaceAssetIds(current, recovery).forEach((id) => protectedIds.add(id))

  let removed = 0
  keys.forEach((key) => {
    const id = String(key)
    if (!protectedIds.has(id)) {
      assetStore.delete(key)
      removed += 1
    }
  })
  await done
  return removed
}

export function stripInlineImageData<T extends ProjectLike[]>(projects: T): T {
  return projects.map((project) => ({
    ...project,
    references: project.references?.map(({ imageData: _imageData, ...reference }) => reference),
    snapshots: project.snapshots?.map((snapshot) => ({
      ...snapshot,
      references: snapshot.references?.map(({ imageData: _imageData, ...reference }) => reference),
    })),
  })) as T
}

export async function requestPersistentStorage(): Promise<boolean | null> {
  try {
    if (!navigator.storage?.persist) return null
    return await navigator.storage.persist()
  } catch {
    return null
  }
}
