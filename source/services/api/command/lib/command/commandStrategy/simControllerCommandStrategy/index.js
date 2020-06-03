'use strict';

const commandValidator = require('./commandValidator');
const commandToShadowTransform = require('./commandToShadowTransform');


class SimControllerCommandStrategy {

    constructor(command) {
        this.command = command;
    }

    validate() {
        let isCommandValid = true;
        if (this.command === undefined
            || !commandValidator.isValid(this.command)) {
            isCommandValid = false
        }
        return isCommandValid;
    }


}

module.exports = SimControllerCommandStrategy;