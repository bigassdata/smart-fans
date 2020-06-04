'use strict';

const _ = require('lodash');
const fs = require('fs');

const isANumber = x => _.isNumber(x) || _.isString(x) && _.isNumber(+x);


/**
 * A type validator for simulated fan controllers.
 *
 * Map the name of the type (in the schema) to a function
 * that validates that type.
 *
 * @example
 * typeValidator["string"]("a string type"); // => true
 * typeValidator["number"]("a string type"); // => false
 * typeValidator["boolean"]("a string type"); // => false
 */
const typeValidator = {
    "string": _.isString,
    "number": isANumber,
    "boolean": _.isBoolean,
    "modbusAddress": (value) => _.isInteger(value) && value >= 1 && value <= 247
}

/**
 * The schema for commands.
 * Commands are specified in parts.
 *
 * For example, `set-fan-power` is a command to turn a fan
 * on or off based on the arguments.,
 *
 * The validation rules for this example can be retrieved
 * using the parts as indices.
 *
 * @example
 *
 * commandSchema['set]['fan']['power'];
 *  =>  {
 *          "value": "boolean",
 *          "address": "number"
 *      }
 */
const commandSchema = {
    "meta": "This schema provides a set of hierarchical commands based on hyphen (-) separated parts.",
    "set": {
        "zeroToTen": {
            "deviceType": {
                "value": "string"
            },
            "power": {
                "value": "boolean"
            },
            "autoEnable": {
                "value": "boolean"
            },
            "levelPercent": {
                "value": "number"
            }
        },
        "autoIdealTemperature": {
            "value": "number"
        },
        "fan": {
            "fanType": {
                "value": "string",
                "address": "modbusAddress"
            },
            "power": {
                "value": "boolean",
                "address": "modbusAddress"
            },
            "commandedSpeedPercent": {
                "value": "number",
                "address": "modbusAddress"
            },
            "isForward": {
                "value": "boolean",
                "address": "modbusAddress"
            },
            "resetFaults": {
                "address": "modbusAddress"
            },
            "autoEnable": {
                "value": "boolean",
                "address": "modbusAddress"
            }
        }
    }
};

/**
 * @typedef CommandDetails
 * @type {object}
 * @property {string} command - Valid command Text
 * @property {boolean|string|number} value - A value that relates to the command (optional).
 * @property {number} address - A valid Modbus Address (optional).
 */

/**
 * Validates a command against the commandSchema
 * @param {CommandDetails} commandDetails - a command object to evaluate
 * @returns {boolean} - `true` if all parts are valid.  `false` if a rule fails.
 */
const isValid = (commandDetails) => {
    // Should have a command member that is a string
    if (!_.has(commandDetails, 'command')) {
        return false;
    }

    // Split the command into parts
    let parts = commandDetails.command.split('-');

    // Empty string
    if (_.isEmpty(parts)) {
        return false;
    }

    // Get the rules for this command
    let validator = parts.reduce((accumulator, part) => {
        if (accumulator == null) {
            return null;
        }
        return accumulator[part];
    }, commandSchema);

    // An unknown command
    if (validator == null) {
        return false;
    }

    // Apply all of the rules to the
    return _.reduce(
        Object.keys(validator),
        (memoizer, entry) => {
            return memoizer &&
                typeValidator[validator[entry]](commandDetails[entry]);
        },
        true
    );
}

module.exports = { isValid };