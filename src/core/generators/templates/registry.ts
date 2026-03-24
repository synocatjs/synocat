import type { IScaffoldTemplate } from './base.template';
import type { TemplateType } from '../../../types/';
import { MinimalTemplate }     from './minimal.template';
import { NodeServiceTemplate } from './service-node.template';
import { VueDesktopTemplate }  from './desktop-vue.template';
import { DockerTemplate }      from './compose-docker.template';

export const TEMPLATE_REGISTRY: Readonly<Record<TemplateType, IScaffoldTemplate>> = {
  'minimal':      new MinimalTemplate(),
  'node-service': new NodeServiceTemplate(),
  'vue-desktop':  new VueDesktopTemplate(),
  'docker':       new DockerTemplate(),
};