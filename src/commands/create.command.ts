import path from "node:path";
import chalk from "chalk";
import inquirer from "inquirer";
import ora from "ora";
import { NodeFileSystem } from "../infra/fs";
import { ScaffoldService } from "../services/scaffold.service";
import { ValidatorService } from "../services/validator.service";
import type {
  ScaffoldConfig,
  TemplateType,
  ResourceShorthand,
} from "../types/";

type templateItemProp = {
  name: string;
  short: string;
  value: TemplateType;
};
const TEMPLATE_CHOICES: templateItemProp[] = [
  // 基础模板
  {
    name: `${chalk.bold("minimal-app")}      — Pure shell package (DSM Desktop UI) `,
    short: "ma",
    value: "minimal-app",
  },
  {
    name: `${chalk.bold("minimal-service")} — Minimal server app (supports all platforms)`,
    short: "ms",
    value: "minimal-service",
  },

  // 桌面 UI 模板
  {
    name: `${chalk.bold("desktop-vue")}  — Vue.js desktop app (DSM Desktop UI)`,
    short: "dv",
    value: "desktop-vue",
  },
  {
    name: `${chalk.bold("desktop-php")}  — PHP web interface (DSM Web Station)`,
    short: "dp",
    value: "desktop-php",
  },
  {
    name: `${chalk.bold("desktop-html")} — Static HTML/CSS/JS interface`,
    short: "dh",
    value: "desktop-html",
  },
  {
    name: `${chalk.bold("desktop-iframe")} — Embedded iframe viewer`,
    short: "di",
    value: "desktop-iframe",
  },

  // 容器模板
  {
    name: `${chalk.bold("container-docker")} — Docker Compose package (requires ContainerManager)`,
    short: "cd",
    value: "container-docker",
  },
  {
    name: `${chalk.bold("container-podman")}        — Podman container (rootless, lightweight)`,
    short: "cp",
    value: "container-potman",
  },

  // CLI 工具模板
  {
    name: `${chalk.bold("cli-c_cpp")}         — C/Cpp language CLI tool`,
    short: "cc",
    value: "cli-c_cpp",
  },
  {
    name: `${chalk.bold("cli-rust")}       — rust language CLI tool`,
    short: "cr",
    value: "cli-rust",
  },
  {
    name: `${chalk.bold("cli-shell")}      — shell script CLI tool`,
    short: "cs",
    value: "cli-shell",
  },
  // 后台服务模板
  {
    name: `${chalk.bold("background-go")}    — Go HTTP backend service`,
    short: "bg",
    value: "background-go",
  },
  {
    name: `${chalk.bold("background-python")} — Python HTTP backend service`,
    short: "bp",
    value: "background-python",
  },
  {
    name: `${chalk.bold("background-node")}  — Node.js backend service (with start/stop)`,
    short: "bn",
    value: "background-node",
  },
  // web 模板
  {
    name: `${chalk.bold("web-php")}       — PHP web interface (DSM Web Station)`,
    short: "wp",
    value: "web-php",
  },
  {
    name: `${chalk.bold("web-html")}      — Static HTML/CSS/JS interface`,
    short: "wh",
    value: "web-html",
  },
  {
    name: `${chalk.bold("web-python")}    - Python web interface`,
    short: "wp",
    value: "web-python",
  },
];

