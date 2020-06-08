'use strict';

const commandValidator = require('./commandValidator');
const { transform } = require('./commandToShadowTransform');
const Logger = require('logger');

class SimControllerCommandStrategy {

    constructor(command) {
        if (typeof command === 'string') {
            this.command = JSON.parse(command);
        } else {
            this.command = command;
        }
    }

    validate() {
        let isCommandValid = true;
        if (this.command === undefined
            || this.command.commandDetails === undefined
            || !commandValidator.isValid(this.command.commandDetails)) {
            Logger.log(
                Logger.levels.INFO,
                'Command is Invalid', JSON.stringify(this.command)
            );
            isCommandValid = false
        }
        return isCommandValid;
    }

    getDetails() {
        return this.command.commandDetails;
    }

    getShadowDetails() {
        return transform( this.command.commandDetails );
    }


}

module.exports = SimControllerCommandStrategy;