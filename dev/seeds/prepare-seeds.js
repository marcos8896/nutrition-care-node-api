const asyncSeries = require('async').series;
const fileExists = require('file-exists');
const mkdirp = require('mkdirp');
const seedsDirectory = '/dev/seeds/seedModels/'
let arrayModels = [];


function getModelsContentFromJSONs(cb) {
  const readfiles = require('node-readfiles');

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

function checkJSONSeedsAvailability(cb) {

  let promises = [];
  arrayModels.forEach(model => {
    promises.push(
      fileExists(`.${seedsDirectory}seed-${model.filename}`).then(exists => {
        model.fileExists = exists;
        // console.log(exists); // OUTPUTS: true or false
      })
    )
  })



  Promise.all(promises).then(() => cb(null));
}

function writeRemainingJSONFiles(cb) {
  let each = require('async').each;
  const remainingJSONs = arrayModels.filter(model => !model.fileExists);

  //Removed fileExists property to not write it on the JSON Seed files.
  remainingJSONs.forEach(json => delete json.fileExists);

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

function checkIfDirectoryExists( cb ) {
  mkdirp(`.${seedsDirectory}`, (err) => {
    if (err) cb( err );
    cb( null );
  });
}

asyncSeries([
  cb => getModelsContentFromJSONs(cb),
  cb => prepareSeedsModels(cb),
  cb => checkIfDirectoryExists(cb),
  cb => checkJSONSeedsAvailability(cb),
  cb => writeRemainingJSONFiles(cb)
], (err, results) => {
  if(err) console.log('Error on asyncSeries - prepare-seeds.js: ', err);
  else console.log("\nTodo bien, men.");
  
});