interface Answers {
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

export async function createCommand(
  name?: string,
  templateOverride?: TemplateType,
): Promise<void> {
  console.log("");
  console.log(chalk.bold.cyan("  🐈  synocat"));
  console.log(chalk.gray("  Synology DSM 7.2.2 Package Scaffold Generator\n"));

  // 分步询问，避免类型复杂
  const answers: Answers = {} as Answers;

  // Package ID
  const { package: pkg } = await inquirer.prompt([
    {
      type: "input",
      name: "package",
      message: `Package ID ${chalk.gray("(used for /var/packages/[ID], no : / > < | =)")}`,
      default: name,
      validate: (v: string) => {
        if (!v.trim()) return "Package ID cannot be empty";
        if (/[:/><=|]/.test(v)) return "Cannot contain: : / > < | =";
        return true;
      },
    },
  ]);
  answers.package = pkg;

  // Display name
  const { displayname } = await inquirer.prompt([
    {
      type: "input",
      name: "displayname",
      message: `Display name ${chalk.gray("(shown in Package Center)")}`,
      default: answers.package,
    },
  ]);
  answers.displayname = displayname;

  // Description
  const { description } = await inquirer.prompt([
    {
      type: "input",
      name: "description",
      message: "Package description",
      validate: (v: string) =>
        v.trim() ? true : "Description cannot be empty",
    },
  ]);
  answers.description = description;

  // Version
  const { version } = await inquirer.prompt([
    {
      type: "input",
      name: "version",
      message: `Version ${chalk.gray("(format: major.minor.patch-build)")}`,
      default: "1.0.0-0001",
      validate: (v: string) =>
        /^[\d._-]+$/.test(v)
          ? true
          : "Only digits, dots, underscores, hyphens allowed",
    },
  ]);
  answers.version = version;

  // Maintainer
  const { maintainer } = await inquirer.prompt([
    {
      type: "input",
      name: "maintainer",
      message: "Maintainer / developer name",
      validate: (v: string) => (v.trim() ? true : "Maintainer cannot be empty"),
    },
  ]);
  answers.maintainer = maintainer;

  // Maintainer URL
  const { maintainer_url } = await inquirer.prompt([
    {
      type: "input",
      name: "maintainer_url",
      message: `Developer webpage ${chalk.gray("(optional)")}`,
    },
  ]);
  answers.maintainer_url = maintainer_url;

  // Architecture
  const { arch, arch_custom } = await inquirer.prompt([
    {
      type: "list",
      name: "arch",
      message: "Target CPU architecture",
      choices: [
        {
          name: `noarch    — All platforms ${chalk.gray("(pure JS/Shell/PHP packages)")}`,
          value: "noarch",
        },
        {
          name: `x86_64   — Modern Intel/AMD NAS ${chalk.gray("(DS9xx+, RS series)")}`,
          value: "x86_64",
        },
        {
          name: `armv8    — ARM 64-bit NAS ${chalk.gray("(DS2xx, DS4xx)")}`,
          value: "armv8",
        },
        { name: "Custom (space-separated multi-arch)", value: "__custom__" },
      ],
      default: "noarch",
    },
    {
      type: "input",
      name: "arch_custom",
      message: "Enter architectures (space-separated, e.g.: x86_64 armv8)",
      when: (a: any) => a.arch === "__custom__",
    },
  ]);
  answers.arch = arch === "__custom__" ? arch_custom : arch;
  answers.arch_custom = arch_custom;

  // Minimum DSM version
  const { os_min_ver } = await inquirer.prompt([
    {
      type: "input",
      name: "os_min_ver",
      message: `Min DSM version ${chalk.gray("(>= 7.0-40000 for DSM 7)")}`,
      default: "7.0-40000",
      validate: (v: string) =>
        /^\d+\.\d+-\d+$/.test(v)
          ? true
          : "Format must be X.Y-Z (e.g. 7.0-40000)",
    },
  ]);
  answers.os_min_ver = os_min_ver;

  // Template
  const { templateType } = await inquirer.prompt([
    {
      type: "list",
      name: "templateType",
      message: "Package template",
      choices: TEMPLATE_CHOICES,
      default: templateOverride ?? "minimal",
    },
  ]);
  answers.templateType = templateType;

  // Admin UI (只在非 vue-desktop 时询问)
  if (
    answers.templateType !== "desktop-vue" &&
    answers.templateType !== "desktop-php" &&
    answers.templateType !== "desktop-html"
  ) {
    const { hasAdminUI } = await inquirer.prompt([
      {
        type: "confirm",
        name: "hasAdminUI",
        message: `Include a web admin UI? ${chalk.gray("(sets adminport/adminurl)")}`,
        default: false,
      },
    ]);
    answers.hasAdminUI = hasAdminUI;

    if (answers.hasAdminUI) {
      const { adminport, adminurl, adminprotocol } = await inquirer.prompt([
        {
          type: "input",
          name: "adminport",
          message: "Admin UI port",
          default: "8080",
          validate: (v: string) => {
            const p = parseInt(v, 10);
            return !isNaN(p) && p >= 1 && p <= 65535
              ? true
              : "Port must be 1–65535";
          },
        },
        {
          type: "input",
          name: "adminurl",
          message: `Admin UI URL path ${chalk.gray("(e.g. / or /admin)")}`,
          default: "/",
        },
        {
          type: "list",
          name: "adminprotocol",
          message: "Admin UI protocol",
          choices: ["http", "https"],
          default: "http",
        },
      ]);
      answers.adminport = adminport;
      answers.adminurl = adminurl;
      answers.adminprotocol = adminprotocol;
    }
  }

  // Resource
  const { hasResource } = await inquirer.prompt([
    {
      type: "confirm",
      name: "hasResource",
      message: `Need system resources? ${chalk.gray("(ports, shared folders, database, Docker)")}`,
      default: false,
    },
  ]);
  answers.hasResource = hasResource;

  if (answers.hasResource) {
    const { resourceType, resourcePort } = await inquirer.prompt([
      {
        type: "list",
        name: "resourceType",
        message: "Resource type",
        choices: [
          { name: "port        — Firewall port registration", value: "port" },
          { name: "data-share  — Shared folder access", value: "data-share" },
          { name: "mariadb     — MariaDB 10 database", value: "mariadb" },
          { name: "docker      — Docker Compose project", value: "docker" },
          { name: "port+share  — Port + shared folder", value: "port+share" },
        ],
      },
      {
        type: "input",
        name: "resourcePort",
        message: "Port number to register",
        default: answers.adminport ?? "8080",
        when: (a: any) =>
          a.resourceType === "port" || a.resourceType === "port+share",
      },
    ]);
    answers.resourceType = resourceType;
    answers.resourcePort = resourcePort;
  }

  // Vue template DSM desktop defaults
  if (answers.templateType === "desktop-vue") {
    answers.dsmuidir = "ui";
    answers.dsmappname = `com.example.${answers.package}`;
    answers.hasAdminUI = false;
    answers.adminport = "0";
  }

  const targetDir = path.resolve(process.cwd(), answers.package);
  const fs = new NodeFileSystem();

  // Overwrite check
  if (fs.exists(targetDir)) {
    const { overwrite } = await inquirer.prompt([
      {
        type: "confirm",
        name: "overwrite",
        message: chalk.yellow(
          `Directory "${answers.package}/" already exists. Overwrite?`,
        ),
        default: false,
      },
    ]);
    if (!overwrite) {
      console.log(chalk.gray("\nCancelled.\n"));
      return;
    }
  }

  const spinner = ora("Generating scaffold...").start();

  try {
    const cfg: ScaffoldConfig = {
      package: answers.package,
      version: answers.version,
      os_min_ver: answers.os_min_ver,
      description: answers.description,
      arch: answers.arch,
      maintainer: answers.maintainer,
      displayname: answers.displayname,
      maintainer_url: answers.maintainer_url || undefined,
      adminport: answers.adminport,
      adminurl: answers.adminurl,
      adminprotocol: answers.adminprotocol,
      dsmuidir: answers.dsmuidir,
      dsmappname: answers.dsmappname,
      templateType: answers.templateType,
      hasAdminUI: Boolean(answers.hasAdminUI),
      hasResource: Boolean(answers.hasResource),
      resourceType: answers.resourceType,
      hasUI: answers.templateType === "desktop-vue",
      resourceOpts: {
        port: answers.resourcePort
          ? parseInt(answers.resourcePort, 10)
          : undefined,
        package: answers.package,
      },
    };

    const service = new ScaffoldService(fs);
    const files = service.generate(targetDir, cfg);

    spinner.succeed(chalk.green("✓ Scaffold generated successfully"));

    // File list
    console.log("");
    console.log(chalk.bold("Generated files:"));
    for (const f of files) {
      console.log(`  ${chalk.green("✓")} ${chalk.gray(cfg.package + "/")}${f}`);
    }

    // Quick validation
    console.log("");
    const validator = new ValidatorService(fs);
    const result = validator.validate(targetDir);
    if (result.warnings.length > 0) {
      console.log(
        chalk.yellow("⚠  Warnings (recommended to fix before publishing):"),
      );
      result.warnings.forEach((w: string) =>
        console.log(chalk.yellow(`   ${w}`)),
      );
      console.log("");
    }

    // Next steps
    console.log(chalk.bold.green("🎉 Done! Next steps:\n"));
    console.log(`  ${chalk.cyan(`cd ${cfg.package}`)}`);
    console.log("");
    service.getNextSteps(cfg).forEach((s, i) => {
      console.log(`  ${chalk.gray(`${i + 1}.`)} ${s}`);
    });
    console.log("");
    console.log(
      `  ${chalk.gray("Validate:  ")} ${chalk.cyan("synocat validate .")}`,
    );
    console.log(
      `  ${chalk.gray("Field docs:")} ${chalk.cyan("synocat info <field>")}`,
    );
    console.log("");
  } catch (err) {
    spinner.fail(chalk.red("Scaffold generation failed"));
    console.error(err);
    process.exitCode = 1;
  }
}
