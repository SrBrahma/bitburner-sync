import { Command, InvalidArgumentError } from '@commander-js/extra-typings';
import { start } from '..';

const myParseInt = (value: string) => {
  const parsedValue = parseInt(value, 10);

  if (isNaN(parsedValue)) throw new InvalidArgumentError('Not a number.');

  return parsedValue;
};

const program = new Command()
  .option('-p, --port <number>', 'the port to be used', myParseInt, 12525)
  .option('-s, --src <dir>', 'where the source .js files are located', 'dist')
  .option('-d, --dest <dir>', "where the files are stored in the game's home server", 'scripts')
  .parse();

const options = program.opts();

start({
  source: options.src,
  destination: options.dest,
  port: options.port,
});
