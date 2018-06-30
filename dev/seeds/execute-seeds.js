//Example to run seeds
// npm run execute:seeds Provider 10

/**
 * @file Creates fake data based on the seed JSON files that were created
 * by the {@link prepare-seeds.js} script.
 * When a user runs this script, the user has to enter the wanted Model to seed
 * and the number of wanted records.
 * This file uses the [faker.js]{@link https://github.com/marak/Faker.js/}
 * library to generate all the dummy data.
 * 
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 */

const series = require('async').series;
const faker = require('faker/');
const args = require('yargs').argv;

/**
 * This constant holds all the custom models that the Loopback instance has available.
 * @type {string}
 */
const models = require('../../server/server').models;

/**
 * This constant holds the model that the user has to introduce when running this script.
 * @type {string}
 */
const singleModel = args._[0];


/**
 * This constant holds the value of the number of records that the user 
 * introduces on the terminal by running the script.
 * (Restriction to generate 20 records or more for convinience on hardcored seed models).
 * @todo Remove the previous restriction.
 * @type {number}
 */
const numRecords =  parseInt(args._[1]) >= 20 ? parseInt(args._[1]) : 20 ;


/**
 * The main array which several methods across the module will have access to.
 * @type {Object[]}
 */
const arrayModels = [];

console.log("-------------MINIMUM AMOUNT OF RECORDS: 20-------------\n")


console.log("-------------INPUT-------------\n")
console.log(`Model: '${singleModel}'`);
console.log(`Number of records: ${numRecords}`);
console.log("\n-------------------------------")

/**
 * Get all the Seed models and processes them to only get the 
 * model <code>name</code>, the model <code>filename</code> and the
 * model <code>properties</code> to push it inside the <code>arrayModels</code>
 * array.
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 * @param {callback} cb - The next callback to keep the flow on all the 
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
function getModelsSeedsFromSeedJSONModels( cb ) {
  
  const readfiles = require('node-readfiles');

  readfiles('./dev/seeds/seedModels/', { filter: '*.json' }, (err, filename, contents) => {
    if (err) throw err;

    let json = {
      filename,
      name: JSON.parse(contents).name,
      properties_seeds: JSON.parse(contents).properties_seeds
    }
    
    arrayModels.push(json);
  })
    .then(files => cb(null))
    .catch(err => cb(err));
}

/**
 * Get all the Seed models from the <code>arrayModels</code> array, creates
 * a the proper number of instances based on the wanted number of records 
 * on the <code>numRecords</code> constant that holds the user input from the terminal.
 * At the end, this function grabs all the generate instances and it creates them on
 * the database.
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 * @param {callback} cb - The next callback to keep the flow on all the
 * <code>prepare process</code> on the file.
 */
function seedModel( cb ) {

    let Model = arrayModels.find( model => model.name == singleModel);
 
    // //Validate if the Model exists
    if( !!!Model ) return cb("Model not found.");
    
    // //Validate if numRecords is a valid number
    if( isNaN(numRecords) || numRecords <= 0 ) return cb("The number of records are not valid.");

    //Validate if all the properties_seeds are filled.
    if( !areAllpropertiesSeedsFilled(Model) ) 
      cb(`There are empty 'properties_seeds' on seedModel '${singleModel}'. \nFile: '${Model.filename}'`)
    
    
    let fakeModel = { }
    const fakeModelsArray = [];
    for (let i = 0; i < numRecords; i++) {
      Model.properties_seeds.forEach( prop => 
        fakeModel[Object.keys(prop)[0]] = faker.fake(Object.values(prop)[0])
      )
      fakeModelsArray.push(fakeModel);
      fakeModel = { };
    }

    models[singleModel].create(fakeModelsArray)
    .then( () => cb(null))
    .catch( err => cb(err))
  
}

/**
 * Validates if the current seed model has all its properties_seeds filled.
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 * @param {Object} Model - A given seed model object.
 * @param {callback} cb - The next callback to keep the flow on all the
 * <code>prepare process</code> on the file.
 */
function areAllpropertiesSeedsFilled( Model ) {
  const propertiesValues = Model.properties_seeds.map( property => Object.values(property)[0]);
  return propertiesValues.every( property => property );
}


series([
  cb => getModelsSeedsFromSeedJSONModels(cb),
  cb => seedModel(cb)
], err => {
  if(err) console.log(err);
  else console.log("\nTodo bien, men.");
  process.exit(0);
});
