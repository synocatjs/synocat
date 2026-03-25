import type { IScaffoldTemplate } from './base.template';
import type { TemplateType } from '../../../types/';
import { MinimalBasicTemplate }     from './minimal-basic.template';
import { MinimalDesktopTemplate }     from './minimal-desktop.template';
import { MinimalServerTemplate }     from './minimal-server.template';
import { NodeServiceTemplate } from './service-node.template';
import { VueDesktopTemplate }  from './desktop-vue.template';
import { DockerTemplate }      from './compose-docker.template';
import { PlaceholderTemplate } from './placeholder.template';
import { GoServiceTemplate } from './service-go.template';
import { PythonServiceTemplate } from './service-python.template';



export const TEMPLATE_REGISTRY: Readonly<Record<TemplateType, IScaffoldTemplate>> = {
  'minimal-basic': new MinimalBasicTemplate(),
  'minimal-desktop': new MinimalDesktopTemplate(),
  'minimal-service': new MinimalServerTemplate(),
  'background-go': new GoServiceTemplate(),
  'background-node': new NodeServiceTemplate(),
  'background-python': new PythonServiceTemplate(),
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