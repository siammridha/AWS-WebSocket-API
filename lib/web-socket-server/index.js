const db = require('db')
const AWS = require('aws-sdk')
const res = require('response')

module.exports = async function (event) {
    const { domainName, stage, eventType, connectionId } = event.requestContext
    const apiGatewayManagementApi = new AWS.ApiGatewayManagementApi({ apiVersion: '2018-11-29', endpoint: `${domainName}/${stage}` })

    if (eventType === 'CONNECT') {
        await db('put', { TableName: process.env.TABLE_NAME, Item: { Socket_id: connectionId } })
    }
    if (eventType === 'DISCONNECT') {
        await db('delete', { TableName: process.env.TABLE_NAME, Key: { Socket_id: connectionId } })
    }

    const emitTo = async function (client, action, args) {
        const Data = JSON.stringify({ action, data: { ...args, from: connectionId } })
        try {
            await apiGatewayManagementApi.postToConnection({ ConnectionId: client, Data }).promise()
            return res.send({ action: `${action}call_back`, data: { ok: true, message: 'message send to' } })
        } catch (error) {
            if (error.statusCode === 410) {
                return res.send({ action: `${action}call_back`, data: { ok: false, message: 'user not found' } })
            } else {
                return res.send({ action: `${action}call_back`, data: { ok: false, message: error } })
            }
        }
    }

    const emit = async function (action, args) {
        const connectionData = await db('scan', { TableName: process.env.TABLE_NAME })
        const postCalls = connectionData.Items.map(async ({ Socket_id }) => {
            if (Socket_id !== connectionId) {
                try {
                    const Data = JSON.stringify({ action, data: { ...args, from: connectionId } })
                    await apiGatewayManagementApi.postToConnection({ ConnectionId: Socket_id, Data }).promise()
                } catch (e) {
                    if (e.statusCode === 410) {
                        return res.send({ action: `${action}call_back`, data: { ok: false, message: `user not found: ${Socket_id}` } })
                    } else {
                        return res.send({ action: `${action}call_back`, data: { ok: false, message: error } })
                    }
                }
            } else {
                return
            }
        })

        await Promise.all(postCalls)
        return res.send({ action: `${action}call_back`, data: { ok: true, message: 'message send to' } })
    }

    return { emitTo, emit }
}