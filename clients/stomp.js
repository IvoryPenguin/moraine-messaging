'use strict';

var _ = require('lodash'),
    events = require('events'),
    stompit = require('stompit');

module.exports = function(settings) {

    var client,
    config = _.omit(settings, 'destinations'),
    eventsEmitter = new events.EventEmitter(),
    findDestination = require('../utils/findDestination')(settings.destinations);

    var connect = function() {
        return new Promise(function(resolve, reject){
            client = stompit.connect(config, function(error, client) {
                if (error) {
                    eventsEmitter.emit('connectError', error);
                    reject('connect error ' + error.message);
                }
                eventsEmitter.emit('clientConnected');
                resolve();
                return client;
            });
        });
    };

    var disconnect = new Promise(function(resolve, reject){
        client.disconnect();
        eventsEmitter.emit('clientDisconnected')
        resolve();
    });

    var listen = function(destination, headers) {
        var destination = findDestination(destination);

        var subscribeHeaders = _.assign({
            'destination': destination,
            'ack': 'auto'
        }, headers);

        client.subscribe(subscribeHeaders, function(error, message) {
            if (error) {
                eventsEmitter.emit('subscribeError', 'connect error: ' + error.message);
                throw new Error('connect error: ' + error.message);
            }

            eventsEmitter.emit('addedListener', destination);

            message.readString('utf-8', function(error, body) {

                if (error) {
                    eventsEmitter.emit('readError', 'read message error ' + error.message);
                    throw new Error('read message error: ' + error.message);
                }

                message.ack();

                if(message.headers['content-type'] === 'application/json'){
                    body = JSON.parse(body);
                }

                eventsEmitter.emit('messageReceived', body, message.headers);
            });
        });
    };


    var emit = function(destination, message, headers) {
        var destination = findDestination(destination);
        var sendHeaders = _.assign({
            'destination': destination,
            'content-type': 'text/plain'
        }, headers);

        if(_.isObject(message)){
            sendHeaders['content-type'] = 'application/json';
            message = JSON.stringify(message, null, '\t');
        }

        var frame = client.send(sendHeaders);
        frame.write(message);
        frame.end();

        eventsEmitter.emit('messageEmitted', message, headers);
    };

    var on = function(eventName, callback) {
        eventsEmitter.on(eventName, callback);
    };

    return {
        listen: listen,
        emit: emit,
        connect: connect,
        disconnect: disconnect,
        on: on
    };
};
