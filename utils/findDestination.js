'use strict';

module.exports = function(destinations) {

    return function(destination) {
        var path = destinations[destination];

        if(!path){
            throw new Error('Cannot find destination for: ' + destination);
            return;
        }
        return path;
    };
};
