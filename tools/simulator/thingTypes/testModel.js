'use strict';
// Required to publish Event
const moment = require('moment');
const colors = require('colors');

const Device = require('./device');


class HVAC extends Device {

    constructor(devicePath, properties) {
        super(devicePath, properties);
        this.powerStatus = 'OFF';  // OFF, AC, HEAT
        this.actualTemperature = 71.5;
        this.targetTemperature = 71.5;
        this.temperatureChange = 0.5;
    }

    // OFF
    randomTemperature() {
        let plusOrMinus = Math.random() < 0.5 ? -1 : 1;
        return Math.round(
            100 * (this.actualTemperature + this.temperatureChange * plusOrMinus)
        ) / 100;
    }

    // HEAT
    increaseTemperature() {
        return Math.round(100 * (this.actualTemperature + this.temperatureChange)) / 100;
    }

    // AC
    decreaseTemperature() {
        return Math.round(100 * (this.actualTemperature - this.temperatureChange)) / 100;
    }

    onChange(desiredState) {

        let hasChanged = false;

        if (desiredState.powerStatus !== undefined &&
            desiredState.powerStatus !== this.powerStatus
        ) {
            console.log(`Reported powerStatus state different from remote state, current: ${this.powerStatus},
                 desired: ${desiredState.powerStatus}.`.green);

            this.powerStatus = desiredState.powerStatus;
            switch (this.powerStatus) {
                case 'OFF':
                    console.log('The device is OFF.'.green);
                    break;
                case 'AC':
                    console.log('AC is ON.'.blue);
                    break;
                case 'HEAT':
                    console.log('HEAT is ON.'.red);
                    break;
            }
            hasChanged = true;
            this.publishEvent('info', 'Power status is changed by user', this.powerStatus);
        }

        if (desiredState.targetTemperature !== undefined) {
            let targetTemperature = parseFloat(desiredState.targetTemperature);

            if (targetTemperature !== this.targetTemperature) {
                this.targetTemperature = targetTemperature;
                hasChanged = true;
                this.publishEvent(
                    'info',
                    'Target temperature is changed by user',
                    this.targetTemperature
                );
            }
        }

        return hasChanged;
    }

    // Run and publish telemetry topic
    run() {
        if (!this.device) {
            console.error('device is not assigned. Will try again.');
            return;
        }

        if (!this.device.publish) {
            throw new Error('No publish method on device.')
        }


        switch (this.powerStatus) {
            case 'OFF': {
                this.actualTemperature = this.randomTemperature();
                break;
            }
            case 'AC': {
                this.actualTemperature = this.decreaseTemperature();
                break;
            }
            case 'HEAT': {
                this.actualTemperature = this.increaseTemperature();
                break;
            }
        }

        let currentTime = moment();
        let message = JSON.stringify({
            createdAt: currentTime.format(),
            deviceId: this.serialNumber,
            actualTemperature: this.actualTemperature,
            targetTemperature: this.targetTemperature,
            sentAt: currentTime.format(),
            timestamp: currentTime.valueOf()
        });
        this.device.publish(this.telemetryTopic, message);
        console.log('Telemetry published '.gray + this.getColoredText(this.actualTemperature, message) + ' to AWS IoT Telemetry.'.gray);
    }

    // Get colored text
    getColoredText(temperature, data) {
        // targetTemperature - 10 > temperature: error
        // targetTemperature - 10 <= temperature < targetTemperature - 5: warning
        // targetTemperature + 5 < temperature <= targetTemperature + 10: warning
        // targetTemperature + 10 < temperature: error
        if (temperature > this.targetTemperature + 10) {
            this.publishEvent('error', 'Temperature is exceeding upper threshold', temperature);
            return data.red + ' (Danger: HOT)'.gray;
        } else if (temperature <= this.targetTemperature + 10 && temperature > this.targetTemperature + 5) {
            this.publishEvent('warning', 'Temperature is slightly exceeding upper threshold', temperature);
            return data.yellow + ' (Warning: WARM)'.gray;
        } else if (temperature >= this.targetTemperature - 10 && temperature < this.targetTemperature - 5) {
            this.publishEvent('warning', 'Temperature is slightly dropping under the threshold', temperature);
            return data.yellow + ' (Warning: CHILLY)'.gray;
        } else if (temperature < this.targetTemperature - 10) {
            this.publishEvent('error', 'Temperature is dropping under the threshold', temperature);
            return data.blue + ' (Danger: COLD)'.gray;
        } else {
            return data.cyan + ' (NICE)'.gray;
        }
    }

    /**
     * Override to publish the device state.
     *
     * @example
     * clientToken = this.device.update(this.serialNumber, stateObject);
     */
    reportState() {
        let clientToken;
        try {
            let stateObject = this.getCurrentState();
            clientToken = this.device.update(this.serialNumber, stateObject);
            if (clientToken === null) {
                console.log('ERROR: Reporting state failed, operation still in progress'.red);
            }
        } catch (err) {
            console.error('ERROR: Unknown error reporting state.'.red, err);
        }
    }

    getCurrentState() {
        return {
            state: {
                reported: {
                    powerStatus: this.powerStatus,
                    actualTemperature: this.actualTemperature,
                    targetTemperature: this.targetTemperature,
                }
            }
        };
    }
}

module.exports = HVAC;