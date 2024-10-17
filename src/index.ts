import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import chokidar from 'chokidar';
import { globbySync } from 'globby';
import { parseMessage, sendMessage } from './message.js';
import { setupWebSocket } from './webSocket.js';

export const start = ({
  sourceJs,
  destination,
  port,
}: {
  sourceJs: string;
  /** Where are your files going to be located in the home server. */
  destination: string;
  port: number;
}) => {
  // Remove leading slash.
  destination = destination.replace(/^\//, '');

  const sourcePathAbsolute = path.resolve(sourceJs);

  const watcher = chokidar.watch(sourcePathAbsolute);

  const onConnection = async () => {
    console.log('Connection made!');

    console.log(`Getting definitions file...`);
    await sendMessage({ method: 'getDefinitionFile' }).then((data) =>
      writeFileSync('NetscriptDefinitions.d.ts', data.result),
    );

    console.log(`Erasing scripts dir...`);
    await eraseFilesInScriptDir(destination);

    console.log(`Pushing files from ${sourcePathAbsolute}...`);
    const initialFiles = globbySync('**/*.js', {
      cwd: sourcePathAbsolute,
    });

    const sendPushFileMessage = (absolutPath: string) =>
      sendMessage({
        method: 'pushFile',
        params: {
          server: 'home',
          filename: getFilename(destination, absolutPath, sourcePathAbsolute),
          content: readFileSync(absolutPath).toString(),
        },
      });

    initialFiles.forEach((file) => sendPushFileMessage(path.resolve(sourcePathAbsolute, file)));

    console.log('Watching folder', sourcePathAbsolute);
    watcher
      .on('add', sendPushFileMessage)
      .on('change', sendPushFileMessage)
      .on('unlink', (filePath: string) =>
        sendMessage({
          method: 'deleteFile',
          params: {
            server: 'home',
            filename: getFilename(destination, filePath, sourcePathAbsolute),
          },
        }),
      );
  };

  const wss = setupWebSocket({
    onConnection,
    port,
    onMessage: (msg) => parseMessage(msg),
  });

  console.log(`Server is ready, running on ${port}!`);

  process.on('SIGINT', () => {
    console.log('Shutting down!');
    void watcher.close();
    wss.close();
    process.exit();
  });
};

const eraseFilesInScriptDir = async (destination: string) => {
  const homeFiles = (
    await sendMessage({
      method: 'getFileNames',
      params: {
        server: 'home',
      },
    })
  ).result;

  const regexp = new RegExp(`${destination}/.+`);
  const filesToErase = homeFiles.filter((path) => regexp.test(path));

  await Promise.all(
    filesToErase.map((filename) =>
      sendMessage({
        method: 'deleteFile',
        params: {
          server: 'home',
          filename,
        },
      }),
    ),
  );
};

const getFilename = (
  destinationDirPath: string,
  relativeFilepath: string,
  absoluteDirPath: string,
) =>
  // Posix ('/') is the right one for BitBurner even on Windows.
  path.posix
    .join(destinationDirPath, path.relative(absoluteDirPath, relativeFilepath))
    .replaceAll('\\', '/');
