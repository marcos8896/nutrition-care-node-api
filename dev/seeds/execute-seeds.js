/**
 * Creates fake data based on the seed JSON files that were created
 * by the {@link prepare-seeds.js} script.
 * When a user runs this script, the user has to enter the wanted Model to seed
 * and the number of wanted records.
 * This file uses the [faker.js]{@link https://github.com/marak/Faker.js/}
 * library to generate all the dummy data.
 * @module Seeds/Execute
 * @example npm run execute:seeds Provider 10
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 */

const inquirer = require('./utils/terminal/inquirer');
const terminal = require('./utils/terminal/console');
const mkdirp = require('mkdirp');
const fileExists = require('file-exists');

const prepareSeedFiles = require('./prepare-seeds');

 const {
  areAllpropertiesSeedsFilled,
  typeOfSeedToGenerate,
  getFakeModelsArray,
  getRandomElementFromArray,
  getRelationsTypeFromLoopbackModel,
 } = require('./utils/shared');

 const {
  performComplexSeed,
 } = require('./utils/complex-seed');

/**
 * This constant holds all the custom models that the Loopback instance has available.
 * @type {string}
 */
const models = require('../../server/server').models;

/**
 * This constant holds the path in which all the seed files are placed.
 * @type {string}
 */
const seedPath = './dev/seeds/seedModels/';

/**
 * This variable holds the model that the user has to introduce when running this script.
 * @type {string}
 */
let singleModel;


/**
 * This variable holds the value of the number of records that the user 
 * introduces on the terminal by running the script.
 * @todo Remove the previous restriction.
 * @type {number}
 */
let numRecords;


/**
 * The main array which several methods across the module will have access to.
 * @type {Object[]}
 */
const arrayModels = [];



/**
 * Checks if the current <code>seedPath</code> exists, if not, 
 * it creates that path if possible.
 * @returns {Promise} Returns a promise which contains an object with 
 * the <code>exists</code> property.
 */
function checkIfDirectoryExists() {
  return new Promise((resolve, reject) => {

    mkdirp(`${seedPath}`, (err) => {
      if (err) reject(err);
      resolve({ exists: true });
    });

  })
}

/**
 * Checks if the <code>seedPath</code> directory is empty or not.
 * 
 * @returns {Promise<Boolean>} Returns a promise which contains a boolean
 * notifying whether the folder is empty or not.
 */
function isTheFolderEmpty() {

  const emptyDir = require('empty-dir');
 
  return new Promise((resolve, reject) => {

    emptyDir(`${seedPath}`, (err, result) => {
      if (err) reject(err);
      else {
        resolve(result);
      }
    });

  })

}
/**
 * Runs the <code>checkIfDirectoryExists</code> function and after that
 * runs the <code>isTheFolderEmpty</code> function.
 * 
 * @returns {Promise<Boolean>} Returns a promise which contains a boolean
 * notifying whether there are seed files or not.
 * @returns
 */
function areThereSeedFilesModels() {
  return checkIfDirectoryExists().then(() => isTheFolderEmpty()).then( empty => !empty );
}


/**
 * Get all the Seed models and processes them to only get the 
 * model <code>name</code>, the model <code>filename</code> and the
 * model <code>properties</code> to push it inside the <code>arrayModels</code>
 * array.
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 * <code>prepare process</code> on the file.
 * @example
 * //Current shape of the <code>arrayModels</code> array.
 * arrayModels: [
 *    {
 *     "filename": "seed-administrator.json",
 *     "name": "Administrator",
 *     "properties_seeds": [
 *       {
 *         "name": "{{random.words(3)}}"
 *       }
 *       //More properties...
 *      ]
 *    }
 *   //More seed models...
 * ]
 */
function getModelsSeedsFromSeedJSONModels() {
  
  const readfiles = require('node-readfiles');

  return readfiles(`${seedPath}`, { filter: '*.json' }, (err, filename, contents) => {
    if (err) throw err;

    let json = {
      filename,
      name: JSON.parse(contents).name,
      properties_seeds: JSON.parse(contents).properties_seeds
    }
    
    arrayModels.push(json);
  })
    .then(files => arrayModels)
}



