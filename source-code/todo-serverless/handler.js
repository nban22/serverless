'use strict';

module.exports.hello = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Go Serverless v1.0! Your function executed successfully!',
        input: event,
      },
      null,
      2
    ),
  };
};

//AKIAZ24ISROYJPMKUG7F
//b7zSUwVKrXYIikqAsyd4fXbYWOOVFB9IjyzStCOS