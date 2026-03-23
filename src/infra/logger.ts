import chalk from 'chalk';

// ─── Interface ────────────────────────────────────────────────────────────────

export interface ILogger {
  info(msg: string): void;
  success(msg: string): void;
  warn(msg: string): void;
  error(msg: string): void;
  dim(msg: string): void;
  blank(): void;
}

// ─── Console implementation ───────────────────────────────────────────────────

export class ConsoleLogger implements ILogger {
  info(msg: string):    void { console.log(chalk.blue(`ℹ  ${msg}`)); }
  success(msg: string): void { console.log(chalk.green(`✓  ${msg}`)); }
  warn(msg: string):    void { console.log(chalk.yellow(`⚠  ${msg}`)); }
  error(msg: string):   void { console.log(chalk.red(`✗  ${msg}`)); }
  dim(msg: string):     void { console.log(chalk.gray(msg)); }
  blank():              void { console.log(''); }
}

// ─── Silent (no-op) implementation for tests ─────────────────────────────────

export class SilentLogger implements ILogger {
  public readonly log: string[] = [];
  info(msg: string):    void { this.log.push(`INFO: ${msg}`); }
  success(msg: string): void { this.log.push(`OK:   ${msg}`); }
  warn(msg: string):    void { this.log.push(`WARN: ${msg}`); }
  error(msg: string):   void { this.log.push(`ERR:  ${msg}`); }
  dim(msg: string):     void { this.log.push(`DIM:  ${msg}`); }
  blank():              void { this.log.push(''); }
}