/**
 * Get all the Seed models from the <code>arrayModels</code> array, creates
 * a the proper number of instances based on the wanted number of records 
 * on the <code>numRecords</code> constant that holds the user input from the terminal.
 * At the end, this function grabs all the generate instances and it creates them on
 * the database.
 * @async
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 * @param {callback} cb - The next callback to keep the flow on all the
 * <code>prepare process</code> on the file.
 */
async function seedModel( cb ) {

    let Model = arrayModels.find( model => model.name == singleModel);
 
    // //Validate if the Model exists
    if( !!!Model ) return cb("Model not found.");
    
    // //Validate if numRecords is a valid number
    if( isNaN(numRecords) || numRecords <= 0 ) return cb("The number of records are not valid.");

    //Validate if all the properties_seeds are filled.
    if( !areAllpropertiesSeedsFilled(Model) ) 
      cb(`There are empty 'properties_seeds' on seedModel '${singleModel}'. \nFile: '${Model.filename}'`)
    

   try {

    const modelRelationsType = await getRelationsTypeFromLoopbackModel( singleModel, cb );
    const seedType = typeOfSeedToGenerate( modelRelationsType );

    if(seedType === 'simpleSeed')
      performSimpleSeed( Model, numRecords, cb );

    else if(seedType === 'complexSeed')
      performComplexSeed({  Model, numRecords, seedModels: arrayModels, cb });

   } catch(error) {
     return cb(error);
   }
    
}



/**
 * Creates a wanted number of records for the given model on the terminal.
 *
 * @param {*} Model - The current seed model from which the script is going
 * to generate fake data.
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 * @param {number} numberOfRecords - The wanted number of records to be created.
 * @param {callback} cb - Next callback on the stack.
 */
function performSimpleSeed( Model, numberOfRecords, cb ) {

  const fakeModelsArray = getFakeModelsArray( Model, numberOfRecords );

  models[singleModel].create(fakeModelsArray)
    .then(_ => cb(null))
    .catch( err => cb(err))

}



function boostrapFunction() {

  const handleError = (err) => {
    if(err) {
      terminal.logMessage({ color: 'redBright', bold: true ,message: err, error: true });
      terminal.logMessage({ 
        color: 'red', 
        bold: true, 
        message: '\n-----There previous error forced the Seed Process to be stopped.-----\n'
     });

    } else {
      terminal.logMessage({ 
        color: 'greenBright', bold: true,
        message: '\nThe Seed Process has finished successfully.\n'
      });
    }

    process.exit(0);

  }

  seedModel(handleError);

}


async function main() {

  try {

    terminal.printBanner();

    const { selected } = await inquirer.mainMenu();
    const options = inquirer.mainManuChoicesObject;

    switch (selected) {
      
      case options.prepareSeeds: {
        prepareSeedFiles();
        break;
      } 

      case options.executeSeeds: {

        const areThereFiles = await areThereSeedFilesModels();
        
        if(!areThereFiles) {
          throw `There are not seed files currently on the ${seedPath} path ` +
                `please, run the '${options.prepareSeeds}' option and try again...`
        }

        const models = await getModelsSeedsFromSeedJSONModels();

        const { seedModel } = await inquirer.askForSeedModel(arrayModels.map( model => model.name ));
        singleModel = seedModel;

        const { numberOfRecords } = await inquirer.askNumberOfRecords();
        numRecords = parseInt(numberOfRecords);

        boostrapFunction();
        break;
      }
      
      case options.exit: {
        terminal.logMessage({ color: 'greenBright', bold: true, message: '\nAjalas...\n' });
        process.exit(0);
        break;
      } 

    }

  } catch( error ) {
    terminal.logMessage({ color: 'redBright', bold: true ,message: error, error: true });
    process.exit(0);

  }

}
main();
