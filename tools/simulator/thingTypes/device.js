'use strict';

const path = require('path');
const awsIot = require('aws-iot-device-sdk');
const colors = require('colors');
// Required to publish Event
const moment = require('moment');
const uuid = require('uuid');

const publishInterval = 10000; // Every 10 seconds
const statusInterval = 30000;  // Every 30 seconds

// TODO: Load from global configuration
const COMMAND_TOPIC = 'smartproduct/commands';
const TELEMETRY_TOPIC = 'smartfans/telemetry';
const EVENT_TOPIC = 'smartfans/event';

/**
 * Simulates an IoT device.
 */
class Device {
    /**
     * Simulate a device using the configuration and certificate files at `path`.
     *
     * properties include properties from the .env file.  Base properties include
     * - SERIAL_NUMBER - Unique identifier, used as the thing name in IoT
     * - MODEL_NUMBER - Used to determine type, and possibly device subclass
     * - IOT_HOST - The IoT endpoint to call
     *
     * Required files include:
     * - .env file
     * - keyFile e.g. deviceCert.key
     * - crt file e.g. deviceCertAndCACert.crt
     * - CA cert e.g. root.cert
     *
     * Methods to override in subsclasses
     * - run - Publish to telemetry and trigger events
     * - onChange - Logic when changes are published to shadow
     * - getCurrentState - Provide device state for reporting to the cloud.
     *
     * @param {String} path - the directory with the required device files
     */
    constructor(path, properties) {

        this.isInitialized = false;
        // Used for testing
        if (properties.offline && properties.offline == true) {
            return;
        }

        if (path == null) {
            console.error('[Device constructor] path is null');
            throw new Error('[Device constructor] path is null');
        }

        if (properties == null) {
            console.error('[Device constructor] properties is null.');
            throw new Error('[Device constructor] properties is null.');
        }

        this.devicePath = path;

        // Assign the properties to instance members
        this.serialNumber = properties.SERIAL_NUMBER;
        this.modelNumber = properties.MODEL_NUMBER;
        this.iotEndpoint = properties.IOT_HOST;

        if (this.serialNumber == null ||
            this.modelNumber == null ||
            this.iotEndpoint == null) {

            console.error('Configuration error.'.red);
            console.error(`.env parse results ${JSON.stringify(properties)}`.red);
            throw new Error('Configuration error. Either SERIAL_NUMBER, MODEL_NUMBER, or IOT_HOST is null.');
        }

        // Set device specific MQTT topic paths
        this.commandTopic = `${COMMAND_TOPIC}/${this.serialNumber}`;
        this.telemetryTopic = `${TELEMETRY_TOPIC}/${this.serialNumber}`;
        this.eventTopic = `${EVENT_TOPIC}/${this.serialNumber}`

        // Set initialized flag;
        this.isInitialized = true;

        // This flag is used to sync updates and command responses
        this.hasChanged = false;

        // Will be used by `connect` method.
        this.device = null;

        this.connect();

    }

    /**
     * Connects to AWS IoT using serialNumber as the clientId.
     * Registers listeners for `connect`, `message`, `status` and `delta`.
     */
    connect() {
        this.device = awsIot.thingShadow({
            keyPath: path.join(this.devicePath, 'deviceCert.key'),
            certPath: path.join(this.devicePath, 'deviceCertAndCACert.crt'),
            caPath: path.join(this.devicePath, 'root.cert'),
            clientId: this.serialNumber,
            region: 'us-east-1',
            host: this.iotEndpoint
        });

        this.statusInterval = statusInterval;
        this.publishInterval = publishInterval;

        console.log('Connecting to AWS IoT...'.blue);

        this.device.on('error', err => this.onError(err));
        this.device.on('status', (thingName, stat, clientToken, stateObject) => this.onStatus(thingName, stat, clientToken, stateObject));
        this.device.on('message', (commandTopic, payload) => this.onMessage(commandTopic, payload));
        this.device.on('delta', (thingName, stateObject) => this.onDelta(thingName, stateObject));

        this.device.register(
            this.serialNumber,
            {},
            (error, failedTopics) => this.onRegister(error, failedTopics)
        );

        setInterval(
            () => this.run(),
            publishInterval
        );

        setInterval(
            () => this.reportState(),
            statusInterval
        );

        this.device.subscribe(this.commandTopic);
    }

