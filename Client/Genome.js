/**
 *  Define  Genome Model
 *  @param  {Object}  schema
 *  @return {Object}  model
 **/

module.exports = function (sequelize, Sequelize) {
	return sequelize.define('genome', {
		id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
		fitness: { type: Sequelize.FLOAT },
		generation: { type: Sequelize.INTEGER }
	});
};
