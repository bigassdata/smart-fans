'use strict';

const _ = require('lodash');
const Device = require('./device');
const getPaths = require('./../util/getPaths');
const moment = require('moment');

// Percentage chance for a fault on fan in simulation
const FAULT_CHANCE = 10;

let faultList = [
    "No Fault",
    "External Fault",
    "Over Voltage",
    "Overload",
    "Ground Fault",
    "Low Voltage",
    "Internal Fault",
    "AC Input Phase Loss",
    "Rotor Control",
    "Over Temperature",
    "Current Mismatch",
    "Impact Detected"
];

let fanAcceleration = 1 / 1000; // 1% per second

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

        // Used to track time since last report for speed changes
        // Track one for each fan address
        this.lastSpeedReport = {};

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
        //desired = this.changedPaths.reduce(reducer, {});
        desired = null;
        return desired;
    }

    beforeReportState() {
        // If there is a difference between commandedAndActual Speed?
        this.handleSpeedDelta();
        // Simulate faults on the fan
        this.handleFaultSimulation();
    }

    handleSpeedDelta() {
        let fanAddresses = Object.keys(controllerState.fan);

        fanAddresses.forEach(address => {
            let fan = controllerState.fan[address];
            if (!fan || !fan.commandedSpeedPercent || !fan.actualSpeedPercent) {
                console.log(`Error handling speed delta ${JSON.stringify(fan)}`);
                return;
            }

            let diff = fan.commandedSpeedPercent - fan.actualSpeedPercent;

            if (diff !== 0) { // We need to adjust actual speed

                let timeDelta = 0;
                if (!_.isUndefined(this.lastSpeedReport[address])) {
                    timeDelta = moment.now() - this.lastSpeedReport[address];
                    this.lastSpeedReport[address] = moment.now();
                } else {
                    // This just changed, record start time and exit
                    this.lastSpeedReport[address] = moment.now();
                    return;
                }

                let direction = (diff > 0) ? 1 : -1;

                let deltaSpeed = direction * fanAcceleration * timeDelta; // 1% / sec * 30 sec

                if (Math.abs(fan.actualSpeedPercent + deltaSpeed) >= fan.commandedSpeedPercent) {
                    console.log(`Fan @ ${address} reached commanded speed`);
                    fan.actualSpeedPercent = fan.commandedSpeedPercent;
                    delete this.lastSpeedReport[address]
                } else {
                    console.log(`Fan @ ${address} is still ${(direction == 1) ? 'Speeding Up' : 'Slowing Down'}`);
                    // Add it up and round it off
                    fan.actualSpeedPercent = Math.round(100 * (fan.actualSpeedPercent + deltaSpeed)) / 100;
                }
            }
        });
    }

    handleFaultSimulation() {
        let fanAddresses = Object.keys(controllerState.fan);

        fanAddresses.forEach(address => {
            let fan = controllerState.fan[address];

            if (fan.resetFaults === true) {
                console.log(`Resetting faults for Fan ${address}`);
                this.publishEvent(
                    'info',
                    `Fault was reset for fan @ ${address}`,
                    {
                        fanAddress: address,
                        fanType: fan.fanType,
                        faultCleared: fan.activeFault
                    }
                );
                fan.resetFaults = false;
                fan.activeFault = faultList[0];
                return; // If we reset a fault, don't do anything else
            }

            // No current fault, % chance to simulate one.
            if (fan.activeFault === faultList[0] &&
                _.random(1, 100) <= FAULT_CHANCE) {
                let fault = faultList[_.random(1, 11)];
                console.log(`Fan @ ${address} has a fault: ${fault}`);
                this.publishEvent(
                    'error',
                    `Fault occurred: ${fault} @ fan ${address}`,
                    {
                        fanAddress: address,
                        fanType: fan.fanType,
                        fault: fault
                    }
                );
                fan.activeFault = fault;
            }

        });
    }



}

module.exports = Controller;