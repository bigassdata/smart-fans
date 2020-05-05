'use strict';

const expect = require('chai').expect;

const lib = require('./index.js');
let event = {};

// TODO: Update for fan controllers
const successData = [
  {
    deviceId: '9fd6fd62-0b10-4b5c-a7a1-5995c81db07e',
    instanceNumber: "3FFFFF",
    zeroToTen: {
      deviceType: "Essence",
      power: true,
      autoEnable: false,
      levelPercent: 20.5
    },
    autoIdealTemperature: 21.11,
    actualTemperature: 7.64,
    sentAt: '2019-05-01T12:43:07-07:00',
    createdAt: '2019-05-01T12:43:07-07:00',
    timestamp: 1556739787113,
    sentAtUtc: '2019-05-01T19:43:07.113Z',
    createdAtUtc: '2019-05-01T19:43:07.113Z',
  },
  {
    deviceId: '9fd6fd62-0b10-4b5c-a7a1-5995c81db07e',
    instanceNumber: "3FFFFF",
    zeroToTen: {
      deviceType: "Essence",
      power: true,
      autoEnable: false,
      levelPercent: 20.5
    },
    autoIdealTemperature: 21.11,
    actualTemperature: 8.06,
    createdAt: '2019-05-01T12:43:17-07:00',
    sentAt: '2019-05-01T12:43:17-07:00',
    timestamp: 1556739797117,
    sentAtUtc: '2019-05-01T19:43:17.117Z',
    createdAtUtc: '2019-05-01T19:43:17.117Z',
  },
  {
    deviceId: '9fd6fd62-0b10-4b5c-a7a1-5995c81db07e',
    instanceNumber: "3FFFFF",
    zeroToTen: {
      deviceType: "Essence",
      power: true,
      autoEnable: false,
      levelPercent: 20.5
    },
    autoIdealTemperature: 21.11,
    actualTemperature: 8.47,
    createdAt: '2019-05-01T12:43:27-07:00',
    sentAt: '2019-05-01T12:43:27-07:00',
    timestamp: 1556739807117,
    sentAtUtc: '2019-05-01T19:43:27.117Z',
    createdAtUtc: '2019-05-01T19:43:27.117Z',
  },
];

describe('Index', () => {
  beforeEach(() => { });

  it('should return event messages with UTC time if keys exist', (done) => {
    event = [
      {
        deviceId: '9fd6fd62-0b10-4b5c-a7a1-5995c81db07e',
        instanceNumber: "3FFFFF",
        zeroToTen: {
          deviceType: "Essence",
          power: true,
          autoEnable: false,
          levelPercent: 20.5
        },
        autoIdealTemperature: 21.11,
        actualTemperature: 7.64,
        createdAt: '2019-05-01T12:43:07-07:00',
        sentAt: '2019-05-01T12:43:07-07:00',
        timestamp: 1556739787113,
      },
      {
        deviceId: '9fd6fd62-0b10-4b5c-a7a1-5995c81db07e',
        instanceNumber: "3FFFFF",
        zeroToTen: {
          deviceType: "Essence",
          power: true,
          autoEnable: false,
          levelPercent: 20.5
        },
        autoIdealTemperature: 21.11,
        actualTemperature: 8.06,
        createdAt: '2019-05-01T12:43:17-07:00',
        sentAt: '2019-05-01T12:43:17-07:00',
        timestamp: 1556739797117,
      },
      {
        deviceId: '9fd6fd62-0b10-4b5c-a7a1-5995c81db07e',
        instanceNumber: "3FFFFF",
        zeroToTen: {
          deviceType: "Essence",
          power: true,
          autoEnable: false,
          levelPercent: 20.5
        },
        autoIdealTemperature: 21.11,
        actualTemperature: 8.47,
        createdAt: '2019-05-01T12:43:27-07:00',
        sentAt: '2019-05-01T12:43:27-07:00',
        timestamp: 1556739807117,
      },
    ];

    lib
      .process(event)
      .then(data => {
        expect(data).to.deep.equal(successData);
        done();
      })
      .catch(err => {
        done(err);
      });
  });
});
