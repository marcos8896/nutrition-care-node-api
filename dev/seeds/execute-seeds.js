//Example to run seeds
// npm run execute:seeds Provider 10

const series = require('async').series;
const faker = require('faker/');
const arrayModels = [];
const models = require('../../server/server').models;

const args = require('yargs').argv;
const singleModel = args._[0];

//Restriction to generate 20 records or more for convinience on hardcored seed models.
const numRecords =  parseInt(args._[1]) >= 20 ? parseInt(args._[1]) : 20 ;

console.log("-------------MINIMUM AMOUNT OF RECORDS: 20-------------\n")


console.log("-------------INPUT-------------\n")
console.log(`Model: '${singleModel}'`);
console.log(`Number of records: ${numRecords}`);
console.log("\n-------------------------------")


function getModelsSeedsFromJSONs( cb ) {
  
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

function areAllpropertiesSeedsFilled( Model ) {
  const propertiesValues = Model.properties_seeds.map( property => Object.values(property)[0]);
  return propertiesValues.every( property => property );
}

series([
  cb => getModelsSeedsFromJSONs(cb),
  cb => seedModel(cb)
], err => {
  if(err) console.log(err);
  else console.log("\nTodo bien, men.");
  process.exit(0);
});
