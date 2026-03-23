import { Updater } from '../infra/updater';

export async function updateCommand(version: string): Promise<void> {
  await new Updater(version, 'synocatjs/synocat').checkForUpdates();
}