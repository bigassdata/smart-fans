'use strict';

const commandModes = ['set-temp', 'set-mode'];
const powerStatuses = ['HEAT', 'AC', 'OFF'];

/**
 * The solution is for HVAC devices, and this will suppose the command JSON would contain below keys and values.
 * command {
 *   commandDetails: {
 *     command: "set-temp" | "set-mode",
 *     value: number | "HEAT" | "AC" | "OFF"
 *   },
 *   shadowDetails: {
 *     powerStatus: "HEAT" | "AC" | "OFF",
 *     actualTemperature: number,
 *     targetTemperature: number
 *   }
 * }
 * command.commandDetails are for DynamoDB item, and command.shadowDetails are for sending data to device.
 */
class HVACCommandStrategy {
    constructor(command) {
        this.command = command;
    }

    toString() {
        return JSON.stringify(this.command);
    }

    validate() {
        let isCommandValid = true;
        let command = this.command;

        if (command.commandDetails === undefined
            || command.shadowDetails === undefined
            || commandModes.indexOf(command.commandDetails.command) < 0
            || powerStatuses.indexOf(command.shadowDetails.powerStatus) < 0
            || isNaN(command.shadowDetails.targetTemperature)
            || command.shadowDetails.targetTemperature < 50
            || command.shadowDetails.targetTemperature > 110) {
            isCommandValid = false
        } else {
            if (command.commandDetails.command === 'set-temp') {
                if (isNaN(command.commandDetails.value)) {
                    isCommandValid = false;
                } else {
                    // Fix temperature precision, only keeps 2 precisions
                    let targetTemperature = parseFloat(command.shadowDetails.targetTemperature).toFixed(2);
                    if (parseInt(targetTemperature.slice(targetTemperature.indexOf('.') + 1)) === 0) {
                        targetTemperature = parseFloat(command.shadowDetails.targetTemperature).toFixed(0);
                    }
                    command.shadowDetails.targetTemperature = targetTemperature;
                    command.commandDetails.value = targetTemperature;
                }
            }
        }
        return isCommandValid;
    }

    getDetails() {
        return {
            command: this.command.commandDetails.command,
            value: this.command.commandDetails.value
        }
    }

    getShadowDetails() {
        return {
            powerStatus: this.command.shadowDetails.powerStatus,
            actualTemperature: this.command.shadowDetails.actualTemperature,
            targetTemperature: this.command.shadowDetails.targetTemperature
        }
    }
}

module.exports = HVACCommandStrategy;