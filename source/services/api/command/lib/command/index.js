/*********************************************************************************************************************
 *  Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.                                           *
 *                                                                                                                    *
 *  Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance    *
 *  with the License. A copy of the License is located at                                                             *
 *                                                                                                                    *
 *      http://www.apache.org/licenses/LICENSE-2.0                                                                    *
 *                                                                                                                    *
 *  or in the 'license' file accompanying this file. This file is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES *
 *  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions    *
 *  and limitations under the License.                                                                                *
 *********************************************************************************************************************/

/**
 * @author Solution Builders
 */

'use strict';

const Logger = require('logger');
const moment = require('moment');
const AWS = require('aws-sdk');
const _ = require('lodash');
const uuidv4 = require('uuid/v4');
const UsageMetrics = require('usage-metrics');
const CommonUtils = require('utils');
const CommandStrategy = require('./commandStrategy');

/**
 * Performs command actions for a user, such as, retrieving and logging device command information.
 *
 * @class Command
 */
class Command {
  /**
   * @class Command
   * @constructor
   */
  constructor() {
    this.creds = new AWS.EnvironmentCredentials('AWS'); // Lambda provided credentials
    this.dynamoConfig = {
      credentials: this.creds,
      region: process.env.AWS_REGION,
    };
    this.commonUtils = new CommonUtils();
  }

