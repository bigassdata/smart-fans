'use strict';

const _ = require('lodash');

/**
 * Takes a command object and returns the resulting
 * shadow device details.
 *
 * @example
 *
 * // simple controller command
 * transform({ command: 'set-autoIdealTemperature', value: 42 }) =>
 *   { autoIdealTemperature: 42 }
 *
 * // controller command for 0-10V devices
 * transform({ command: 'set-zeroToTen-autoEnable', value: true}) =>
 *   { zeroToTen: { autoEnable: true } }
 *
 * // indexed command for one of multiple connected fans
 * transform({ command: 'set-fan-commandedSpeedPercent', value: 42, address: 5 }) =>
 *   {
 *     fan: {
 *       5: {
 *         commandedSpeedPercent: 42
 *       }
 *     }
 *   }
 *
 * @param {Object} commandObj
 */
const transform = (commandObj) => {
    // We split the command string and process it from last to first
    let parts = commandObj.command.split('-').reverse();

    return build({}, parts, commandObj);
}

/**
 * Transform a command into a JS object that can be used in AWS IoT Shadow Device.
 *
 * @param {Object} tree - This is the shadow device object that will be placed in `desired` for AWS IoT.
 * @param {Array} list - A list of command parts to process (in reverse order)
 * @param {Object} command - The original command object that we are using to build the desired state
 */
const build = (tree, list, command) => {

    // Error condition
    if (command == null) {
        throw Error('Expected command argument');
    }

    // Likely error condition
    if (_.isEmpty(list)) {
        console.warn('[commandToShadowTransform] Empty List in build.');
        return tree;
    }

    // Stopping condition
    // For now, all commands start with 'set'.  In the future, we may want
    // to apply additional logic here.
    if (list.length == 1) {
        return tree;
    }

    // This is the initial iteration.
    // Take the last part of the command string from list.
    // That is the attribute for the object.  The value attribute
    // in the command object is the value
    // { command: set-autoIdealTemperature, value: 42} =>
    // { autoIdealTemperature: 42 }
    if (_.isEmpty(tree)) {
        let newTree = {};
        _.set(newTree, _.head(list), _.isUndefined(command.value) ? true : command.value);
        return build(newTree, _.tail(list), command);
    }

    // We need to wrap the current `tree` with other objects
    let newTree = {};
    let key = _.head(list); // Get the first item on the list

    // `fan` is an indexed command.  We have to wrap it in the address.
    // we could add other indexed commands in the future
    if (key === 'fan') {
        // Tries to make an array because command.address is an Integer.
        // setWith overrides that behavior because of the `customizer` parameter.
        // We set the customizer to the Object constructor.
        _.setWith(newTree, `fan.${command.address}`, tree, Object);
    } else {
        // wrap the `tree` in the first `list` value
        _.set(newTree, key, tree);
    }

    // Recursive.  Send the tree so far, with the rest of the
    // `list` and the unchanged `command`
    return build(newTree, _.tail(list), command);
}

module.exports = { transform };