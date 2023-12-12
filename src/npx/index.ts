import { Command, InvalidArgumentError } from '@commander-js/extra-typings';
import { start } from '..';

const myParseInt = (value: string) => {
  const parsedValue = parseInt(value, 10);

  if (isNaN(parsedValue)) throw new InvalidArgumentError('Not a number.');

  return parsedValue;
};

const program = new Command()
  .option('-p, --port <number>', 'The port to be used', myParseInt, 12525)
  .option('-s, --src <dir>', 'Where the source .js files are located.', 'dist')
  .option('-d, --dest <dir>', 'Where the files will be stored in the home server', 'scripts')
  .parse();

const options = program.opts();

start({
  source: options.src,
  destination: options.dest,
  port: options.port,
});
