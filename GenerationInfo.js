/**
 *  Define  Genome Model
 *  @param  {Object}  schema
 *  @return {Object}  model
 **/

module.exports = function (sequelize, Sequelize) {
    return sequelize.define('genomeInfo', {
        fk_genome_id: { type: Sequelize.INTEGER, primaryKey: true },
        type: { type: Sequelize.ENUM, values: ['MIN', 'MAX'] },
        json: { type: Sequelize.JSON }
    });
};
