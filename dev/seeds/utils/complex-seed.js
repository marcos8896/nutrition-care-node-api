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

 const { 
   logProcess, 
  } = require('./terminal/console');



/**
 * Prepare and insert the wanted model to seed, by considering its related models and its
 * relations.
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
        models, Model, fakeModelsArray, relations, JSONmodels, mainLoopbackModel, seedModels
      });

      return cb(null);
    
    } catch( error ) {
      return cb(error);
    }
    
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
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
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
      
    await insertParentWithHasManyRelatedModels({ 
      models, Model, fakeModelsArray, relations, seedModels
    });

}



/**
 * Inserts the given seed model (normally the model that was given on the terminal) and after that,
 * inserts all its related 'hasMany' fake models.
 *
 * @param {Object} models The models from the Loopback main instance.
 * @param {Object} Model - A given seed model object.
 * @param {Object[]} fakeModelsArray It contains a bunch of fake records from the current seed model.
 * @param {Object[]} relations Contains all the relations from current seed model (the one specified
 * on the terminal).
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 * @returns {Promise} Returns a promise just to be able to wait from the function that calls this one.
 */
function insertParentWithHasManyRelatedModels({ 
  models, Model, fakeModelsArray, relations, seedModels 
}) {

  logProcess({ message: `\nProcessing 'hasMany' relations...`, bold: true })

  const hasManyRelations = relations
    .filter( relation => relation.type === 'hasMany' )

  addHasManyFakeRelatedModels({ hasManyRelations, seedModels, fakeModelsArray, seedModels })
  
  //Parent model created
  return models[Model.name].create(fakeModelsArray)
    //Get the ids of the already created parent models.
    .then( createdResults => {

      logProcess({ 
        message: `\nFake records from the main '${Model.name}' model were inserted ` +
                 `to get the IDs and to be able to relate/link the 'hasMany' relations.`, 
        bold: true 

      });

      return createdResults.map( record => record.id )
    })
    //Get the ids from the parent model records to bound the 'hasMany' related models.
    .then( ids => {
      let hasManyRecordsPromises = [];
      hasManyRelations
        .forEach( relation => {

          logProcess({ 
            message: `  Inserting '${relation.model}' related fake records ` +
                     `through the ${relation.type} '${relation.relationName}' relation...` 
          });

          const relatedArraysModelsToCreate = fakeModelsArray
            .map( fakeModel => fakeModel[relation.relationName] )

          //Put a parent id to every single related model.
          relatedArraysModelsToCreate.forEach( (relatedModelsArray, i) => {

            relatedModelsArray.forEach( relatedModel => {
              relatedModel[relation.foreignKey] = ids[i];
            });

          })
          
          const flattenedArray = flattenArray({ array: relatedArraysModelsToCreate, mutable: false })
          
          hasManyRecordsPromises.push(models[relation.model].create(flattenedArray));

        })

        return Promise.all(hasManyRecordsPromises);

    })

}



/**
 * Checks the 'hasMany' relation and attach fake records to the <code>fakeModelsArray</code>
 * array in order to created those related fake records in the following methods.
 * (This method is based on the mutation of the fakeModelsArray).
 *
 * @param {Object[]} relations Contains all the relations from current seed model (the one specified
 * on the terminal).
 * @param {Object[]} seedModels - All the parsed seed models from the seedModels folder.
 * @param {Object[]} fakeModelsArray It contains a bunch of fake records from the current seed model.
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 */
function addHasManyFakeRelatedModels({ hasManyRelations, seedModels, fakeModelsArray }) {
  
  hasManyRelations.forEach( relation => {

    logProcess({ message: `  Processing hasMany '${relation.relationName}' relation...` });

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
 * consideration the 'belongsTo' relations from the given seed model (normally the one
 * that was given on the terminal). After the insertion of the related 'belongsTo' models.
 * This method attaches the created related models to the fakeModelsArray models just before
 * the <code>insertParentWithHasManyRelatedModels(...)</code> method inserts the main seed
 * model (the one that was given on the terminal).
 *
 * @param {Object} models The models from the Loopback main instance.
 * @param {Object[]} fakeModelsArray It contains a bunch of fake records from the current seed model.
 * @param {Object[]} relations Contains all the relations from current seed model (the one specified
 * on the terminal).
 * @param {Object[]} JSONmodels Contains all the Loobpack JSON models files from 'common/models'
 * directory (already parsed as objects).
 * @param {Object} mainLoopbackModel A Loopback instance for the current model.
 * @param {Object[]} seedModels - All the parsed seed models from the seedModels folder.
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 * @async
 * }
 * @returns
 */
function insertBelongsTo({ 
  models, fakeModelsArray, relations, JSONmodels, mainLoopbackModel, seedModels
}) {

  logProcess({ message: `\nProcessing 'belongsTo' relations...`, bold: true });

  const belongsToRelations = relations
  .filter( relation => relation.type === 'belongsTo' )

  //METHOD - Get the foreign key from the related models in order to make the insertion.
  belongsToRelations.forEach( relation => {

    logProcess({ message: `  Processing belongsTo '${relation.relationName}' relation...` });

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

  });

  const insertRelatedParantModels = [];
  belongsToRelations.forEach( relation => {

    logProcess({ 
      message: `  Inserting '${relation.model}' related fake records ` +
               `through the ${relation.type} '${relation.relationName}' relation...` 
    });

    fakeModelsArray.forEach( fakeModel => {

      const currentRelatedSeedModel = getSeedModelByName(seedModels, relation.model);
      const relatedModelFakeData =  getFakeModelsArray(currentRelatedSeedModel, 1);
      insertRelatedParantModels.push(
        models[relation.model].create(relatedModelFakeData).then( result => {
          fakeModel[relation.foreignKey] = result[0].id;
      }))

    })

  })

  return Promise.all(insertRelatedParantModels).then(() => logProcess({ 
    message: `  All 'belongsTo' related records where inserted.`
  }));

}

/**
 *
 *
 * @param {Object[]} seedModels - All the parsed seed models from the seedModels folder.
 * @param {string} name - The name from the seed model to be searched.
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 * @returns
 */
function getSeedModelByName( seedModels, name ) {
  return seedModels.find( seedModel => seedModel.name === name );
}

/**
 * Removes all the nested level from a given array and returns all the elements
 * into a single array.
 *
 * @param {any[]} - The array from which is going to be removed the nested arrays.
 * @returns {any[]} An array with all the elements from the given param array
 * @author Marcos Barrera del Río <elyomarcos@gmail.com>
 * without any nested array inside of it.
 */
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

