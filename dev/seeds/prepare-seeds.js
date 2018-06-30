const asyncSeries = require('async').series;
const fileExists = require('file-exists');
const mkdirp = require('mkdirp');
const readfiles = require('node-readfiles');
const seedsDirectory = '/dev/seeds/seedModels/';

let arrayModels = [];


asyncSeries([
  cb => getModelsContentFromJSONs(cb),
  cb => prepareSeedsModels(cb),
  cb => checkIfDirectoryExists(cb),
  cb => checkJSONSeedsAvailability(cb),
  cb => keepPropetiesFromJSONSeedModelsUpToDate(cb),
  cb => writeRemainingJSONFiles(cb),
], (err, results) => {
  if(err) console.log('Error on asyncSeries - prepare-seeds.js: ', err);
  else console.log("\nTodo bien, men.");
  
});



function getModelsContentFromJSONs(cb) {

  readfiles('./common/models/', { filter: '*.json' }, (err, filename, contents) => {
    if (err) throw err;

    let json = {
      filename,
      name: JSON.parse(contents).name,
      properties_seeds: Object.keys(JSON.parse(contents).properties)
    }

    arrayModels.push(json);
  })
  .then(files => cb(null))
  .catch(err => {
    console.log('Error reading files:', err.message);
    cb(err);
  });

}


function prepareSeedsModels(cb) {
  arrayModels.forEach(model =>
    model.properties_seeds = model.properties_seeds.map(prop =>
      prop = { [prop]: "" }
    )
  );
  cb(null);
}


function checkIfDirectoryExists( cb ) {
  mkdirp(`.${seedsDirectory}`, (err) => {
    if (err) cb( err );
    cb( null );
  });
}


function checkJSONSeedsAvailability(cb) {

  let promises = [];
  arrayModels.forEach(model => {
    promises.push(
      fileExists(`.${seedsDirectory}seed-${model.filename}`).then(exists => {
        model.hasToBeModifiedOrAdded = !exists;
        // console.log(exists); // OUTPUTS: true or false
      })
    )
  })

  Promise.all(promises).then(() => cb(null));
}


function keepPropetiesFromJSONSeedModelsUpToDate( cb ) {

  readfiles(`.${seedsDirectory}`, { filter: '*.json' }, (err, filename, jsonString) => {

    //Parsed to an object the previous JSON seed file.
    const seedObject = JSON.parse(jsonString);

    //Get current object seed from array to check if they have the same properties.
    const objectFromArrayModelsIndex = arrayModels.findIndex( model => {
      return seedObject.name === model.name
    });

    const objectFromArrayModels = arrayModels[objectFromArrayModelsIndex];
    
    //Get every property of the previous seed object on a new array.
    const currentSeedProperties = seedObject.properties_seeds.map( prop => {
      return Object.keys(prop)[0];
    });

    //Get every property of the current seed object on a new array.
    const currentModelProperties = objectFromArrayModels.properties_seeds.map( prop => {
      return Object.keys(prop)[0];
    });

    
    (function addNewPropertiesToTheSeedJSONModels() {
      
      //Get an array of all the properties that have to be added to the seed model.
      const newPropertiesToWrite = currentModelProperties.filter(val => {
        return !currentSeedProperties.includes(val);
      });
      
      
      if(newPropertiesToWrite.length > 0) {
        
        //Get current model from main array.
        let current = arrayModels[objectFromArrayModelsIndex];

        //Create an object to be added to the curretn properties_seeds on the seed model.
        let newPropertiesObject = newPropertiesToWrite.map( prop => { 
          return {[prop] : ""} 
        });
        
        //Added all new properties to the current JSON model that will be re-write.
        current.properties_seeds = [ ...newPropertiesObject, ...seedObject.properties_seeds ];
        current.hasToBeModifiedOrAdded = true;
      }

    })();


    (function deleteLeftoverPropertiesFromSeedJSONModels() {
      //Get an array of all the properties that have to be deleted from the seed model.
      const leftoverPropertiesToDelete = currentSeedProperties.filter(val => {
        return !currentModelProperties.includes(val);
      });


      if(leftoverPropertiesToDelete.length > 0) {

        //Get current model from main array.
        let current = arrayModels[objectFromArrayModelsIndex];

        leftoverPropertiesToDelete.forEach( prop => {
          let indexToDelete;

          seedObject.properties_seeds.forEach((currentPropObject, i) => {
            
            if(Object.keys(currentPropObject)[0] === prop)
              indexToDelete = i;
          
            });

          //Delete the property fro the property seed array of the current seed model.
          seedObject.properties_seeds.splice(indexToDelete, 1);

          indexToDelete = null;

        })
        
        current.properties_seeds = [ ...seedObject.properties_seeds ];
        current.hasToBeModifiedOrAdded = true;
        
      }
    })();
    

  })
  .then(files => cb(null))
  .catch(err => {
    console.log('Error reading files:', err.message);
    cb(err);
  });

}


function writeRemainingJSONFiles(cb) {
  let each = require('async').each;
  const remainingJSONs = arrayModels.filter(model => model.hasToBeModifiedOrAdded);

  //Removed hasToBeModifiedOrAdded property to not write it on the JSON Seed files.
  remainingJSONs.forEach(json => delete json.hasToBeModifiedOrAdded);

  const jsonfile = require('jsonfile')

  each(remainingJSONs, (json, eachCallback) => {
    
    let file = `.${seedsDirectory}seed-${json.filename}`
    let obj = json

    jsonfile.writeFile(file, obj, { spaces: 2 }, function (err) {
      if (err) eachCallback(err);
      eachCallback();
    })

  }, err => {
    if (err) cb(err);
    else cb(null);

  })
}
