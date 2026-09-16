import path from "path";
import fs from "fs";
import os from "os";
import { SimulateNote } from "./simulateNotesData";

// Determine base scratch directory safely for local dev vs Vercel Serverless
let _scratchDir: string | null = null;

export function getScratchDir(): string {
  if (_scratchDir) return _scratchDir;

  const localScratch = path.join(process.cwd(), "scratch");
  try {
    // Test if process.cwd()/scratch is writable
    fs.mkdirSync(localScratch, { recursive: true });
    const testFile = path.join(localScratch, `.write_test_${Date.now()}`);
    fs.writeFileSync(testFile, "ok", "utf-8");
    fs.unlinkSync(testFile);
    _scratchDir = localScratch;
  } catch {
    // Running in a read-only environment like Vercel Lambda (/var/task)
    const tmpScratch = path.join(os.tmpdir(), "simulatenotes_scratch");
    try {
      fs.mkdirSync(tmpScratch, { recursive: true });
    } catch {}
    _scratchDir = tmpScratch;
  }

  return _scratchDir;
}

export function getStoragePath(...subpaths: string[]): string {
  const base = getScratchDir();
  const target = path.join(base, ...subpaths);
  try {
    fs.mkdirSync(path.dirname(target), { recursive: true });
  } catch {}
  return target;
}

export function safeReadJson<T = any>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn(`[storage] Could not read ${filePath}:`, err);
  }
  return fallback;
}

export function safeWriteJson(filePath: string, data: any): boolean {
  try {
    const dir = path.dirname(filePath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.warn(`[storage] Could not write ${filePath}:`, err);
    return false;
  }
}

// In-Memory Global Store (survives warm serverless invocations)
interface ServerStore {
  userNotes: Map<string, SimulateNote>;
  deletedNoteIds: Set<string>;
  jobs: Map<string, any>;
  telemetry: any;
  ragCaches: Map<string, any>;
}

declare global {
  // eslint-disable-next-line no-var
  var __simulatenotes_store: ServerStore | undefined;
}

function getGlobalStore(): ServerStore {
  if (!globalThis.__simulatenotes_store) {
    globalThis.__simulatenotes_store = {
      userNotes: new Map(),
      deletedNoteIds: new Set(),
      jobs: new Map(),
      telemetry: null,
      ragCaches: new Map(),
    };
  }
  return globalThis.__simulatenotes_store;
}

// Deleted Notes Management
export function getDeletedNotesSet(): Set<string> {
  const store = getGlobalStore();
  const filePath = getStoragePath("deleted_notes.json");
  const onDisk = safeReadJson<string[]>(filePath, []);
  for (const id of onDisk) {
    store.deletedNoteIds.add(id);
  }
  return store.deletedNoteIds;
}

export function saveDeletedNoteId(id: string): void {
  const store = getGlobalStore();
  store.deletedNoteIds.add(id);
  store.userNotes.delete(id);
  const filePath = getStoragePath("deleted_notes.json");
  safeWriteJson(filePath, Array.from(store.deletedNoteIds));
}

export function removeDeletedNoteId(id: string): void {
  const store = getGlobalStore();
  store.deletedNoteIds.delete(id);
  const filePath = getStoragePath("deleted_notes.json");
  safeWriteJson(filePath, Array.from(store.deletedNoteIds));
}

// User Notes Management
export function getSavedUserNotes(): SimulateNote[] {
  const store = getGlobalStore();
  const deleted = getDeletedNotesSet();
  const results: SimulateNote[] = [];

  // 1. Read from in-memory store
  store.userNotes.forEach((note, id) => {
    if (!deleted.has(id)) {
      results.push(note);
    }
  });

  // 2. Read from disk cache directory if present
  try {
    const ragCacheDir = getStoragePath("rag_cache");
    if (fs.existsSync(ragCacheDir)) {
      const files = fs.readdirSync(ragCacheDir).filter((f) => f.endsWith(".json"));
      for (const file of files) {
        const id = file.replace(/\.json$/, "");
        if (deleted.has(id)) continue;
        if (store.userNotes.has(id)) continue; // already in memory

        const filePath = path.join(ragCacheDir, file);
        const data = safeReadJson<any>(filePath, null);
        if (data) {
          const note: SimulateNote = {
            id: data.notebookId || id,
            title: data.topic || data.title || "Custom Note",
            description: data.description || "",
            date: data.updatedAt ? new Date(data.updatedAt).toLocaleDateString("en-US") : "Recently",
            sources: Array.isArray(data.sources) ? data.sources : [],
            simulation: data.simulation || null,
            messages: Array.isArray(data.messages) ? data.messages : [],
          };
          store.userNotes.set(id, note);
          results.push(note);
        }
      }
    }
  } catch (err) {
    console.warn("[storage] Error scanning rag_cache:", err);
  }

  return results;
}

export function saveUserNote(note: SimulateNote): void {
  const store = getGlobalStore();
  store.userNotes.set(note.id, note);
  removeDeletedNoteId(note.id);

  const filePath = getStoragePath("rag_cache", `${note.id}.json`);
  const dataToSave = {
    notebookId: note.id,
    topic: note.title,
    description: note.description,
    sources: note.sources || [],
    simulation: note.simulation || null,
    messages: note.messages || [],
    updatedAt: Date.now(),
  };
  safeWriteJson(filePath, dataToSave);
}

// Job Storage for Simulation Generation
export function getJob(jobId: string): any {
  const store = getGlobalStore();
  if (store.jobs.has(jobId)) {
    return store.jobs.get(jobId);
  }
  const jobFile = getStoragePath("jobs", jobId, "status.json");
  return safeReadJson(jobFile, null);
}

export function setJob(jobId: string, status: any): void {
  const store = getGlobalStore();
  store.jobs.set(jobId, status);
  const jobFile = getStoragePath("jobs", jobId, "status.json");
  safeWriteJson(jobFile, status);
}

// RAG Cache Storage
export function getRagCache(notebookId: string): any {
  const store = getGlobalStore();
  if (store.ragCaches.has(notebookId)) {
    return store.ragCaches.get(notebookId);
  }
  const cachePath = getStoragePath("rag_cache", `${notebookId}.json`);
  const onDisk = safeReadJson(cachePath, null);
  if (onDisk) {
    store.ragCaches.set(notebookId, onDisk);
    return onDisk;
  }
  return null;
}

export function saveRagCache(notebookId: string, data: any): void {
  const store = getGlobalStore();
  store.ragCaches.set(notebookId, data);
  const cachePath = getStoragePath("rag_cache", `${notebookId}.json`);
  safeWriteJson(cachePath, data);
}
