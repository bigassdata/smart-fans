'use strict';
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const SmartProduct = require('./thingTypes/smartProduct');
const SimController = require('./thingTypes/simController');


let Device; // Assign the constructor to Device

// TODO: Create CLI to choose device directory
let deviceDir = '/c/projects/smart-fans/tools/devices/86586301-db6e-48bc-9c1d-27f0d2f8aa7e';

console.log(`Getting device properties from ${deviceDir}`);

let properties = '';
try {
    properties = getDeviceProperties(deviceDir);
    console.log(`Retreived properties: ${JSON.stringify(properties)}`);
} catch (err) {
    console.error(`Error loading device properties: ${err}`);
}

switch (properties.MODEL_NUMBER) {
    case 'test-model':
        Device = SmartProduct;
        break;
    case 'sim-controller':
        Device = SimController;
        break;
    default:
        console.warn(`Unknown MODEL NUMBER: ${properties.MODEL_NUMBER}.`);
        process.exit(1);
        break;
}

let device = new Device(deviceDir, properties);
device.run();


function getDeviceProperties(devicePath) {

    // Check for proper paths and files
    if (!fs.existsSync(devicePath)) {
        throw new Error(`The path for the device configuration does not exist. ${devicePath}`);
    }

    let envFilePath = path.join(devicePath, '.env');

    if (!fs.existsSync(envFilePath)) {
        throw new Error(`The .env file does not exist @ ${devicePath}`);
    }

    // Read the .env file @ this.devicePath
    let envContents = fs.readFileSync(envFilePath);

    // Parse the .env file to retrieve properties
    let parseResults = dotenv.parse(envContents);
    console.log(`[debug] parseResults = ${JSON.stringify(parseResults)} `);

    if (parseResults.error) {
        throw parseResults.error;
    }

    return parseResults;
}