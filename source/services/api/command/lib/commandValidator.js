'use strict';

const _ = require('underscore');
const yaml = require('js-yaml');
const fs = require('fs');

/**
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
    "number": _.isNumber,
    "boolean": _.isBoolean,
    "modbusAddress": (value) => {
        return _.isNumber(value) && value >= 1 && value <= 247;
    }
}

/**
 * The schema for commands.
 * Commands are specified in parts, e.g. set-fan-power.
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
const commandSchema = yaml.load(
    fs.readFileSync(
        `${__dirname}/../schema/command.schema.yml`,
        { encoding: 'utf-8' }
    )
);

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