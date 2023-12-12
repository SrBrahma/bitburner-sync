<div align="center">

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![TypeScript](https://badgen.net/npm/types/env-var)](http://www.typescriptlang.org/)
[![npm](https://img.shields.io/npm/v/sync-bitburner)](https://www.npmjs.com/package/sync-bitburner)
[![npm](https://img.shields.io/npm/dw/sync-bitburner)](https://www.npmjs.com/package/sync-bitburner)

</div>

# bitburner-sync

Rework of [bitburner-filesync](https://github.com/bitburner-official/bitburner-filesync). The original didn't work when the game was running on Windows and the sync on WSL.

This also is a way cleaner and simpler implementation.

## Usage

```bash
npm i bitburner-sync
# or
npx bitburner-sync [options]
```

```
Options:
  -p, --port <number>  the port to be used (default: 12525)
  -s, --src <dir>      where the source .js files are located (default: "dist")
  -d, --dest <dir>     where the files are stored in the game's home server (default: "scripts")
  -h, --help           display help for command
```
