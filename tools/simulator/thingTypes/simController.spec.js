'use strict';

let assert = require('chai').assert;
let expect = require('chai').expect;

const SimController = require('./simController');

describe('simController', () => {

    describe('getCurrentState', () => {
        it('returns initial state as reported', () => {
            let control = new SimController('.', { offline: true });
            expect(control.getCurrentState()).to.deep.equal({
                state: {
                    reported: initialState
                }
            })
        })
    });

    describe('onChange', () => {
        it('can set ideal temperature', () => {
            let control = new SimController('.', { offline: true });

            let delta = {
                autoIdealTemperature: 42.1
            };

            // Reports a change
            expect(control.onChange(delta)).to.equal(true);

            // Includes new value
            expect(control.getCurrentState()).to.nested.include(
                { 'state.reported.autoIdealTemperature': 42.1 }
            );

            // Can generate the proper desired state
            expect(control.getDesiredState()).to.deep.equal({
                autoIdealTemperature: null
            })

            // desired state is included
            expect(control.getCurrentState()).to.nested.include(
                { 'state.desired.autoIdealTemperature': null }
            );
        });

        it('can set fan 2 power to off', () => {
            let control = new SimController('.', { offline: true });

            let delta = { fan: { 1: { power: true } } };

            expect(control.onChange(delta)).to.equal(true);

            expect(control.getCurrentState()).to.nested.include(
                { 'state.reported.fan.1.power': true }
            );

            expect(control.getCurrentState()).to.nested.include(
                { 'state.desired.fan.1.power': null }
            );
        })

    })
});

const initialState = {
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