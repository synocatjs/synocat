import chalk from 'chalk';
import { INFO_FIELDS } from '../data/info-fields.data';
import { RESOURCE_WORKERS } from '../data/resource-workers.data';
import { SCRIPT_LIFECYCLE } from '../data/script-lifecycle.data';
import { ARCH_VALUES, ARCH_GROUPS } from '../data/arch-values.data';

export function infoCommand(field?: string): void {
  if (!field) {
    listAllFields();
    return;
  }

  switch (field) {
    case 'arch':
    case 'archs':       return showArchList();
    case 'resource':
    case 'workers':     return showResourceWorkers();
    case 'lifecycle':
    case 'scripts':     return showLifecycle();
    case 'privilege':   return showPrivilege();
  }

  const def = INFO_FIELDS[field];
  if (!def) {
    console.log(chalk.red(`\n  Field "${field}" not found\n`));
    const similar = Object.keys(INFO_FIELDS).filter(
      (k) => k.includes(field) || field.includes(k.slice(0, 4)),
    );
    if (similar.length) {
      console.log(chalk.gray('  Similar fields: ') + similar.map((k) => chalk.cyan(k)).join('  '));
    }
    console.log(chalk.gray('\n  Run "synocat info" to see all fields\n'));
    return;
  }

  console.log('');
  console.log(
    chalk.bold(`  ${chalk.cyan(field)}`) +
    (def.required ? chalk.red(' *required') : chalk.gray(' optional')),
  );
  console.log(chalk.gray(`  ${'─'.repeat(60)}`));
  console.log(`  ${chalk.bold('Description:')} ${def.description}`);
  if (def.note)        console.log(`  ${chalk.bold('Note:')}        ${chalk.yellow(def.note)}`);
  if (def.example)     console.log(`  ${chalk.bold('Example:')}     ${chalk.green(`${field}="${def.example}"`)}`);
  if (def.default !== undefined) console.log(`  ${chalk.bold('Default:')}     ${def.default}`);
  if (def.enum)        console.log(`  ${chalk.bold('Allowed:')}     ${def.enum.map((e) => chalk.green(`"${e}"`)).join(' | ')}`);
  if (def.deprecated)  console.log(`  ${chalk.bold('Status:')}      ${chalk.red('Deprecated')}${def.replacement ? ` → use ${chalk.cyan(def.replacement)}` : ''}`);
  if (def.dsm_min)     console.log(`  ${chalk.bold('Min DSM:')}     ${def.dsm_min}`);
  if (def.related)     console.log(`  ${chalk.bold('Related:')}     ${def.related.map((r) => chalk.cyan(r)).join('  ')}`);
  if (def.warn)        console.log(`  ${chalk.bold('Warning:')}     ${chalk.yellow(def.warn)}`);
  console.log('');
}

function listAllFields(): void {
  console.log('');
  console.log(chalk.bold('  INFO Fields') + chalk.red(' *') + chalk.gray(' = required\n'));

  const required   = Object.entries(INFO_FIELDS).filter(([, d]) => d.required);
  const optional   = Object.entries(INFO_FIELDS).filter(([, d]) => !d.required && !d.deprecated);
  const deprecated = Object.entries(INFO_FIELDS).filter(([, d]) => d.deprecated);

  console.log(chalk.bold.red('  Required fields'));
  required.forEach(([k, d]) =>
    console.log(`    ${chalk.red('*')} ${chalk.cyan(k.padEnd(30))} ${chalk.gray(d.label)}`),
  );

  console.log('');
  console.log(chalk.bold('  Optional fields'));
  optional.forEach(([k, d]) =>
    console.log(`      ${chalk.cyan(k.padEnd(30))} ${chalk.gray(d.label)}`),
  );

  if (deprecated.length) {
    console.log('');
    console.log(chalk.bold.gray('  Deprecated'));
    deprecated.forEach(([k, d]) =>
      console.log(`      ${chalk.gray(k.padEnd(30))} ${chalk.gray('→ ' + (d.replacement ?? 'removed'))}`),
    );
  }

  console.log('');
  console.log(chalk.gray('  Usage: synocat info <field>  e.g. synocat info adminport'));
  console.log(chalk.gray('  Topics: synocat info arch | resource | lifecycle | privilege'));
  console.log('');
}

function showArchList(): void {
  console.log('');
  console.log(chalk.bold('  Supported arch values (Appendix A)\n'));
  console.log(`  ${chalk.cyan('noarch'.padEnd(20))} All platforms (pure JS/Shell/PHP packages — recommended)`);
  console.log('');

  for (const [group, archs] of Object.entries(ARCH_GROUPS)) {
    console.log(chalk.bold(`  ${group}`));
    console.log(`    ${archs.map((a) => chalk.cyan(a)).join('  ')}`);
    console.log('');
  }

  console.log(chalk.gray(`  Total: ${ARCH_VALUES.length} values`));
  console.log(chalk.gray('  Tip: separate multiple archs with a space — arch="x86_64 armv8"\n'));
}

function showResourceWorkers(): void {
  console.log('');
  console.log(chalk.bold('  conf/resource — Worker types\n'));

  for (const [key, w] of Object.entries(RESOURCE_WORKERS)) {
    console.log(`  ${chalk.cyan(key.padEnd(24))} ${chalk.bold(w.label)}`);
    console.log(`  ${' '.repeat(24)} ${chalk.gray(w.description)}`);
    if (w.timing)   console.log(`  ${' '.repeat(24)} ${chalk.gray('Timing:   ' + w.timing)}`);
    if (w.provider) console.log(`  ${' '.repeat(24)} ${chalk.yellow('Requires: ' + w.provider)}`);
    if (w.note)     console.log(`  ${' '.repeat(24)} ${chalk.yellow('Note:     ' + w.note)}`);
    console.log('');
  }

  console.log(chalk.gray('  Usage: synocat add resource <type>  e.g. synocat add resource port\n'));
}

function showLifecycle(): void {
  console.log('');
  console.log(chalk.bold('  Script execution order\n'));

  for (const [phase, steps] of Object.entries(SCRIPT_LIFECYCLE)) {
    console.log(chalk.bold(`  ${phase}:`));
    steps.forEach((s, i) => {
      const isOptional = s.startsWith('(') || s.endsWith('?');
      const name       = s.replace(/[()？?]/g, '');
      console.log(
        `    ${i + 1}. ${isOptional ? chalk.gray(name + ' (optional)') : chalk.cyan(name)}`,
      );
    });
    console.log('');
  }
}

function showPrivilege(): void {
  console.log('');
  console.log(chalk.bold('  conf/privilege — Mandatory in DSM 7.0\n'));
  console.log('  All packages must run as an unprivileged user.');
  console.log('  DSM 7.0 removed support for run-as: system.\n');
  console.log(chalk.bold('  Minimal configuration:'));
  console.log(chalk.green([
    '  {',
    '    "defaults": {',
    '      "run-as": "package"',
    '    }',
    '  }',
  ].join('\n')));
  console.log('');
  console.log(chalk.gray('  Location: conf/privilege'));
  console.log(chalk.gray('  Without this file, the package cannot be installed on DSM 7.0\n'));
}