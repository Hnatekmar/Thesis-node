/**
 *  Define  Genome Model
 *  @param  {Object}  schema
 *  @return {Object}  model
 **/
module.exports = function(schema){
    const Genome = schema.define('genome', {
        id: { type: schema.Integer },
        genome: { type: schema.Json },
        fitness: { type: schema.Float },
        generation: { type: schema.Integer },
        saveTime: { type: schema.Date, default: Date.now }
    }, {
        primaryKeys: ['id']
    });

    /**
     *  Define any custom method
     *  or setup validations here
     **/

    return Genome;
};
