'use strict';

const HVACCommandStrategy = require('./hvacCommandStrategy');
const SimControllerCommandStrategy = require('./simControllerCommandStrategy');

/**
 *
 * @param {String} modelNumber - The modelNumber of the device.
 *                 This is used to lookup the appropriate commandType.
 * @param {Object} command - The command
 */
const commandStrategyFactory = (modelNumber, command) => {

    let commandStrategy = null;
    switch (modelNumber) {
        case 'test-model':
            commandStrategy = new HVACCommandStrategy(command);
            break;
        case 'sim-controller':
            commandStrategy = new SimControllerCommandStrategy(command);
            break;
        default:
            throw new Error(`Unknown model number (${modelNumber}).  No commands associated with model.`);
    }

    return commandStrategy;
};

module.exports = commandStrategyFactory;