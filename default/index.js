const res = require('response')
const WebSocket = require('web-socket-server')

exports.handler = async (event) => {
  console.log(event)
  const { action, data } = JSON.parse(event.body)
  try {
    const socket = await WebSocket(event)
    switch (action) {
      case 'get-users':
        const { Items } = await socket.db('scan', { TableName: process.env.TABLE_NAME })
        return res.send({ action: data.call_back, data: { ok: true, users: Items } })
      default:
        const client = event.requestContext.connectionId
        await socket.emitTo(data.client, action, { ...data, client })
    }
  } catch (error) {
    console.log(error)
    return res.status(500).send(error.message)
  }
}