# Commands

A valid command in the reference architecture looks like this:

```
      let invalidCommand = {
        deviceId: '42adad4d-fdd1-4db0-a501-61cffd0fa3e4',
        commandId: '82bfgd4y-uu81-io10-a602-56cnb0fhs34',
        createdAt: '2018-02-06T20:57:48Z',
        shadowDetails: {
          powerStatus: 'HEAT',
          actualTemperature: 60,
          targetTemperature: 70,
        },
        commandDetails: {
          command: 'set-temp',
          value: 70,
        },
        userId: '085e4e22-bd06-4ca6-b913-8b0b6bf154c1',
        status: 'pending',
        updatedAt: '2018-02-06T20:57:48Z',
      };
```

If we adopt the same structure for the POC, we need to define a number of commands, and their appropriate sytnax.

It may make more sense just to generate the partial state, but to stay consistent with the ref architecture, we will stick with this for now.

**set-ztt-deviceType** - value: string
```
{
    commandDetails: {
        command: 'set-ztt-deviceType',
        value: 'Essence'
    },
    shadowDetails: {
        zeroToTen:{
            deviceType: "Essence"
        }
    }
}
```

**set-ztt-power** -  value: boolean
```
{
    commandDetails: {
        command: 'set-ztt-power',
        value: true
    },
    shadowDetails: {
        zeroToTen:{
            power: true
        }
    }
}
```

**set-ztt-autoEnable** - value: boolean
```
{
    commandDetails: {
        command: 'set-ztt-autoEnable',
        value: true
    },
    shadowDetails: {
        zeroToTen:{
            autoEnable: true
        }
    }
}
```

**set-ztt-levelPercent** - value: float
```
{
    commandDetails: {
        command: 'set-ztt-levelPercent',
        value: 80.2
    },
    shadowDetails: {
        zeroToTen:{
            levelPercent: 80.2
        }
    }
}
```

**set-autoIdealTemperature** - value: float
```
{
    commandDetails: {
        command: 'set-autoIdealTemperature',
        value: 25.2
    },
    shadowDetails: {
        autoIdealTemperature: 25.2
    }
}
```

**set-fan-power** - value: boolean, address: int
```
{
    commandDetails: {
        command: 'set-fan-power',
        value: true,
        address: 4
    },
    shadowDetails: {
        fans: {
            4: {
                power: true
            }
        }
    }
}
```

**set-fan-commandedSpeedPercent** - value: float, address: int
```
{
    commandDetails: {
        command: 'set-fan-commandedSpeedPercent',
        value: 99.1,
        address: 4
    },
    shadowDetails: {
        fans: {
            4: {
                commandedSpeedPercent: 99.1
            }
        }
    }
}
```

**set-fan-isForward** - value, boolean, address: int
```
{
    commandDetails: {
        command: 'set-fan-isForward',
        value: true,
        address: 4
    },
    shadowDetails: {
        fans: {
            4: {
                isForward: true
            }
        }
    }
}
```

**set-fan-resetFaults** - address:int
```
{
    commandDetails: {
        command: 'set-fan-resetFaults',
        address: 4
    },
    shadowDetails: {
        fans: {
            4: {
                resetFaults: true
            }
        }
    }
}
```

**set-fan-autoEnable** - value, boolean, address: int
```
{
    commandDetails: {
        command: 'set-fan-autoEnable',
        value: true,
        address: 4
    },
    shadowDetails: {
        fans: {
            4: {
                autoEnable: true
            }
        }
    }
}
```