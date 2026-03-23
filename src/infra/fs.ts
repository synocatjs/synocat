import fsExtra from 'fs-extra';
import nodePath from 'node:path';

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IFileSystem {
  exists(path: string): boolean;
  read(path: string, encoding?: BufferEncoding): string;
  write(path: string, content: string): void;
  mkdir(path: string): void;
  chmod(path: string, mode: number): void;
  copy(src: string, dst: string): void;
  readdir(path: string): string[];
  stat(path: string): { size: number; isFile(): boolean; isDirectory(): boolean };
  remove(path: string): void;
  ensureDir(path: string): void;
}

// ─── Real implementation (wraps fs-extra) ────────────────────────────────────

export class NodeFileSystem implements IFileSystem {
  exists(path: string): boolean {
    return fsExtra.existsSync(path);
  }

  read(path: string, encoding: BufferEncoding = 'utf-8'): string {
    return fsExtra.readFileSync(path, encoding);
  }

  write(path: string, content: string): void {
    fsExtra.outputFileSync(path, content);
  }

  mkdir(path: string): void {
    fsExtra.mkdirSync(path, { recursive: true });
  }

  chmod(path: string, mode: number): void {
    fsExtra.chmodSync(path, mode);
  }

  copy(src: string, dst: string): void {
    fsExtra.copySync(src, dst);
  }

  readdir(path: string): string[] {
    return fsExtra.readdirSync(path);
  }

  stat(path: string): { size: number; isFile(): boolean; isDirectory(): boolean } {
    return fsExtra.statSync(path);
  }

  remove(path: string): void {
    fsExtra.removeSync(path);
  }

  ensureDir(path: string): void {
    fsExtra.ensureDirSync(path);
  }
}

// ─── In-memory implementation (for unit tests, zero I/O) ─────────────────────

export class MemoryFileSystem implements IFileSystem {
  public readonly files = new Map<string, string>();
  public readonly dirs  = new Set<string>();
  public readonly modes = new Map<string, number>();

  private normalize(p: string): string {
    return nodePath.normalize(p);
  }

  exists(path: string): boolean {
    const p = this.normalize(path);
    return this.files.has(p) || this.dirs.has(p);
  }

  read(path: string): string {
    const content = this.files.get(this.normalize(path));
    if (content === undefined) throw new Error(`ENOENT: no such file: ${path}`);
    return content;
  }

  write(path: string, content: string): void {
    const p = this.normalize(path);
    this.mkdir(nodePath.dirname(p));
    this.files.set(p, content);
  }

  mkdir(path: string): void {
    const p = this.normalize(path);
    // Ensure all parent dirs are also recorded
    let cur = p;
    while (cur !== nodePath.dirname(cur)) {
      this.dirs.add(cur);
      cur = nodePath.dirname(cur);
    }
  }

  chmod(path: string, mode: number): void {
    this.modes.set(this.normalize(path), mode);
  }

  copy(src: string, dst: string): void {
    this.write(dst, this.read(src));
  }

  readdir(path: string): string[] {
    const base = this.normalize(path);
    const prefix = base.endsWith('/') ? base : base + nodePath.sep;
    const seen = new Set<string>();
    for (const key of [...this.files.keys(), ...this.dirs]) {
      if (key.startsWith(prefix)) {
        const rest = key.slice(prefix.length);
        const first = rest.split(nodePath.sep)[0];
        if (first) seen.add(first);
      }
    }
    return [...seen];
  }

  stat(path: string): { size: number; isFile(): boolean; isDirectory(): boolean } {
    const p = this.normalize(path);
    const isFile = this.files.has(p);
    const isDir  = this.dirs.has(p);
    if (!isFile && !isDir) throw new Error(`ENOENT: ${path}`);
    return {
      size: isFile ? (this.files.get(p)?.length ?? 0) : 0,
      isFile:      () => isFile,
      isDirectory: () => isDir && !isFile,
    };
  }

  remove(path: string): void {
    const p = this.normalize(path);
    this.files.delete(p);
    this.dirs.delete(p);
  }

  ensureDir(path: string): void {
    this.mkdir(path);
  }
}