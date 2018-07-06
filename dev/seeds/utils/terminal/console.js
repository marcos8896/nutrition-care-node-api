/**
 * Contains all the helper function to print the custom texts. 
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 * @module Seeds/Utils/Terminal/Console 
 */

const clear = require('clear');
const chalk = require('chalk');
const figlet = require('figlet');
const emoji = require('node-emoji');

function printBanner() {

  clear();
  console.log(
    chalk.magentaBright(
      figlet.textSync(`LoopBack Seeder`)
    )
  );

  console.log(`     ${emoji.get('bird')}     `.repeat(7));

  console.log("\n\n");

}

function logMessage({ color = 'white', message, bold = false, error = false }) {

  if(error) {
    console.trace(bold ? chalk[color]['bold'](message) : chalk[color](message));
  } else {
    console.log(
      bold ? chalk[color]['bold'](message) : chalk[color](message)
    );
  }

}

function logProcess({ message, bold = false }) {
  logMessage({ color: 'cyanBright', message, bold })
}

module.exports = {
  printBanner,
  logMessage,
  logProcess,
}