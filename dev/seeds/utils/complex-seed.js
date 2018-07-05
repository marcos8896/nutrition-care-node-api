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
 * Prepare and insert the wanted model to seed, by considering the its relationships.
 * 
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 * @param {Object} Model - A given seed model object.
 * @param {Number} numRecords The wanted number of fake records to be created on the
 * database.
 * @param {Object[]} seedModels - All the parsed seed models from the seedModels folder.
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
      
      await insert({ 
        models, Model, fakeModelsArray, relations, JSONmodels, mainLoopbackModel,
        seedModels
      });

      return cb(null);
    
    } catch( error ) {
      console.log('error: ', error);
    }
    
}



/**
 * Check the 'hasMany' relation and attach fake records to forward be created with the proper
 * relation.
 *
 * @param {Object[]} relations Contains all the relations from current seed model (the one specified
 * on the terminal).
 * @param {Object[]} seedModels - All the parsed seed models from the seedModels folder.
 * @param {Object[]} fakeModelsArray It contains a bunch of fake records from the current seed model.
 */
function checkHasManyModelRelations({  relations, seedModels, fakeModelsArray }) {

  const hasManyRelations = relations
    .filter( relation => relation.type === 'hasMany' )
  
  hasManyRelations.forEach( relation => {

    //Get the related model.
    const relatedModel = models[relation.model];

      const currentSeedModel = getSeedModelByName(seedModels, relatedModel.name);
      fakeModelsArray.forEach( fakeModel => {
        fakeModel[relation.relationName] = getFakeModelsArray(currentSeedModel, 10);
      });
      
  });

}



/**
 * Insert all the new fake records from the <code>fakeModelsArray</code> taking in
 * consideration the 'hasMany' and 'belongsTo' relations from current model to seed.
 *
 * @param {Object} models The models from the Loopback main instance.
 * @param {Object} Model - A given seed model object.
 * @param {Object[]} fakeModelsArray It contains a bunch of fake records from the current seed model.
 * @param {Object[]} relations Contains all the relations from current seed model (the one specified
 * on the terminal).
 * @param {Object[]} JSONmodels Contains all the Loobpack JSON models files from 'common/models'
 * directory (already parsed as objects).
 * @param {Object} mainLoopbackModel A Loopback instance for the current model.
 * @param {Object[]} seedModels - All the parsed seed models from the seedModels folder.
 * @async
 * }
 * @returns
 */
async function insert({ 
  models, Model, fakeModelsArray, relations, JSONmodels, mainLoopbackModel, seedModels
}) {

    await insertBelongsTo({ 
      models, fakeModelsArray, relations, JSONmodels, mainLoopbackModel, seedModels
     });
      
    await insertParentWithHasMany({ 
      models, Model, fakeModelsArray, relations, seedModels
    });

}



/**
 * 
 *
 * @param {Object} models The models from the Loopback main instance.
 * @param {Object} Model - A given seed model object.
 * @param {Object[]} fakeModelsArray It contains a bunch of fake records from the current seed model.
 * @param {Object[]} relations Contains all the relations from current seed model (the one specified
 * on the terminal).
 * @returns {Promise} Returns a promise just to be able to wait from the function that calls this one.
 */
function insertParentWithHasMany({ models, Model, fakeModelsArray, relations, seedModels }) {

  checkHasManyModelRelations({ relations, seedModels, fakeModelsArray, seedModels })

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


/**
 * Insert all the new fake records from the <code>fakeModelsArray</code> taking in
 * consideration the 'hasMany' and 'belongsTo' relations from current model to seed.
 *
 * @param {Object} models The models from the Loopback main instance.
 * @param {Object[]} fakeModelsArray It contains a bunch of fake records from the current seed model.
 * @param {Object[]} relations Contains all the relations from current seed model (the one specified
 * on the terminal).
 * @param {Object[]} JSONmodels Contains all the Loobpack JSON models files from 'common/models'
 * directory (already parsed as objects).
 * @param {Object} mainLoopbackModel A Loopback instance for the current model.
 * @param {Object[]} seedModels - All the parsed seed models from the seedModels folder.
 * @async
 * }
 * @returns
 */
function insertBelongsTo({ 
  models, fakeModelsArray, relations, JSONmodels, mainLoopbackModel, seedModels
}) {

  const belongsToRelations = relations
  .filter( relation => relation.type === 'belongsTo' )

  //METHOD - getForeignkeys
  belongsToRelations.forEach( relation => {

    const relatedModel = models[relation.model];

    //Get related JSON model.
    const relatedJSONmodel = JSONmodels
      .find( json => json.name === relatedModel.name );
    
    //Go get the JSON related model to check the foreignKeys required to
    //insert a new record.
    const key = Object.keys(relatedJSONmodel.relations).find( relation => {
      return relatedJSONmodel.relations[relation].model === mainLoopbackModel.name;
    });

    const foreignKey = relatedJSONmodel.relations[key].foreignKey;
    relation.foreignKey = foreignKey;

    // //Get the related model properties.
    // const relatedModelProperties = relatedJSONmodel.properties;

    // const relatedModelPropKeys = Object.keys(relatedModelProperties);
    
    // const randomProperty = getRandomElementFromArray(relatedModelPropKeys);

    // const orderBy = Math.random() >= 0.5 ? 'ASC' : 'DESC';

  });


  const insertRelatedParantModels = [];
  
  belongsToRelations.forEach( relation => {

    fakeModelsArray.forEach( fakeModel => {

      const currentRelatedSeedModel = getSeedModelByName(seedModels, relation.model);
      const relatedModelFakeData =  getFakeModelsArray(currentRelatedSeedModel, 1);
      insertRelatedParantModels.push(
        models[relation.model].create(relatedModelFakeData).then( result => {
          fakeModel[relation.foreignKey] = result[0].id;
      }))

    })

  })

  return Promise.all(insertRelatedParantModels);

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

