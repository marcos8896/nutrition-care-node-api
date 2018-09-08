
'use strict';


/**
 * Dedicated services to handle all the function of the Food model.
 *
 * @class FoodService
 */
class FoodService {

  /**
   * Before create a new register, it will check whether the current 'proteins'
   * 'carbohydrates', 'fats' and 'calories' are numbers greater than zero.
   *
   * @author Marcos Barrera del Río <elyomarcos@gmail.com>
   *
   */
  static beforeCreateValidateFoodNutrients( ctx, unused, next ) {

    const { proteins, carbohydrates, fats, calories } = ctx.req.body;

    const areAllGreaterThanZero = [proteins, carbohydrates, fats, calories]
      .map( value => parseFloat( value ) )
      .every( value => value > 0 );

    if ( areAllGreaterThanZero )
      return next();
    else
      return next(
        new Error(
                   'Please provide all the food nutrients ' +
                   'with values greater than zero: ' +
                   '(proteins, carbohydrates, fats, calories)'
                ) );

  }

}

module.exports = FoodService;
