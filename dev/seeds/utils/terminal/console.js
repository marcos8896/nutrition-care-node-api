/**
 * Contains all the helper function to print the custom texts. 
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 * @module Seeds/Utils/Terminal/Console 
 */

const clear = require('clear');
const chalk = require('chalk');
const figlet = require('figlet');
const emoji = require('node-emoji');

/**
 * Prints the banner for the script.
 */
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


/**
 * Logs a custom message with the given color, bold feature and message. It handles
 * also the error usecase.
 * 
 * @param {string} color The color to print.
 * @param {any} message The message to be printed.
 * @param {boolean} bold To check whether to use the bold feature or not.
 * @param {any} error To check whether to use the error usecase or not.
 */
function logMessage({ color = 'white', message, bold = false, error = false }) {

  if(error) {
    console.trace(bold ? chalk[color]['bold'](message) : chalk[color](message));
  } else {
    console.log(
      bold ? chalk[color]['bold'](message) : chalk[color](message)
    );
  }

}
/**
 * Logs a custom message meant to describe all the Seed Process.
 * @param {any} message The message to be printed.
 * @param {boolean} bold To check whether to use the bold feature or not.
 */
function logProcess({ message, bold = false }) {
  logMessage({ color: 'cyanBright', message, bold })
}

module.exports = {
  printBanner,
  logMessage,
  logProcess,
}