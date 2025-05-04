'use strict';

const AWS = require('aws-sdk');
const { formatResponse } = require('../utils/response');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async () => {
  try {
    const params = {
      TableName: process.env.TODOS_TABLE,
    };

    // Quét toàn bộ bảng để lấy danh sách todos
    const result = await dynamoDb.scan(params).promise();

    return formatResponse(200, result.Items);
  } catch (error) {
    console.error('List error:', error);
    return formatResponse(500, { error: 'Could not fetch the todo items' });
  }
};