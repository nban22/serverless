'use strict';

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const { formatResponse } = require('../utils/response');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event) => {
  try {
    const data = JSON.parse(event.body);
    
    // Kiểm tra dữ liệu đầu vào
    if (!data.title) {
      return formatResponse(400, { error: 'Title is required' });
    }

    const timestamp = new Date().getTime();
    const params = {
      TableName: process.env.TODOS_TABLE,
      Item: {
        id: uuidv4(),
        title: data.title,
        description: data.description || '',
        completed: false,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    };

    // Thêm todo vào DynamoDB
    await dynamoDb.put(params).promise();

    return formatResponse(201, params.Item);
  } catch (error) {
    console.error('Create error:', error);
    return formatResponse(500, { error: 'Could not create the todo item' });
  }
};