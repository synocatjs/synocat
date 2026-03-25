import type { InfoConfig } from './dsm.type';

// ─── Template types ───────────────────────────────────────────────────────────

export type TemplateType = 
| 'minimal-desktop'
| 'minimal-basic'
| 'minimal-service' 
| 'background-go' 
| 'background-node' 
| 'background-python' 
| 'cli-c_cpp' 
| 'cli-rust' 
| 'cli-shell' 
| 'container-docker'
| 'container-potman'
| 'desktop-html'
| 'desktop-iframe'
| 'desktop-php'
| 'desktop-vue'
| 'web-php'
| 'web-python'
| 'web-html';

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