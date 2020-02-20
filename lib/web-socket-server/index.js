const db = require('db')
const AWS = require('aws-sdk')
const res = require('response')

module.exports = async function (event) {
    const { domainName, stage, eventType, connectionId } = event.requestContext
    const clientName = event.queryStringParameters && event.queryStringParameters.name
    const apiGatewayManagementApi = new AWS.ApiGatewayManagementApi({ apiVersion: '2018-11-29', endpoint: `${domainName}/${stage}` })

    if (eventType === 'CONNECT') {
        if (clientName) {
            await db('put', { TableName: process.env.TABLE_NAME, Item: { socket_id: connectionId, name: clientName } })
            // const users = await db('scan', { TableName: process.env.TABLE_NAME })
            // await apiGatewayManagementApi.postToConnection({ ConnectionId: connectionId, Data: JSON.stringify(users) }).promise()
        }
        else {
            throw new Error('name is required.')
        }
    }
    if (eventType === 'DISCONNECT') {
        await db('delete', { TableName: process.env.TABLE_NAME, Key: { socket_id: connectionId } })
    }

    const emitTo = async function (client, action, args) {
        const Data = JSON.stringify({ action, data: { ...args, from: connectionId } })
        try {
            await apiGatewayManagementApi.postToConnection({ ConnectionId: client, Data }).promise()
        } catch (error) {
            if (error.statusCode === 410) {
                throw new Error('user does not exist.')
            } else {
                throw new Error(JSON.stringify(error))
            }
        }
    }

    const emit = async function (action, args) {
        const connectionData = await db('scan', { TableName: process.env.TABLE_NAME })
        const postCalls = connectionData.Items.map(async ({ socket_id }) => {
            if (socket_id !== connectionId) {
                try {
                    const Data = JSON.stringify({ action, data: { ...args, from: connectionId } })
                    await apiGatewayManagementApi.postToConnection({ ConnectionId: socket_id, Data }).promise()
                } catch (e) {
                    if (e.statusCode === 410) {
                        return res.send({ action: `${action}call_back`, data: { ok: false, message: `user not found: ${socket_id}` } })
                    } else {
                        return res.send({ action: `${action}call_back`, data: { ok: false, message: error } })
                    }
                }
            }
        })

        await Promise.all(postCalls)
        return res.send({ action: `${action}call_back`, data: { ok: true, message: 'message send to' } })
    }

    return { clientName, connectionId, emitTo, emit, db, connections: apiGatewayManagementApi }
}