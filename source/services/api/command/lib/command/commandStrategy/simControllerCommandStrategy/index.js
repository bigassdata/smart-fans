'use strict';

const commandValidator = require('./commandValidator');
const Logger = require('logger');

class SimControllerCommandStrategy {

    constructor(command) {
        this.command = command;
    }

    validate() {
        let isCommandValid = true;
        if (this.command === undefined
            || !commandValidator.isValid(this.command)) {
            Logger.log(
                Logger.levels.INFO,
                'Command is Invalid', JSON.stringify(this.command)
            );
            isCommandValid = false
        }
        return isCommandValid;
    }


}

module.exports = SimControllerCommandStrategy;