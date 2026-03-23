import type { IScaffoldTemplate } from './base.template';
import type { GeneratedFile, ScaffoldConfig } from '../../../types/';

export class VueDesktopTemplate implements IScaffoldTemplate {
  readonly type = 'vue-desktop';

  generate(cfg: ScaffoldConfig): GeneratedFile[] {
    const appName = cfg.dsmappname ?? `com.example.${cfg.package}`;
    const display  = cfg.displayname ?? cfg.package;

    return [
      { path: 'ui/config',       content: this.appConfig(appName, display) },
      { path: 'ui/src/main.js',  content: this.mainJs(appName) },
      { path: 'ui/package.json', content: JSON.stringify(this.uiPkgJson(cfg), null, 2) + '\n' },
    ];
  }

  getNextSteps(cfg: ScaffoldConfig): string[] {
    return [
      `Edit Vue components in ui/src/`,
      `Run: cd ui && npm install && npm run build`,
      `Place PACKAGE_ICON.PNG (64×64 px)`,
      `Run: synocat pack ${cfg.package}`,
    ];
  }

  private appConfig(appName: string, display: string): string {
    return JSON.stringify({
      [appName]: {
        type:               'app',
        title:              display,
        appWindow:          appName,
        allUsers:           false,
        allowMultiInstance: false,
        hidden:             false,
        icon:               'images/icon_{0}.png',
      },
    }, null, 2) + '\n';
  }

  private mainJs(appName: string): string {
    return [
      `import Vue from 'vue';`,
      `import App from './App.vue';`,
      ``,
      `SYNO.namespace('${appName}');`,
      ``,
      `${appName}.Instance = Vue.extend({`,
      `  components: { App },`,
      `  template: '<App/>',`,
      `});`,
      ``,
    ].join('\n');
  }

  private uiPkgJson(cfg: ScaffoldConfig): object {
    return {
      name:    cfg.package.toLowerCase() + '-ui',
      version: '1.0.0',
      scripts: {
        build: 'webpack --mode production',
        dev:   'webpack --watch --mode development',
      },
      devDependencies: {
        '@babel/core':           '7.18.6',
        'babel-loader':          '8.0.6',
        'vue':                   '2.7.14',
        'vue-loader':            '15.10.1',
        'vue-template-compiler': '2.7.14',
        'webpack':               '5.91.0',
        'webpack-cli':           '5.1.4',
      },
    };
  }
}