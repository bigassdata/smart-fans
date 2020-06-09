'use strict';

const _ = require('lodash');
const Device = require('./device');
const getPaths = require('./../util/getPaths');

let controllerState = {
    instanceNumber: "3FFFFF",
    autoIdealTemperature: 23.3,
    actualTemperature: 23.3,
    fan: {
        1: {
            fanType: "Powerfoil X",
            power: true,
            commandedSpeedPercent: 10.0,
            actualSpeedPercent: 10.0,
            isForward: true,
            resetFaults: false,
            autoEnable: true,
            activeFault: "No Fault"
        },
        2: {
            fanType: "Powerfoil X",
            power: true,
            commandedSpeedPercent: 10.0,
            actualSpeedPercent: 10.0,
            isForward: true,
            resetFaults: false,
            autoEnable: true,
            activeFault: "No Fault"
        },
        3: {
            fanType: "Powerfoil X",
            power: true,
            commandedSpeedPercent: 10.0,
            actualSpeedPercent: 10.0,
            isForward: true,
            resetFaults: false,
            autoEnable: true,
            activeFault: "No Fault"
        },
        4: {
            fanType: "Powerfoil X",
            power: true,
            commandedSpeedPercent: 10.0,
            actualSpeedPercent: 10.0,
            isForward: true,
            resetFaults: false,
            autoEnable: true,
            activeFault: "No Fault"
        },
        5: {
            fanType: "Powerfoil X",
            power: true,
            commandedSpeedPercent: 10.0,
            actualSpeedPercent: 10.0,
            isForward: true,
            resetFaults: false,
            autoEnable: true,
            activeFault: "No Fault"
        },
        6: {
            fanType: "Powerfoil X",
            power: true,
            commandedSpeedPercent: 10.0,
            actualSpeedPercent: 10.0,
            isForward: true,
            resetFaults: false,
            autoEnable: true,
            activeFault: "No Fault"
        },
        7: {
            fanType: "Powerfoil X",
            power: true,
            commandedSpeedPercent: 10.0,
            actualSpeedPercent: 10.0,
            isForward: true,
            resetFaults: false,
            autoEnable: true,
            activeFault: "No Fault"
        },
        8: {
            fanType: "Powerfoil X",
            power: true,
            commandedSpeedPercent: 10.0,
            actualSpeedPercent: 10.0,
            isForward: true,
            resetFaults: false,
            autoEnable: true,
            activeFault: "No Fault"
        }
    }
};


class Controller extends Device {

    constructor(path, properties) {
        super(path, properties);
        this.changedPaths = [];
    }

    /**
     * Override this method to handle changes from the Device Shadow.
     * @param {Object} stateObject
     * @return {boolean} - true if changes were applied.
     */
    onChange(stateDelta) {
        let hasChanged = false;
        this.changedPaths = getPaths(stateDelta);
        hasChanged = (this.changedPaths.length > 0);
        if (hasChanged) {
            console.log(`Applying changes to: ${this.changedPaths}`);
            let newState = controllerState;
            // for each path in changedPaths
            this.changedPaths.forEach((path) => {
                let stringPath = path.join('.');
                let newValue = _.at(stateDelta, stringPath)[0];
                newState = _.set(newState, path, newValue);
            })
            console.log(`New state is ${JSON.stringify(controllerState)}`);
            controllerState = newState;
        }
        return hasChanged;
    }

    /**
     * Add logic to report telemetry data and trigger
     * events here.
     */
    run() {
        return;
    }

    /**
     * Return the current state of the device.  This is used
     * to provide initial state (on `register` event), and
     * to report device state on regular intervals.
     */
    getCurrentState() {
        let state = {};
        state['reported'] = controllerState;
        if (this.changedPaths && this.changedPaths.length > 0) {
            state['desired'] = this.getDesiredState();
        }
        return { state: state };
    }

    getDesiredState() {
        let desired = {};

        const reducer = (accumulator, currentPath) => {
            if (!accumulator) {
                accumulator = {};
            }
            _.setWith(accumulator, currentPath, null, Object);

            return accumulator;
        }
        desired = this.changedPaths.reduce(reducer, {});
        return desired;
    }



}

module.exports = Controller;