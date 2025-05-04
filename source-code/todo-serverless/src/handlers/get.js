'use strict';

const AWS = require('aws-sdk');
const { formatResponse } = require('../utils/response');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event) => {
  try {
    const params = {
      TableName: process.env.TODOS_TABLE,
      Key: {
        id: event.pathParameters.id,
      },
    };

    // Lấy todo theo ID
    const result = await dynamoDb.get(params).promise();

    if (!result.Item) {
      return formatResponse(404, { error: 'Todo not found' });
    }

    return formatResponse(200, result.Item);
  } catch (error) {
    console.error('Get error:', error);
    return formatResponse(500, { error: 'Could not fetch the todo item' });
  }
};