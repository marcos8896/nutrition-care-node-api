const clear = require('clear');
const chalk = require('chalk');
const figlet = require('figlet');
const emoji = require('node-emoji');

// const clui         = require('clui');
// const Spinner     = clui.Spinner;

function printBanner() {

  clear();
  console.log(
    chalk.magentaBright(
      figlet.textSync(`LoopBack Seeder`)
    )
  );

  console.log(`     ${emoji.get('bird')}     `.repeat(7));

  console.log("\n\n");

  // const status = new Spinner(`Ajalas ... ${emoji.get('bird')}`);

  // status.start();

  // status.stop();

}

module.exports = {
  printBanner,
}