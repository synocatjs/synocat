import type { IScaffoldTemplate } from './base.template';
import type { TemplateType } from '../../../types/';
import { MinimalTemplate }     from './minimal.template';
import { NodeServiceTemplate } from './service-node.template';
import { VueDesktopTemplate }  from './desktop-vue.template';
import { DockerTemplate }      from './compose-docker.template';
import { PlaceholderTemplate } from './placeholder.template';


export const TEMPLATE_REGISTRY: Readonly<Record<TemplateType, IScaffoldTemplate>> = {
  'minimal-app': new MinimalTemplate(),
  'minimal-service': new PlaceholderTemplate(),
  'background-go': new PlaceholderTemplate(),
  'background-node': new NodeServiceTemplate(),
  'background-python': new PlaceholderTemplate(),
  'cli-c_cpp': new PlaceholderTemplate(),
  'cli-rust': new PlaceholderTemplate(),
  'cli-shell': new PlaceholderTemplate(),
  'container-docker': new DockerTemplate(),
  'container-potman': new PlaceholderTemplate(),
  'desktop-html': new PlaceholderTemplate(),
  'desktop-iframe': new PlaceholderTemplate(),
  'desktop-php': new PlaceholderTemplate(),
  'desktop-vue': new VueDesktopTemplate(),
  'web-php': new PlaceholderTemplate(),
  'web-python': new PlaceholderTemplate(),
  'web-html': new PlaceholderTemplate(),
};