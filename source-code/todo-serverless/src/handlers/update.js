'use strict';

const AWS = require('aws-sdk');
const { formatResponse } = require('../utils/response');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event) => {
  try {
    const data = JSON.parse(event.body);
    const timestamp = new Date().getTime();
    
    // Kiểm tra todo tồn tại
    const getParams = {
      TableName: process.env.TODOS_TABLE,
      Key: {
        id: event.pathParameters.id,
      },
    };
    
    const todoExists = await dynamoDb.get(getParams).promise();
    
    if (!todoExists.Item) {
      return formatResponse(404, { error: 'Todo not found' });
    }

    // Cập nhật todo
    const params = {
      TableName: process.env.TODOS_TABLE,
      Key: {
        id: event.pathParameters.id,
      },
      ExpressionAttributeNames: {
        '#todo_title': 'title',
        '#todo_description': 'description',
        '#todo_completed': 'completed',
      },
      ExpressionAttributeValues: {
        ':title': data.title || todoExists.Item.title,
        ':description': data.description || todoExists.Item.description,
        ':completed': data.completed !== undefined ? data.completed : todoExists.Item.completed,
        ':updatedAt': timestamp,
      },
      UpdateExpression: 'SET #todo_title = :title, #todo_description = :description, #todo_completed = :completed, updatedAt = :updatedAt',
      ReturnValues: 'ALL_NEW',
    };

    const result = await dynamoDb.update(params).promise();

    return formatResponse(200, result.Attributes);
  } catch (error) {
    console.error('Update error:', error);
    return formatResponse(500, { error: 'Could not update the todo item' });
  }
};