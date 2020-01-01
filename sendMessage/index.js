const db = require('/opt/db')
const res = require('/opt/res')()
const AWS = require('aws-sdk')

exports.handler = async (event) => {
  try {
    const postData = JSON.parse(event.body).data
    const connectionData = await db('scan', { TableName: process.env.TABLE_NAME })
    const apiGatewayManagementApi = new AWS.ApiGatewayManagementApi({
      apiVersion: '2018-11-29',
      endpoint: event.requestContext.domainName + '/' + event.requestContext.stage
    })

    const postCalls = connectionData.Items.map(async ({ connectionId }) => {
      try {
        await apiGatewayManagementApi.postToConnection({ ConnectionId: connectionId, Data: postData }).promise()
      } catch (e) {
        if (e.statusCode === 410) {
          console.log(`Found stale connection, deleting ${connectionId}`);
          await db('delete', { TableName: process.env.TABLE_NAME, Key: { connectionId } })
        } else {
          throw e
        }
      }
    })

    await Promise.all(postCalls)
    return res.send("Data send")
  } catch (error) {
    console.log(error)
    return res.status(500).send(`Failed to send data: ${{ message: error.message, stack: error.stack }}`)
  }
}