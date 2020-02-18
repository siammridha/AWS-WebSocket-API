const res = require('response')
const WebSocket = require('web-socket-server')

exports.handler = async (event) => {
  const { client, action, data } = JSON.parse(event.body)
  try {
    const socket = await WebSocket(event)
    switch (action) {
      case 'call':
        return socket.emitTo(client, action, data)
      case 'call-accept':
        return socket.emitTo(client, action, data)
      case 'call-decline':
        return socket.emitTo(client, action, data)
    }
  } catch (error) {
    console.log(error)
    return res.status(500).send({ action: `${action}call_back`, data: { ok: false, message: error.message } })
  }
}