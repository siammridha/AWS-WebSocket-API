const res = require('response')
const WebSocket = require('web-socket-server')

exports.handler = async (event) => {
  try {
    const socket = await WebSocket(event)
    return await socket.emit('user-connected', {})
  } catch (error) {
    console.log(error)
    return res.status(500).send({ action: `${event.requestContext.connectionId}call_back`, data: { ok: false, message: error.message } })
  }
}