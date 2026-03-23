import path from 'node:path';
import chalk from 'chalk';
import ora from 'ora';

export interface ImageCommandOptions {
  sizes?:  string;
  output?: string;
}

export async function imageCommand(
  sourcePath?: string,
  opts: ImageCommandOptions = {},
): Promise<void> {
  const inputPath = sourcePath ?? 'assets/logo.svg';
  const sizes     = (opts.sizes ?? '16,32,64,128,256')
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n) && n > 0);
  const outputDir = opts.output ?? '.';

  const spinner = ora('Generating icons...').start();

  try {
    // Dynamic import keeps `sharp` optional — build succeeds even if not installed
    const { default: sharp } = await import('sharp');
    const { default: fsExtra } = await import('fs-extra');

    if (!await fsExtra.pathExists(inputPath)) {
      spinner.fail(chalk.red(`Source file not found: ${inputPath}`));
      return;
    }

    await fsExtra.ensureDir(outputDir);
    spinner.text = `Generating ${sizes.length} icons from ${inputPath}`;

    for (const size of sizes) {
      const outputPath = path.join(outputDir, `PACKAGE_ICON_${size}.PNG`);
      await sharp(inputPath).resize(size, size).png().toFile(outputPath);
      spinner.text = `Generated ${size}×${size} → ${outputPath}`;
    }

    // Also generate the required PACKAGE_ICON.PNG (64×64) if not already in list
    if (!sizes.includes(64)) {
      const defaultIcon = path.join(outputDir, 'PACKAGE_ICON.PNG');
      await sharp(inputPath).resize(64, 64).png().toFile(defaultIcon);
      spinner.text = `Generated 64×64 → PACKAGE_ICON.PNG`;
    } else {
      // Copy PACKAGE_ICON_64.PNG → PACKAGE_ICON.PNG
      const src64 = path.join(outputDir, 'PACKAGE_ICON_64.PNG');
      const dst   = path.join(outputDir, 'PACKAGE_ICON.PNG');
      if (await fsExtra.pathExists(src64)) await fsExtra.copy(src64, dst);
    }

    spinner.succeed(chalk.green(`✓ Generated ${sizes.length} icons in ${outputDir}`));

    console.log(chalk.gray('\nGenerated files:'));
    for (const size of sizes) {
      console.log(chalk.gray(`  ✓ ${size}×${size} → ${path.join(outputDir, `PACKAGE_ICON_${size}.PNG`)}`));
    }
    console.log('');

  } catch (err: unknown) {
    spinner.fail(chalk.red('Icon generation failed'));
    if (err instanceof Error && err.message.includes('Cannot find module')) {
      console.log(chalk.yellow('\n  sharp is not installed. Run: npm install sharp'));
    } else {
      console.error(err);
    }
    process.exitCode = 1;
  }
}