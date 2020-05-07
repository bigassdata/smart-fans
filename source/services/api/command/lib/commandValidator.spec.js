'use strict';

const sinon = require('sinon');
const sinonTest = require('sinon-test');
const test = sinonTest(sinon);
let assert = require('chai').assert;
let expect = require('chai').expect;

let { isValid } = require('./commandValidator.js');

describe('CommandValidator', function () {

    it('Validates a set-autoIdealTemperature command', function () {
        let validCommand = {
            command: 'set-autoIdealTemperature',
            value: 23.2
        }
        expect(isValid(validCommand)).to.be.true;
    });

    it('Fails for an empty command', () => {
        let invalidCommand = {
            command: '',
        }
        expect(isValid(invalidCommand)).to.be.false;
    });

    it('Fails for a missing command', () => {
        let invalidCommand = {
            value: 'test value',
        }
        expect(isValid(invalidCommand)).to.be.false;
    });

    it('Fails for an unknown command', () => {
        let unknownCommand = {
            command: 'unknown-autoIdealTemperature',
            value: 23.2
        }
        expect(isValid(unknownCommand)).to.be.false;
    });

    it('Fails for missing value', function () {
        let invalidCommand = {
            command: 'set-autoIdealTemperature',
        }
        expect(isValid(invalidCommand)).to.be.false;
    });

    it('Ignores irrelevant parameters', () => {
        let validCommand = {
            command: 'set-autoIdealTemperature',
            value: 23.2,
            address: 0
        }
        expect(isValid(validCommand)).to.be.true;
    })

    describe('For ztt (0-10V) commands', () => {

        it('Validates set-ztt-deviceType', () => {
            expect(isValid({
                command: 'set-ztt-deviceType',
                value: "Test Device Type"
            })).to.be.true;
        });

        it('Validates set-ztt-power', () => {
            expect(isValid({
                command: 'set-ztt-power',
                value: true
            })).to.be.true;
        });

        it('Validates set-ztt-autoEnable', () => {
            expect(isValid({
                command: 'set-ztt-autoEnable',
                value: true
            })).to.be.true;
        });

        it('Validates set-ztt-levelPercent', () => {
            expect(isValid({
                command: 'set-ztt-levelPercent',
                value: 25.3
            })).to.be.true;
        });

    });

    describe('For fan commands', () => {

        it('Requires an address attribute', () => {
            expect(isValid({
                command: 'set-fan-power',
                value: true
            })).to.be.false;
        });

        it('Validates the range of the modbus Address', () => {
            expect(isValid({
                command: 'set-fan-power',
                value: true,
                address: true
            })).to.be.false;

            expect(isValid({
                command: 'set-fan-power',
                value: true,
                address: 0
            })).to.be.false;

            expect(isValid({
                command: 'set-fan-power',
                value: true,
                address: 248
            })).to.be.false;

            // Boundary tests
            expect(isValid({
                command: 'set-fan-power',
                value: true,
                address: 1
            })).to.be.true;

            expect(isValid({
                command: 'set-fan-power',
                value: true,
                address: 247
            })).to.be.true;


        });

        it('Validates set-fan-power', () => {
            expect(isValid({
                command: 'set-fan-power',
                value: true,
                address: 2
            })).to.be.true;
        });

        it('Validates set-fan-commandedSpeedPercent', () => {
            expect(isValid({
                command: 'set-fan-commandedSpeedPercent',
                value: 55.555,
                address: 2
            })).to.be.true;
        });

        it('Validates set-fan-isForward', () => {
            expect(isValid({
                command: 'set-fan-isForward',
                value: true,
                address: 2
            })).to.be.true;
        });

        it('Validates set-fan-resetFaults', () => {
            expect(isValid({
                command: 'set-fan-resetFaults',
                address: 2
            })).to.be.true;
        });

        it('Validates set-fan-autoEnable', () => {
            expect(isValid({
                command: 'set-fan-autoEnable',
                value: true,
                address: 2
            })).to.be.true;
        });

    });
});

