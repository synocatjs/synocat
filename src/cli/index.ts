#!/usr/bin/env node
/**
 * synocat — Synology DSM 7 Package CLI
 */

import { readFileSync } from 'node:fs';
// import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import chalk from 'chalk';
import { buildProgram } from './program';
import { createCommand } from '../commands/create.command';
import { showHelp } from '../commands/help.command';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname  = dirname(__filename);

const packageJsonPath = join(__dirname, '../../package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

async function main(): Promise<void> {
  const [first, second] = process.argv.slice(2);

  // synocat v / version
  if (first === 'v' || first === 'version') {
    console.log(`synocat v${packageJson.version}`);
    return;
  }

  // synocat (no args) → interactive create
  if (!first) {
    await createCommand();
    return;
  }

  // synocat help / -h / --help (top-level, no sub-command)
  if ((first === 'h' || first === 'help' || first === '-h' || first === '--help') && !second) {
    showHelp(packageJson.version);
    return;
  }

  // Everything else goes through Commander
  await buildProgram(packageJson.version).parseAsync(process.argv);
}

main().catch((err: unknown) => {
  console.error(chalk.red('Fatal error:'), err);
  process.exit(1);
});