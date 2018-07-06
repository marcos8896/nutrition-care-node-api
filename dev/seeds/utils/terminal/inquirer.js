const inquirer = require('inquirer');

const mainManuChoices = [
  'Created missing seed files and updated the existing ones (Required the first time).',
  'Create fake data from a model.',
  'Exit.'
]

const mainManuChoicesObject = {
  prepareSeeds: mainManuChoices[0],
  executeSeeds: mainManuChoices[1],
  exit: mainManuChoices[2],

}

module.exports = {

  mainManuChoices,
  mainManuChoicesObject,

  askForSeedModel: (array) => {
    const questions = [
      {
        type: 'list',
        name: 'seedModel',
        message: 'Select one of the models that you want to created fake records from',
        choices: array,
        pageSize: 12
      }
    ];
    return inquirer.prompt(questions);
  },
  askNumberOfRecords: _ => {
    const questions = [
      {
        type: 'input',
        name: 'numberOfRecords',
        message: 'Enter the wanted number of fake records to be created.',
        default: 10,
        validate: input => {
          const numRecords = parseInt(input);
          return !(isNaN(numRecords) || numRecords <= 0)
        }
      }
    ];
    return inquirer.prompt(questions);
  },
  mainMenu: (array) => {
    const questions = [
      {
        type: 'list',
        name: 'selected',
        message: 'Select an option please: ',
        choices: mainManuChoices
      }
    ];
    return inquirer.prompt(questions);
  },



}