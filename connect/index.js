const res = require('response')
const WebSocket = require('web-socket-server')

exports.handler = async (event) => {
  try {
    const socket = await WebSocket(event)
    return await socket.emit('user-connected', { name: socket.clientName })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ ok: false, message: error.message })
  }
}