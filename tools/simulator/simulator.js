const awsIot = require('aws-iot-device-sdk');
const colors = require('colors');
const config = require('./config.js');
const moment = require('moment');
const uuid = require('uuid');

const appConfig = config.getAppConfig();

const thingName = appConfig.thingName;
const telemetryTopic = `${config.telemetryTopic}/${thingName}`;
const eventTopic = `${config.eventTopic}/${thingName}`;
const commandTopic = `smartfans/commands/${thingName}`;
console.log(`Shadow Params : ${JSON.stringify(config.getShadowParams())}`)
const device = awsIot.thingShadow(config.getShadowParams());

const temperatureChange = appConfig.temperatureChange;
const publishInterval = appConfig.publishInterval;
const statusInterval = appConfig.statusInterval;

let actualTemperature = 30;
let autoIdealTemperature = 71.5;
let flag = false;
let clientToken;

// OFF
const randomTemperature = () => {
    let plusOrMinus = Math.random() < 0.5 ? -1 : 1;
    return Math.round(100 * (actualTemperature + temperatureChange * plusOrMinus)) / 100;
}

// HEAT
const increaseTemperature = () => {
    return Math.round(100 * (actualTemperature + temperatureChange)) / 100;
}

// AC
const decreaseTemperature = () => {
    return Math.round(100 * (actualTemperature - temperatureChange)) / 100;
}

// Controller Initial State
// TODO: userPasscode and adminPasscode values ommitted for now.
let controllerState = {
    instanceNumber: "3FFFFF",
    autoIdealTemperature: 23.3,
    actualTemperature: actualTemperature,
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
}

// Publish event topic
// const publishEvent = (type, message, value) => {
//     let currentTime = moment();
//     let event = {
//         deviceId: thingName,
//         messageId: uuid.v4(),
//         message: message,
//         details: {
//             eventId: `event_${currentTime.valueOf()}`,
//             sensorId: 'sensor-id',
//             sensor: 'nice sensor',
//             value: value,
//         },
//         timestamp: currentTime.valueOf(),
//         type: type,
//         sentAt: currentTime.format(),
//     };

//     device.publish(eventTopic, JSON.stringify(event));
//     console.log('Event published '.gray + JSON.stringify(event) + ' to AWS IoT Event topic.'.gray);
// }

// Run and publish telemetry topic
const run = () => {
    let currentTime = moment();

    let context = {
        createdAt: currentTime.format(),
        deviceId: thingName,
        sentAt: currentTime.format(),
        timestamp: currentTime.valueOf()
    }

    let message = JSON.stringify({
        ...context,
        ...controllerState
    });
    device.publish(telemetryTopic, message);
    console.log('Telemetry published '.gray + message.white + ' to AWS IoT Telemetry.'.gray);
}

// Report state
const reportState = () => {
    try {
        let stateObject = {
            state: {
                reported: {
                    ...controllerState
                }
            }
        };
        clientToken = device.update(thingName, stateObject);
        if (clientToken === null) {
            console.log('ERROR: Reporting state failed, operation still in progress'.red);
        }
    } catch (err) {
        console.log('ERROR: Unknown error reporting state.'.red);
    }
}

console.log('Connecting to AWS IoT...'.blue);

// Connect
// TODO: If we are connecting for a second time, we should be able to get
// the whole document.  This will include the last thing we reported, the desired state,
// and the delta.  This allows us to "catch up" with changes when we reconnect.
// See https://github.com/aws/aws-iot-device-sdk-js/issues/100 for more.
device.on('connect', function () {
    console.log('Connected to AWS IoT.'.blue);
    device.register(thingName, {}, function () {
        // TODO: Set Initial State
        let stateObject = {
            state: {
                desired: {
                    ...controllerState
                }
            }
        };
        clientToken = device.update(thingName, stateObject);
        if (clientToken === null) {
            console.log('ERROR: Reporting state failed, operation still in progress'.red);
        }
    });

    setInterval(run, publishInterval);
    setInterval(reportState, statusInterval);

    device.subscribe(commandTopic);
});

// Publish command
device.on('message', function (commandTopic, payload) {
    if (flag) {
        let message = JSON.parse(payload.toString());

        // Publish to the topic.
        let reason = 'success';
        let status = 'success';
        let body = JSON.stringify({
            commandId: message.commandId,
            deviceId: thingName,
            reason: reason,
            status: status,
        });
        try {
            device.publish(commandTopic, body);
            console.log('Published '.gray + JSON.stringify(body).yellow + 'to AWS IoT Command Topic.'.gray);
        } catch (err) {
            console.log('ERROR to publish command topic: '.red, err);
        } finally {
            flag = false;
        }
    }
});

// Get state
device.on('status', function (thingName, stat, clientToken, stateObject) {
    if (stateObject.state.reported === undefined) {
        console.log('Cannot find reported state.'.red);
    } else {
        console.log(
            'Reported current state: '.gray,
            JSON.stringify(stateObject.state.reported).gray
        );
    }
});

// Get delta, and change state
// TODO: What does this look like?  Apply the changes
device.on('delta', function (thingName, stateObject) {
    console.log(
        `Delta recieved for ${thingName}: `.gray,
        JSON.stringify(stateObject)
    );

    let change = false;
    try {


        if (change) {
            flag = true;
        }
    } catch (err) {
        publishEvent('diagnostic', `An error occurred ${JSON.stringify(err)}`);
        console.log('ERROR to set shadow.'.red);
        console.log('Error:', err);
    }
});

