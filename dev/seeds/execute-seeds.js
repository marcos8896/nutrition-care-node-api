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

const series = require('async').series;
const faker = require('faker/');
const args = require('yargs').argv;

const { 
  getModelsWithRequestedProperties,
  getSeedModelsWithRequestedProperties
 } = require('../../shared/models-utils.js');


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
      performSimpleSeed( Model, cb );

    else if(seedType === 'complexSeed')
      performComplexSeed( Model, cb );

   } catch(error) {
     return cb(error);
   }
    
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


function typeOfSeedToGenerate( relationsTypes ) {

  let type = 'simpleSeed';

  //Only 'hasMany' relations.
  if( relationsTypes.length === 0 )
    return 'simpleSeed'

  else if( relationsTypes.every( type => type === 'hasMany' ) )
    return 'simpleSeed';

  else if( relationsTypes.includes('belongsTo') )
    return 'complexSeed';

  else throw "HANDLE THIS CASE, PLEASE";
  

}


function performSimpleSeed( Model, cb ) {

  let fakeModel = { };
  const fakeModelsArray = [];
  for (let i = 0; i < numRecords; i++) {
    Model.properties_seeds.forEach( prop => 
      fakeModel[Object.keys(prop)[0]] = faker.fake(Object.values(prop)[0])
    )
    fakeModelsArray.push(fakeModel);
    fakeModel = { };
  }

  models[singleModel].create(fakeModelsArray)
    .then(_ => cb(null))
    .catch( err => cb(err))

}


async function performComplexSeed( Model, cb ) {
  
  try {

    const JSONmodels = await getModelsWithRequestedProperties([ 'name', 'relations', 'properties' ]);
    const JSONModel = JSONmodels.find( model => model.name === Model.name );
    const relations = Object.keys(JSONModel.relations).map( key => JSONModel.relations[key] );

    const mainLoopbackModel = models[Model.name];






    //HAS TO BE A METHOD - getfakeModelsArray(Model, numberOfRecords)
    const fakeModelsArray = [];

    let fakeModel = { };
    for (let i = 0; i < numRecords; i++) {
      Model.properties_seeds.forEach( prop => 
        fakeModel[Object.keys(prop)[0]] = faker.fake(Object.values(prop)[0])
      )
      fakeModelsArray.push(fakeModel);
      fakeModel = { };
    }
    
    



    const finishedPromises = [];
    // HAS TO BE A METHOD - 
    relations.forEach( relation => {

      if(relation.typy === 'hasMany') {
        //TODO: Make the proper relation also with the hasMany models.
      } 
      else if(relation.type === 'belongsTo') {

        //Get the related model.
        const relatedModel = models[relation.model];

        //Get related JSON model.
        const relatedJSONmodel = JSONmodels
          .find( json => json.name === relatedModel.name );

        //Go get the JSON model related to check the foreignKeys required to
        //insert a new record.
        const key = Object.keys(relatedJSONmodel.relations).find( relation => {
          return relatedJSONmodel.relations[relation].model === mainLoopbackModel.name;
        });

        const foreignKey = relatedJSONmodel.relations[key].foreignKey;





        //Get the related model properties.
        const relatedModelProperties = relatedJSONmodel.properties;

        const relatedModelPropKeys = Object.keys(relatedModelProperties);
        
        const randomProperty = getRandomElementFromArray(relatedModelPropKeys);

        const orderBy = Math.random() >= 0.5 ? 'ASC' : 'DESC';


          // Get 10 random object of the related model to be related with the
          // 'mainLoopbackModel' model.
          let auxPromise = relatedModel.find({ 
            limit: 10,
            order: `${randomProperty} ${orderBy}` 
          }).then( relatedModelResults => {

            if(relatedModelResults.length === 0) { //There aren't records.
              //TODO: Create new records then.
              return cb(`There are not ${relatedModel.name} existing records to make the relation insert`);
            } else {

              fakeModelsArray.forEach( fakeModel => {
                fakeModel[foreignKey] = getRandomElementFromArray(relatedModelResults).id;
              })

              return { done: true };

            }

          })
          .catch( err => cb(err))

          finishedPromises.push(auxPromise);
      }
      
    });

    await Promise.all(finishedPromises);
    await models[singleModel].create(fakeModelsArray);
    return cb(null);
    
  } catch(error) {
    return cb(error)
  }

}


function getRandomElementFromArray( array ) {
  return array[Math.floor(Math.random()*array.length)];
}


/**
 * Returns all the relations's types from a given model.
 * 
 * @async
 * @param {string} modelName - The name of the model from which the developer wants to get
 * its relations' types.
 * @param {callback} cb
 * @returns {Promise<string[]>} modelRelationsType - A promise which contains an array with
 * the relations' types.
 */
async function getRelationsTypeFromLoopbackModel( modelName, cb ) {

  try {
    const models = await getModelsWithRequestedProperties([ 'name', 'relations' ]);
    const model = models.find( model => model.name === modelName );
    const modelRelationsType = Object.keys(model.relations).map( key => model.relations[key].type );
    
    return modelRelationsType;
  }
  catch(error) {
    return cb(error);
  }

}


series([
  cb => getModelsSeedsFromSeedJSONModels(cb),
  cb => seedModel(cb)
], err => {
  if(err) throw err;
  else console.log("\nTodo bien, men.");
  process.exit(0);
});





function logComplex( complexObject, msg = "gg",  ) {
  console.log(msg, JSON.stringify(complexObject, null, ' '));
}