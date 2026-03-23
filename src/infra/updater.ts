import https from 'node:https';
import os from 'node:os';
import path from 'node:path';
import fsExtra from 'fs-extra';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';

interface GithubRelease {
    tag_name: string;
    body?: string;
    assets: Array<{ name: string; browser_download_url: string }>;
}

export class Updater {
    private readonly apiUrl: string;

    constructor(
        private readonly currentVersion: string,
        private readonly repo: string,
    ) {
        this.apiUrl = `https://api.github.com/repos/${this.repo}/releases/latest`;
    }

    async checkForUpdates(): Promise<void> {
        const spinner = ora('Checking for updates...').start();

        try {
            const release = await this.fetchLatestRelease();

            if (!release?.tag_name) {
                spinner.warn(chalk.yellow('No release information available'));
                return;
            }

            const latest = release.tag_name.replace(/^v/, '');

            if (this.isNewer(latest, this.currentVersion)) {
                spinner.stop();
                console.log(chalk.yellow(`\n✨ New version available: ${latest} (current: ${this.currentVersion})`));
                if (release.body) {
                    console.log(chalk.gray(release.body.slice(0, 200) + (release.body.length > 200 ? '...' : '')));
                }

                const { update } = await inquirer.prompt([{
                    type: 'confirm',
                    name: 'update',
                    message: 'Update now?',
                    default: true,
                }]);

                if (update) await this.downloadAndInstall(release);
            } else {
                spinner.succeed(chalk.green(`You are on the latest version: ${this.currentVersion}`));
            }
        } catch (err: unknown) {
            spinner.fail(chalk.red('Failed to check for updates'));
            console.error(chalk.gray(err instanceof Error ? err.message : String(err)));
        }
    }

    // ── Private ──────────────────────────────────────────────────────────────

    private async fetchLatestRelease(): Promise<GithubRelease> {
        return new Promise((resolve, reject) => {
            const req = https.get(
                this.apiUrl,
                { headers: { 'User-Agent': 'synocat-updater' }, timeout: 10_000 },
                (res) => {
                    let data = '';
                    res.on('data', (chunk: string) => { data += chunk; });
                    res.on('end', () => {
                        if (res.statusCode === 404) { reject(new Error('No releases found (404)')); return; }
                        if (res.statusCode !== 200) { reject(new Error(`HTTP ${res.statusCode}`)); return; }
                        try { resolve(JSON.parse(data) as GithubRelease); }
                        catch (e) { reject(e); }
                    });
                },
            );
            req.on('error', reject);
            req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
        });
    }

    private isNewer(latest: string, current: string): boolean {
        const parse = (v: string): number[] => v.split('.').map(Number);
        const lp = parse(latest);
        const cp = parse(current);
        for (let i = 0; i < Math.max(lp.length, cp.length); i++) {
            const l = lp[i] ?? 0;
            const c = cp[i] ?? 0;
            if (l > c) return true;
            if (l < c) return false;
        }
        return false;
    }

    private assetName(): string {
        const platform = {
            darwin: 'macos',
            linux: 'linux',
            win32: 'win',
            aix: 'linux',
            android: 'linux',
            cygwin: 'win',
            freebsd: 'linux',
            haiku: 'linux',
            netbsd: 'linux',
            openbsd: 'linux',
            sunos: 'linux'
        }[os.platform()] ?? os.platform();

        const arch = {
            x64: 'x64',
            arm64: 'arm64',
            arm: 'armv7',
            ia32: 'ia32',
            loong64: 'loong64',
            mips: 'mips',
            mipsel: 'mipsel',
            ppc64: 'ppc64',
            riscv64: 'riscv64',
            s390x: 's390x'
        }[os.arch()] ?? os.arch();

        return os.platform() === 'win32'
            ? `synocat-${platform}-${arch}.exe`
            : `synocat-${platform}-${arch}`;
    }

    private async downloadAndInstall(release: GithubRelease): Promise<void> {
        const spinner = ora('Downloading update...').start();
        try {
            const name = this.assetName();
            const asset = release.assets.find((a) => a.name === name);
            if (!asset) {
                spinner.fail(chalk.red(`No binary found for this platform (expected: ${name})`));
                return;
            }

            const tmpPath = path.join(os.tmpdir(), name);
            await this.downloadFile(asset.browser_download_url, tmpPath);

            spinner.text = 'Installing...';
            const currentPath = process.argv[1] ?? '';
            const isDev = currentPath.includes('src/') || currentPath.includes('node_modules');

            if (isDev) {
                spinner.warn(chalk.yellow('Dev mode — skipping binary replacement'));
                await fsExtra.remove(tmpPath);
                return;
            }

            await fsExtra.copy(currentPath, `${currentPath}.backup`);
            await fsExtra.copy(tmpPath, currentPath);
            await fsExtra.chmod(currentPath, 0o755);
            await fsExtra.remove(tmpPath);

            spinner.succeed(chalk.green('Updated successfully — please restart synocat'));
        } catch (err: unknown) {
            spinner.fail(chalk.red('Update failed'));
            console.error(chalk.gray(err instanceof Error ? err.message : String(err)));
        }
    }

    private downloadFile(url: string, dest: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const file = fsExtra.createWriteStream(dest);
            const req = https.get(url, (res) => {
                if (res.statusCode !== 200) { reject(new Error(`Download failed: ${res.statusCode}`)); return; }
                res.pipe(file);
                file.on('finish', () => { file.close(); resolve(); });
                file.on('error', reject);
            });
            req.on('error', reject);
            req.setTimeout(30_000, () => { req.destroy(); reject(new Error('Timeout')); });
        });
    }
}