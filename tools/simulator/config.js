function getAppConfig() {
    const dotenv = require('dotenv');
    const result = dotenv.config();

    if (result.error) {
        throw result.error;
    }

    const serialNumber = result.parsed.SERIAL_NUMBER;

    return {
        thingName: serialNumber,
        publishInterval: 10000, // 10 seconds by default
        statusInterval: 30000, // 30 seconds by default
        temperatureChange: 0.5
    }
};

function getShadowParams() {
    const dotenv = require('dotenv');
    const result = dotenv.config();

    if (result.error) {
        throw result.error;
    }

    const serialNumber = result.parsed.SERIAL_NUMBER;
    const host = result.parsed.IOT_HOST;

    return {
        keyPath: 'certs/deviceCert.key',
        certPath: 'certs/deviceCertAndCACert.crt',
        caPath: 'certs/root.cert',
        clientId: serialNumber,
        host: host,
    };
};
const telemetryTopic = 'smartfans/telemetry';
const eventTopic = 'smartfans/event';



module.exports = {
    getAppConfig,
    getShadowParams,
    telemetryTopic,
    eventTopic,
};