    /**
     * Publish an event to the Event MQTT topic.
     * @param {*} type
     * @param {*} message
     * @param {*} value
     */
    publishEvent(type, message, value) {
        let currentTime = moment();
        let event = {
            deviceId: this.serialNumber,
            messageId: uuid.v4(),
            message: message,
            details: {
                eventId: `event_${currentTime.valueOf()}`,
                sensorId: 'sensor-id',
                sensor: 'nice sensor',
                value: value,
            },
            timestamp: currentTime.valueOf(),
            type: type,
            sentAt: currentTime.format(),
        };

        this.device.publish(this.eventTopic, JSON.stringify(event));
        console.log('Event published '.gray + JSON.stringify(event) + ' to AWS IoT Event topic.'.gray);

    }

    onError(err) {
        console.error(`Device emitted error: ${err}`.red);
    }

    /**
     * Initiated from connect.  Updates the device with the starting state.
     * @param {*} error
     * @param {*} failedTopics
     */
    onRegister(error, failedTopics) {
        if (error) {
            console.error(`Error registering device: ${error}`.red);
            return;
        }

        if (failedTopics && failedTopics.length > 0) {
            console.warning(`The following topics failed to register ${failedTopics}`.yellow);
        }

        let stateObject = this.getCurrentState();

        let clientToken = this.device.update(this.serialNumber, stateObject);

        if (clientToken == null) {
            console.log(
                'ERROR: Reporting state failed, operation still in progress'.red
            );
        }
    }



    /**
     * Emitted when an operation update|get|delete completes.
     *
     * thingName - name of the Thing Shadow for which the operation has completed
     * stat - status of the operation accepted|rejected
     * clientToken - the operation"s clientToken
     * stateObject - the stateObject returned for the operation
     *
     * Applications can use clientToken values to correlate status events with
     * the operations that they are associated with by saving the clientTokens
     * returned from each operation.
     */
    onStatus(thingName, stat, clientToken, stateObject) {
        if (stateObject.state.reported === undefined) {
            console.log('Cannot find reported state.'.red);
        } else {
            console.log(
                'Reported current state: '.gray,
                JSON.stringify(stateObject.state.reported).gray
            );
        }
    }

    /**
     * Emitted when a message is received on a topic not related to
     * any Thing Shadows.
     *
     * Simulator looks for the `hasChanged` flag and publishes success
     * if the state has been updated.
     *
     */
    onMessage(commandTopic, payload) {
        // There has been a change, let's respond back
        if (this.hasChanged) {
            let message = JSON.parse(payload.toString());

            // Publish success to the topic
            let body = JSON.stringify({
                commandId: message.commandId,
                deviceId: this.serialNumber,
                reason: 'success',
                status: 'success'
            });

            try {
                this.device.publish(commandTopic, body);
                console.log('Published '.gray + JSON.stringify(body).yellow + 'to AWS IoT Command Topic.'.gray);
            } catch (err) {
                console.log('ERROR to publish command topic: '.red, err);
            } finally {
                this.hasChanged = false;
            }
        }
    }

    /**
     * Occurs when changes are added to the device shadow
     * @param {*} thingName
     * @param {*} stateObject
     */
    onDelta(thingName, stateObject) {
        let isDirty = false;
        try {
            isDirty = this.onChange(stateObject.state);

            if (isDirty) {
                // Set the device flag to publish command success
                this.hasChanged = true;
                this.reportState();
            }
        } catch (err) {
            this.publishEvent('diagnostic', `An error occurred ${JSON.stringify(err)}`);
            console.log('ERROR to set shadow.'.red);
            console.log('Error:', err);
        }

    }

    /**
     * Override this method to handle changes from the Device Shadow.
     * @param {Object} stateObject
     * @return {boolean} - true if changes were applied.
     */
    onChange(stateDelta) {
        return false;
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
        return {};
    }

    /**
     * A hook to apply changes to state before reporting.
     */
    beforeReportState() {

    }


    /**
     * Publish the device state.  Override `getCurrentState` to customize
     * how device state is published.
     *
     * Occurs every `statusInterval` and in response to changes.
     *
     * Use `beforeReportState` to make time-based changes before publishing.
     *
     * @example
     * clientToken = this.device.update(this.serialNumber, stateObject);
     */
    reportState() {
        // Trigger the hook
        this.beforeReportState();

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
}

module.exports = Device;