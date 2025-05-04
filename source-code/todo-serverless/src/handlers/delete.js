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

    // Kiểm tra todo tồn tại
    const todoExists = await dynamoDb.get(params).promise();
    
    if (!todoExists.Item) {
      return formatResponse(404, { error: 'Todo not found' });
    }

    // Xóa todo
    await dynamoDb.delete(params).promise();

    return formatResponse(200, { message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    return formatResponse(500, { error: 'Could not delete the todo item' });
  }
};