  /**
   * Gets list of commands for the device.
   * @param {JSON} ticket - authorization ticket.
   * @param {string} deviceId - unique identifier for the device
   * @param {string} lastevalkey - a serializable JavaScript object representing last evaluated key
   * @param {string} commandStatus - command status to filter
   */
  async getCommands(ticket, lastevalkey, deviceId, commandStatus) {
    try {
      let validRegistration = await this._validateUserDeviceRegistration(
        deviceId,
        ticket.sub
      );

      if (validRegistration) {
        let commands = await this._getCommandsPage(deviceId, lastevalkey, commandStatus, 0);
        return Promise.resolve(commands);
      } else {
        Logger.error(
          Logger.levels.INFO,
          `[MissingRegistration] No registration found for device ${deviceId}.`
        );
        return Promise.reject({
          code: 400,
          error: 'MissingRegistration',
          message: `No registration found for device "${deviceId}".`,
        });
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * Get specific commands page for the device.
   * @param {string} deviceId - unique identifier for the device
   * @param {string} lastevalkey - a serializable JavaScript object representing last evaluated key
   * @param {string} commandStatus - command status to filter
   * @param {number} length - a length of commands
   */
  async _getCommandsPage(deviceId, lastevalkey, commandStatus, length) {
    let _keyConditionExpression = 'deviceId = :did';
    let _expressionAttributeValues = {
      ':did': deviceId,
    };
    let _expressionAttributeNames = '';

    /**
     * DynamoDB FilterExpression
     * If there are query parameters, add the value to the filter expression.
     */
    let _filterExpression = '';

    // Filters with command status
    if (commandStatus !== undefined
      && commandStatus.trim() !== '') {
      _filterExpression = '#status = :commandStatus';
      _expressionAttributeValues[':commandStatus'] = commandStatus.trim();
      // params.ExpressionAttributeNames = {
      _expressionAttributeNames = {
        '#status': 'status'
      };
    }

    let params = this.commonUtils.generateDynamoDBQueryParams(
      process.env.COMMANDS_TBL,
      _keyConditionExpression,
      _expressionAttributeValues,
      _expressionAttributeNames,
      _filterExpression,
      'deviceId-updatedAt-index',
      false,
      lastevalkey
    );

    let commands = [];
    let docClient = new AWS.DynamoDB.DocumentClient(this.dynamoConfig);
    try {
      let result = await docClient.query(params).promise();
      commands = result.Items;
      length += commands.length;

      // In case the result is less than 20 in total due to FilterExpression, call the method again with LastEvaluatedKey.
      if (length < 20
        && result.LastEvaluatedKey) {
        lastevalkey = result.LastEvaluatedKey;
        try {
          let data = await this._getCommandsPage(deviceId, lastevalkey, commandStatus, length);
          commands = [...commands, ...data.Items];
          result.LastEvaluatedKey = data.LastEvaluatedKey;
        } catch (err) {
          return Promise.reject(err);
        }
      }

      result.Items = commands;
      result.commandStatus = commandStatus;
      return Promise.resolve(result);
    } catch (err) {
      Logger.error(Logger.levels.INFO, err);
      return Promise.reject({
        code: 500,
        error: 'CommandQueryFailure',
        message: `Error occurred while attempting to retrieve commands for device "${deviceId}".`,
      });
    }
  }

  /**
   * Retrieves a command for a device.
   * @param {JSON} ticket - authentication ticket
   * @param {string} deviceId - id of device to retrieve
   * @param {string} commandId - id of the command to retrieve
   */
  async getCommand(ticket, deviceId, commandId) {
    const params = {
      TableName: process.env.COMMANDS_TBL,
      Key: {
        deviceId: deviceId,
        commandId: commandId,
      },
    };

    const docClient = new AWS.DynamoDB.DocumentClient(this.dynamoConfig);
    try {
      // Change to get Registration information.  Need model-number to validate
      // the command based on the type of the device.
      let validRegistration = await this._validateUserDeviceRegistration(
        deviceId,
        ticket.subs
      );

      if (validRegistration) {
        let data = await docClient.get(params).promise();
        if (!_.isEmpty(data)) {
          return Promise.resolve(data.Item);
        } else {
          return Promise.reject({
            code: 400,
            error: 'MissingCommand',
            message: `The command "${commandId}" for device "${deviceId}" does not exist.`,
          });
        }
      } else {
        Logger.error(
          Logger.levels.INFO,
          `[MissingRegistration] No registration found for device ${deviceId}.`
        );
        return Promise.reject({
          code: 400,
          error: 'MissingRegistration',
          message: `No registration found for device "${deviceId}".`,
        });
      }
    } catch (err) {
      Logger.error(Logger.levels.INFO, err);
      Logger.error(
        Logger.levels.INFO,
        `Error occurred while attempting to retrieve command ${commandId} for device ${deviceId}.`
      );
      return Promise.reject({
        code: 500,
        error: 'CommandRetrieveFailure',
        message: `Error occurred while attempting to retrieve command "${commandId}" for device "${deviceId}".`,
      });
    }
  }

  /**
   * Creates a device command for user.
   *
   * Note that it validates registration of the device first in
   * order to determine modelNumber.  This is used to determine
   * the appropriate command structure.
   *
   * @param {JSON} ticket - authentication ticket
   * @param {string} deviceId - id of device to retrieve
   * @param {JSON} command - device command object
   *
   *
   * CommandStrategy
   * - validate (return true/false)
   * - getDetails - get the command Details
   * - getShadowDetails - get the shadow update object
   */
  async createCommand(ticket, deviceId, command) {

    let validRegistration = false;
    let deviceRegistration = null;

    try {
      deviceRegistration = await this._getUserDeviceRegistration(
        deviceId,
        ticket.sub
      );

      validRegistration = !_.isEmpty(deviceRegistration);

      if (validRegistration) {

        let modelNumber = _.get(deviceRegistration, 'Item.modelNumber', null);
        if (!modelNumber) {
          throw new Error(`Invalid registration record.  No modelNumber for ${deviceId}`);
        }

        let commandStrategy = CommandStrategy(modelNumber, command);
        let isCommandValid = commandStrategy.validate();

        if (!isCommandValid) {
          return Promise.reject({
            code: 400,
            error: 'InvalidParameter',
            message: `Body parameters are invalid. Please check the API specification.`
          });
        }

        let docClient = new AWS.DynamoDB.DocumentClient(this.dynamoConfig);

        let _command = {
          commandId: uuidv4(),
          deviceId: deviceId,
          status: 'pending',
          details: commandStrategy.getDetails(),
          userId: ticket.sub,
          createdAt: moment().utc().format(),
          updatedAt: moment().utc().format(),
        };

        let params = {
          TableName: process.env.COMMANDS_TBL,
          Item: _command,
        };

        await docClient.put(params).promise();

        let shadowDetails = commandStrategy.getShadowDetails();

        await this.shadowUpdate(_command, shadowDetails); //best practise to update device shadow
        await this.publishCommand(_command, shadowDetails); //publish on IoT topic for the device

        // Sends anonymous metric data
        const anonymousData = process.env.anonymousData;
        const solutionId = process.env.solutionId;
        const solutionUuid = process.env.solutionUuid;

        if (anonymousData === 'true') {
          let metric = {
            Solution: solutionId,
            UUID: solutionUuid,
            Timestamp: moment().utc().format('YYYY-MM-DD HH:mm:ss.S'),
            RemoteCommands: 1,
          };

          let usageMetrics = new UsageMetrics();
          try {
            await usageMetrics.sendAnonymousMetric(metric);
          } catch (e) {
            Logger.error(Logger.levels.INFO, e);
          }
        }

        return Promise.resolve(_command);
      } else {
        Logger.error(
          Logger.levels.INFO,
          `[MissingRegistration] No registration found for device ${deviceId}.`
        );
        return Promise.reject({
          code: 400,
          error: 'MissingRegistration',
          message: `No registration found for device "${deviceId}".`,
        });
      }
    } catch (err) {
      Logger.error(Logger.levels.INFO, err);
      Logger.error(
        Logger.levels.INFO,
        `[CommandCreateFailure] Error occurred while attempting to create command for device ${deviceId}.`
      );
      return Promise.reject({
        code: 500,
        error: 'CommandCreateFailure',
        message: `Error occurred while attempting to create command for device "${deviceId}".`,
      });
    }
  }

  /**
   * Updates device shadow with desired state
   * @param {JSON} command - device command object
   * @param {JSON} shadowDetails - shadow detail object
   *
   * TODO: Specific to ThingType?
   */
  async shadowUpdate(command, shadowDetails) {
    try {
      const _deviceId = command.deviceId;
      const iot = new AWS.Iot({
        region: process.env.AWS_REGION,
      });
      const _endP = await iot.describeEndpoint().promise();

      // Step 1. getShadow version number
      const iotdata = new AWS.IotData({
        endpoint: _endP.endpointAddress,
        apiVersion: '2015-05-28',
      });
      const _shadow = await iotdata
        .getThingShadow({ thingName: _deviceId })
        .promise();
      Logger.log(
        Logger.levels.ROBUST,
        JSON.stringify(`current shadow document: ${_shadow.payload}`)
      );

      //Step 2. update shadow with desired state from command
      const _payload = {
        state: {
          desired: shadowDetails,
        },
      };

      const result = await iotdata
        .updateThingShadow({
          thingName: _deviceId,
          payload: JSON.stringify(_payload),
        })
        .promise();
      Logger.log(
        Logger.levels.ROBUST,
        JSON.stringify(`shadow update response: ${JSON.stringify(result)}`)
      );

      return Promise.resolve(result);
    } catch (err) {
      Logger.error(Logger.levels.INFO, err);
      Logger.error(
        Logger.levels.INFO,
        `[DeviceShadowUpdateFailure] Error occurred while attempting to update device shadow for command ${
        command.deviceId
        }.`
      );
      return Promise.reject({
        code: 500,
        error: 'DeviceShadowUpdateFailure',
        message: `Error occurred while attempting to update device shadow for command "${command.deviceId}".`,
      });
    }
  }

  /**
   * Publishes command on IoT topic
   * @param {JSON} command - device command object
   * @param {JSON} shadowDetails - shadow detail object
   */
  async publishCommand(command, shadowDetails) {
    try {
      const iot = new AWS.Iot({
        region: process.env.AWS_REGION,
      });
      const _endP = await iot.describeEndpoint().promise();

      const iotdata = new AWS.IotData({
        endpoint: _endP.endpointAddress,
        apiVersion: '2015-05-28',
      });

      let _command = {
        commandId: command.commandId,
        deviceId: command.deviceId,
        status: command.status,
        details: shadowDetails,
      };

      const _result = await iotdata
        .publish({
          topic: `smartproduct/commands/${command.deviceId}`,
          payload: JSON.stringify(_command),
        })
        .promise();
      Logger.log(
        Logger.levels.ROBUST,
        JSON.stringify(`command publish response: ${JSON.stringify(_result)}`)
      );

      return Promise.resolve(_result);
    } catch (err) {
      Logger.error(Logger.levels.INFO, err);
      Logger.error(
        Logger.levels.INFO,
        `[CommandPublishFailure] Error occurred while attempting to publish command ${command.commandId}.`
      );
      return Promise.reject({
        code: 500,
        error: 'CommandPublishFailure',
        message: `Error occurred while attempting to publish command "${command.commandId}".`,
      });
    }
  }

  /**
   * Validates device is registered to user.
   * @param {string} deviceId - id of device to retrieve
   * @param {string} userId - id of the user to retrieve
   */
  async _validateUserDeviceRegistration(deviceId, userId) {
    let params = {
      TableName: process.env.REGISTRATION_TBL,
      Key: {
        userId: userId,
        deviceId: deviceId,
      },
    };

    const docClient = new AWS.DynamoDB.DocumentClient(this.dynamoConfig);
    try {
      let data = await docClient.get(params).promise();
      if (!_.isEmpty(data)) {
        return Promise.resolve(true);
      } else {
        return Promise.resolve(false);
      }
    } catch (err) {
      Logger.error(Logger.levels.INFO, err);
      Logger.error(
        Logger.levels.INFO,
        `[RegistrationRetrieveFailure] Error occurred while attempting to retrieve registration information for device ${deviceId}.`
      );
      return Promise.reject({
        code: 500,
        error: 'RegistrationRetrieveFailure',
        message: `Error occurred while attempting to retrieve registration information for device "${deviceId}".`,
      });
    }
  }

  /**
   * Retrieves device registration information for the user.
   * @param {string} deviceId - id of device to retrieve
   * @param {string} userId - id of the user to retrieve
   *
   * TODO: Catch exceptions/promise rejections
   * FIXME: I think something is wrong here.
   */
  async _getUserDeviceRegistration(deviceId, userId) {
    let params = {
      TableName: process.env.REGISTRATION_TBL,
      Key: {
        userId: userId,
        deviceId: deviceId,
      },
    };

    const docClient = new AWS.DynamoDB.DocumentClient(this.dynamoConfig);
    let data = await docClient.get(params).promise();
    return Promise.resolve(data);
  }
}

module.exports = Command;
