const res = require('response')
const WebSocket = require('web-socket-server')

exports.handler = async (event) => {
  const { client, action, data } = JSON.parse(event.body)
  try {
    const socket = await WebSocket(event)
    switch (action) {
      case 'call':
        return await socket.emitTo(client, action, data)
      case 'call-accept':
        return await socket.emitTo(client, action, data)
      case 'call-decline':
        return await socket.emitTo(client, action, data)
      case 'get-users':
        const { Items } = await socket.db('scan', { TableName: process.env.TABLE_NAME })
        return res.send({ action: `${action}call_back`, data: { ok: true, users: Items } })
    }
    throw new Error('unknown action')
  } catch (error) {
    console.log(error)
    return res.status(500).send({ action: `${action}call_back`, data: { ok: false, message: error.message } })
  }
}