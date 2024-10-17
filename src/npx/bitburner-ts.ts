#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { Command, InvalidArgumentError } from '@commander-js/extra-typings';
import chokidar from 'chokidar';
import { execaCommand } from 'execa';
import { rimrafSync } from 'rimraf';
import { start } from '../index.js';

const myParseInt = (value: string) => {
  const parsedValue = parseInt(value, 10);

  if (isNaN(parsedValue)) throw new InvalidArgumentError('Not a number.');

  return parsedValue;
};

const program = new Command()
  .option('-p, --port <number>', 'the port to be used', myParseInt, 12525)
  .option('-d, --dest <dir>', "directory in the game's home server to put the files", 'scripts');

type TsConfig = { compilerOptions?: { rootDir?: string; outDir?: string } };

const tsWatcher = () => {
  program.parse();
  const options = program.opts();

  console.log("Reading project's tsconfig.json...");
  const tsconfigJson = fs.readFileSync('tsconfig.json', 'utf8');
  const tsconfig = JSON.parse(tsconfigJson) as TsConfig;

  const { rootDir, outDir } = tsconfig.compilerOptions ?? {};

  if (!rootDir) throw new Error('Missing rootDir in tsconfig.json');
  if (!outDir) throw new Error('Missing outDir in tsconfig.json');

  // Remove initial .js files in outDir
  console.log('Deleting previous outDir contents...');

  rimrafSync(outDir);

  start({
    sourceJs: outDir,
    destination: options.dest,
    port: options.port,
  });

  console.log('Setting up Typescript watcher...');

  // Remove .js files on outDir when .ts files are excluded
  chokidar.watch(`${rootDir}/**/*.ts`).on('unlink', (p: string) => {
    const relative = path.relative(rootDir, p).replace(/\.ts$/, '.js');
    const distFile = path.resolve(outDir, relative);

    if (fs.existsSync(distFile)) fs.unlinkSync(distFile);
  });

  const tscProcess = execaCommand('tsc -w --preserveWatchOutput', { stdio: 'inherit' });

  process.on('SIGINT', () => {
    tscProcess.kill();
    process.exit();
  });
};

tsWatcher();
