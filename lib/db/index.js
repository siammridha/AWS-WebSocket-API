var AWS = require("aws-sdk");
AWS.config.update({ region: process.env.AWS_REGION })

module.exports = (action, params) => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' })
  return dynamoDb[action](params).promise()
}
