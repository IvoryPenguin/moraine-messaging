'use strict';

module.exports = function(config){

	var settings = config[config.default];

	return require('./clients/' + config.default )(settings);

};
