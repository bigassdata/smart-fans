'use strict';

let lookup =
{
    'test-model': 'SmartProduct',
    'sim-fan': 'SimulatedFan'
}

function getThingType(modelNumber) {
    let thingTypeName = lookup[modelNumber];

    if (!thingTypeName) {
        throw new Error(`Unknown model number ${modelNumber}.  Associate with a thingType in ${__filename}`);
    }

    return thingTypeName;
}

module.exports = getThingType;