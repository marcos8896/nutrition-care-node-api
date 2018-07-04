/** @module Seeds/Execute/ComplexSeed */

const models = require('../../../server/server').models;

const { 
  getModelsWithRequestedProperties,
 } = require('../../../shared/models-utils.js');

 const {
  areAllpropertiesSeedsFilled,
  typeOfSeedToGenerate,
  getFakeModelsArray,
  getRandomElementFromArray,
  getRelationsTypeFromLoopbackModel,
 } = require('./shared');

/**
 * Validates if the current seed model has all its properties_seeds filled.
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 * @param {Object} Model - A given seed model object.
 * @param {Object} models - All the models that the Loopback instance provides.
 * @param {callback} cb - The next callback to keep the flow on all the
 * <code>prepare process</code> on the file.
 * @async
 */
async function performComplexSeed({  Model, numRecords, seedModels, cb }) {
  
  try {
    
    const JSONmodels = await getModelsWithRequestedProperties([ 'name', 'relations', 'properties' ]);
    const JSONModel = JSONmodels.find( model => model.name === Model.name );
    const relations = Object.keys(JSONModel.relations).map( key => {
      return {
        ...JSONModel.relations[key],
        relationName: key
      }
    });
    const mainLoopbackModel = models[Model.name];
    const fakeModelsArray = getFakeModelsArray( Model, numRecords );
    
    
    await checkModelRelations({ 
      JSONmodels, relations, mainLoopbackModel, fakeModelsArray, seedModels 
    });
    
    await insert({ 
      models, Model, fakeModelsArray, relations 
    });

    return cb(null);
    
  } catch(error) {
    return cb(error);
  }

}

/**
 *
 *
 * @param {Object[]} JSONmodels Contains all the Loobpack JSON models files from 'common/models'
 * directory (already parsed as objects).
 * @param {Object[]} relations Contains all the relations from current seed model (the one specified
 * on the terminal).
 * @param {Object} mainLoopbackModel A Loopback instance for the current model.
 * @param {Object[]} fakeModelsArray It contains a bunch of fake records from the current seed model.
 * @async
 * @returns {Promise} Returns a promise just to be able to wait from the function that calls this one.
 */
async function checkModelRelations({ 
  JSONmodels, relations, mainLoopbackModel, seedModels, fakeModelsArray 
}) {
  
  const promisesToAwait = [];
  relations.forEach( relation => {

    //Get the related model.
    const relatedModel = models[relation.model];

    if(relation.type === 'hasMany') {

      const currentSeedModel = getSeedModelByName(seedModels, relatedModel.name);
      fakeModelsArray.forEach( fakeModel => {
        fakeModel[relation.relationName] = getFakeModelsArray(currentSeedModel, 10);
      });
      
    } 
    else if(relation.type === 'belongsTo') {

      //Get related JSON model.
      const relatedJSONmodel = JSONmodels
        .find( json => json.name === relatedModel.name );

      //Go get the JSON related model to check the foreignKeys required to
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
          console.log(`The current ${Model.name} model has a 'belongsTo' relation with the `
                    + `${relatedModel.name} model, however the ${relatedModel.name} `
                    + `model does not have records currently on the database, `
                    + `Do you want to create some fake records of it to get a more `
                    + `accurate generated model?`);

          
          //Put prompt functionality in here.
          return cb(`There are not ${relatedModel.name} existing records to make the relation insert`);
        } else {

          fakeModelsArray.forEach( fakeModel => {
            fakeModel[foreignKey] = getRandomElementFromArray(relatedModelResults).id;
          })

          return { done: true };

        }

      })
      .catch( err => cb(err))

      promisesToAwait.push(auxPromise);
    }
    
  });

  return Promise.all(promisesToAwait);

}


function insert({ models, Model, fakeModelsArray, relations }) {

  const hasManyRelations = relations
    .filter( relation => relation.type === 'hasMany' )
    .map( relation => {
      return { 
        name: relation.relationName, 
        relatedModelName: relation.model,
        foreignKey: relation.foreignKey
      }
    });
  
  
  //Parent model created
  return models[Model.name].create(fakeModelsArray)
    //Get the ids of the already created parent models.
    .then( createdResults => createdResults.map( record => record.id ))
    //Get the ids from the parent model records to bound the 'hasMany' related models.
    .then( ids => {

      let hasManyRecordsPromises = [];

      hasManyRelations
        .forEach( relation => {

          const relatedArraysModelsToCreate = fakeModelsArray
            .map( fakeModel => fakeModel[relation.name] )

          //Put a parent id to every single related model.
          relatedArraysModelsToCreate.forEach( (relatedModelsArray, i) => {

            relatedModelsArray.forEach( relatedModel => {
              relatedModel[relation.foreignKey] = ids[i];
            });

          })
          
          const flattenedArray = flattenArray({ array: relatedArraysModelsToCreate, mutable: false })
          
          hasManyRecordsPromises.push(models[relation.relatedModelName].create(flattenedArray));

        })

        return Promise.all(hasManyRecordsPromises);

    })

}



function getSeedModelByName( seedModels, name ) {
  return seedModels.find( seedModel => seedModel.name === name );
}


function flattenArray({ array, mutable }) {
  var toString = Object.prototype.toString;
  var arrayTypeStr = '[object Array]';
  
  var result = [];
  var nodes = (mutable && array) || array.slice();
  var node;

  if (!array.length) {
      return result;
  }

  node = nodes.pop();
  
  do {
      if (toString.call(node) === arrayTypeStr) {
          nodes.push.apply(nodes, node);
      } else {
          result.push(node);
      }
  } while (nodes.length && (node = nodes.pop()) !== undefined);

  result.reverse(); // we reverse result to restore the original order
  return result;
}



module.exports = {
  performComplexSeed,
}

