/** @module Seeds/Execute/ComplexSeed */


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
 * @param {Object} models - All the models that the Loopback instance provides
 * ( <code> require('../../server/server').models </code> )
 * @param {callback} cb - The next callback to keep the flow on all the
 * <code>prepare process</code> on the file.
 */

async function performComplexSeed({  Model, models, numRecords, cb }) {
  
  try {
    
    const JSONmodels = await getModelsWithRequestedProperties([ 'name', 'relations', 'properties' ]);
    const JSONModel = JSONmodels.find( model => model.name === Model.name );
    const relations = Object.keys(JSONModel.relations).map( key => JSONModel.relations[key] );
    
    const mainLoopbackModel = models[Model.name];

    const fakeModelsArray = getFakeModelsArray( Model, numRecords );

    const finishedPromises = [];
    // HAS TO BE A METHOD - 
    relations.forEach( relation => {

      if(relation.type === 'hasMany') {
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
              console.log(`The current ${Model.name} has a relation with the 
                           ${relatedModel.name} model, however the ${relatedModel.name}
                           model does not have records currently on the database,
                           Do you want to create some records of it to get a more 
                           accurate generated model?`);
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

          finishedPromises.push(auxPromise);
      }
      
    });

    await Promise.all(finishedPromises);
    await models[Model.name].create(fakeModelsArray);
    return cb(null);
    
  } catch(error) {
    return cb(error)
  }

}

module.exports = {
  performComplexSeed,
}

