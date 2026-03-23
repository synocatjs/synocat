import type { InfoConfig } from './dsm.type';

// ─── Template types ───────────────────────────────────────────────────────────

export type TemplateType = 'minimal' | 'node-service' | 'vue-desktop' | 'docker';

export type ResourceShorthand =
  | 'port'
  | 'data-share'
  | 'mariadb'
  | 'docker'
  | 'port+share'
  | 'none';

// ─── Scaffold configuration ───────────────────────────────────────────────────

/** All answers collected by the `create` command wizard */
export interface ScaffoldConfig extends InfoConfig {
  templateType:  TemplateType;
  hasAdminUI:    boolean;
  hasResource:   boolean;
  resourceType?: ResourceShorthand;
  hasUI:         boolean;
  resourceOpts:  ResourceOptions;
}

export interface ResourceOptions {
  port?:      number;
  shareName?: string;
  package?:   string;
}

// ─── Generator output ─────────────────────────────────────────────────────────

/** A single file produced by a generator */
export interface GeneratedFile {
  /** Relative path from targetDir */
  path:        string;
  content:     string;
  executable?: boolean;
}