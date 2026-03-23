import type { IScaffoldTemplate } from './base.template';
import type { TemplateType } from '../../../types/';
import { MinimalTemplate }     from './minimal.template';
import { NodeServiceTemplate } from './node-service.template';
import { VueDesktopTemplate }  from './vue-desktop.template';
import { DockerTemplate }      from './docker.template';

export const TEMPLATE_REGISTRY: Readonly<Record<TemplateType, IScaffoldTemplate>> = {
  'minimal':      new MinimalTemplate(),
  'node-service': new NodeServiceTemplate(),
  'vue-desktop':  new VueDesktopTemplate(),
  'docker':       new DockerTemplate(),
};