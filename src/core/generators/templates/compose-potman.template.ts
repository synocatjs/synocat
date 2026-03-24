import type { IScaffoldTemplate } from './base.template';
import type { GeneratedFile, ScaffoldConfig } from '../../../types/';

export class PodmanTemplate implements IScaffoldTemplate {
  readonly type = 'podman';

  generate(cfg: ScaffoldConfig): GeneratedFile[] {
    return [
      { path: 'podman/run.sh', content: this.runScript(cfg) },
      { path: 'podman/README.md', content: this.readme(cfg) },
    ];
  }

  getNextSteps(cfg: ScaffoldConfig): string[] {
    return [
      `Edit podman/run.sh to configure your container`,
      `Ensure Podman is installed on DSM`,
      `Run: chmod +x podman/run.sh && ./podman/run.sh start`,
      `Run: synocat pack ${cfg.package}`,
    ];
  }

  private runScript(cfg: ScaffoldConfig): string {
    const name = cfg.package.toLowerCase();
    const image =  'alpine:latest';
    const port = cfg.adminport ?? '8080';
    
    return `#!/bin/bash
# ${cfg.package} - Podman Container

NAME="${name}"
IMAGE="${image}"
PORT="${port}"
DATA_DIR="/volume1/docker/${name}"

case "\$1" in
    start)
        mkdir -p \${DATA_DIR}
        podman run -d \\
            --name \${NAME} \\
            -p \${PORT}:\${PORT} \\
            -v \${DATA_DIR}:/data \\
            --restart always \\
            \${IMAGE} \\
            tail -f /dev/null
        echo "Container started"
        ;;
    stop)
        podman stop \${NAME}
        podman rm \${NAME}
        echo "Container stopped"
        ;;
    restart)
        \$0 stop
        \$0 start
        ;;
    status)
        podman ps -a --filter name=\${NAME}
        ;;
    logs)
        podman logs \${NAME}
        ;;
    shell)
        podman exec -it \${NAME} /bin/sh
        ;;
    *)
        echo "Usage: \$0 {start|stop|restart|status|logs|shell}"
        exit 1
        ;;
esac`;
  }

  private readme(cfg: ScaffoldConfig): string {
    const name = cfg.package.toLowerCase();
    const port = cfg.adminport ?? '8080';
    
    return `# ${cfg.package}

${cfg.description || 'Podman container for DSM'}

## Usage

\`\`\`bash
chmod +x podman/run.sh

./run.sh start   # Start container
./run.sh stop    # Stop container
./run.sh status  # Check status
./run.sh logs    # View logs
./run.sh shell   # Enter container
\`\`\`

## Config

Edit \`run.sh\` to change:
- \`IMAGE\` - Container image
- \`PORT\` - Port mapping
- \`DATA_DIR\` - Data storage path

## Access

Web: http://your-nas:${port}`;
  }
}