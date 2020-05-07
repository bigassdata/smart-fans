'use strict';

const sinon = require('sinon');
const sinonTest = require('sinon-test');
const test = sinonTest(sinon);
let assert = require('chai').assert;
let expect = require('chai').expect;

let { transform } = require('./commandToShadowTransform.js');

describe('The transform function', () => {
    it('Generates the correct shadow for a set-autoIdealTemperature command', () => {
        expect(transform({
            command: "set-autoIdealTemperature",
            value: 42.1
        })).to.deep.equal({
            autoIdealTemperature: 42.1
        })
    });

    describe('For zeroToTen commands', () => {
        it('Generates the correct shadow to turn power on/off', () => {

            expect(transform({
                command: 'set-zeroToTen-power',
                value: true
            })).to.deep.equal({
                zeroToTen: {
                    power: true
                }
            });

            expect(transform({
                command: 'set-zeroToTen-power',
                value: true
            })).to.deep.equal({
                zeroToTen: {
                    power: true
                }
            });
        });

        it('Generates the correct shadow to set the device type', () => {

            expect(transform({
                command: 'set-zeroToTen-deviceType',
                value: 'Test Fan Type'
            })).to.deep.equal({
                zeroToTen: {
                    deviceType: 'Test Fan Type'
                }
            });
        });

        it('Generates the correct shadow to enable/disable auto', () => {

            expect(transform({
                command: 'set-zeroToTen-autoEnable',
                value: true
            })).to.deep.equal({
                zeroToTen: {
                    autoEnable: true
                }
            });

            expect(transform({
                command: 'set-zeroToTen-autoEnable',
                value: true
            })).to.deep.equal({
                zeroToTen: {
                    autoEnable: true
                }
            });
        });

        it('Generate the correct shadow to change the levelPercent', () => {

            expect(transform({
                command: 'set-zeroToTen-levelPercent',
                value: 42.5
            })).to.deep.equal({
                zeroToTen: {
                    levelPercent: 42.5
                }
            });
        });
    });

    describe('For fan commands', () => {
        it('Generates the correct shadow for a set-fan-fanType command', () => {
            expect(transform({
                command: "set-fan-fanType",
                value: "Powerfoil X",
                address: 222
            })).to.deep.equal({
                fan: {
                    222: {
                        fanType: "Powerfoil X"
                    }
                }
            });
        });

        it('Generates the correct shadow for a set-fan-power command', () => {
            expect(transform({
                command: "set-fan-power",
                value: true,
                address: 1
            })).to.deep.equal({
                fan: {
                    1: {
                        power: true
                    }
                }
            });

            expect(transform({
                command: "set-fan-power",
                value: false,
                address: 1
            })).to.deep.equal({
                fan: {
                    1: {
                        power: false
                    }
                }
            });
        });

        it('Generates the correct shadow for a set-fan-commandedSpeedPercent command', () => {
            expect(transform({
                command: "set-fan-commandedSpeedPercent",
                value: 42.2,
                address: 99
            })).to.deep.equal({
                fan: {
                    99: {
                        commandedSpeedPercent: 42.2
                    }
                }
            })
        });

        it('Generates the correct shadow for a set-fan-isForward command', () => {
            expect(transform({
                command: "set-fan-isForward",
                value: true,
                address: 1
            })).to.deep.equal({
                fan: {
                    1: {
                        isForward: true
                    }
                }
            });

            expect(transform({
                command: "set-fan-isForward",
                value: false,
                address: 1
            })).to.deep.equal({
                fan: {
                    1: {
                        isForward: false
                    }
                }
            });
        });

        it('Generates the correct shadow for a set-fan-resetFaults command', () => {
            expect(transform({
                command: "set-fan-resetFaults",
                address: 247
            })).to.deep.equal({
                fan: {
                    247: {
                        resetFaults: true
                    }
                }
            });
        });

        it('Generates the correct shadow for a set-fan-autoEnable command', () => {
            expect(transform({
                command: "set-fan-autoEnable",
                value: true,
                address: 1
            })).to.deep.equal({
                fan: {
                    1: {
                        autoEnable: true
                    }
                }
            });

            expect(transform({
                command: "set-fan-autoEnable",
                value: false,
                address: 1
            })).to.deep.equal({
                fan: {
                    1: {
                        autoEnable: false
                    }
                }
            });
        });
    });
});
