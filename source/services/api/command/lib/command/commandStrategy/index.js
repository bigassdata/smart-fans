'use strict';

const HVACCommandStrategy = require('./hvacCommandStrategy');

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
        default:
            throw new Error('Unknown model number.  No commands associated with model.');
    }

    return commandStrategy;
};

module.exports = commandStrategyFactory;