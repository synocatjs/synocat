import { ResourceShorthand, TemplateType } from "./scaffold.type";

export interface Answers {
  package: string;
  displayname: string;
  description: string;
  version: string;
  maintainer: string;
  maintainer_url?: string;
  arch: string;
  arch_custom?: string;
  os_min_ver: string;
  templateType: TemplateType;
  hasAdminUI?: boolean;
  adminport?: string;
  adminurl?: string;
  adminprotocol?: "http" | "https";
  hasResource?: boolean;
  resourceType?: ResourceShorthand;
  resourcePort?: string;
  dsmuidir?: string;
  dsmappname?: string;
}