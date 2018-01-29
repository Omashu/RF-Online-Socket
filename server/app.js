import Promise from 'bluebird'
import config from 'config'
import logger from './utils/logger'
import WebSocket from 'ws'
import loop from './loop'
import { LoopEmitter } from './events';
import serverState from './reps/serverState'

logger.info(`=====INIT=====`)
logger.info(`WebSocket server listen on`, config.get("server.port"))

const wss = new WebSocket.Server({
  port: config.get("server.port")
});

function noop() {}

function heartbeat() {
  this.isAlive = true;
}

function boardcast(data) {
  const stringify = JSON.stringify(data)

  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(stringify)
      } catch (e) {
        logger.error(e)
      }
    }
  })
}

wss.on('connection', function connection(ws, req) {
  const ip = req.headers['x-forwarded-for']
    || req.connection.remoteAddress;

  ws.isAlive = true;
  ws.on('pong', heartbeat);

  logger.debug('New connection from', ip)

  try {
    ws.send(JSON.stringify(["serverState.updated", serverState.current()]))
  } catch (e) {
    logger.error(e)
  }
});

wss.on('error', err => {
  logger.fatal(err)
});

const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false)
      return ws.terminate();

    ws.isAlive = false;
    ws.ping(noop);
  });
}, 30000);


loop.listen()

LoopEmitter.on("serverState.updated", (state) => {
  boardcast(["serverState.updated", state])
})