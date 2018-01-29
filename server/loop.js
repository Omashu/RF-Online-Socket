import net from 'net'
import config from 'config'
import Promise from 'bluebird'
import fs from 'fs'
import ini from 'ini'
import _ from 'lodash'

import serverState from './reps/serverState'
import logger from './utils/logger'

export default new (function() {
  let loginSocket;
  let serverSocket;

  const createLoginSocket = () => {
    serverState.updateLoginPending(true)

    loginSocket = new net.Socket();

    loginSocket.connect(config.get("server.login.port"),
      config.get("server.login.host"), () => {
        serverState.updateLoginPending(false)
        serverState.updateLoginStatus(true)
      })

    loginSocket.on("error", (err) => {
      serverState.updateLoginErrorCode(err.code)
    })

    loginSocket.on("end", () => {
      serverState.updateLoginPending(false)
      serverState.updateLoginErrorCode(null)
      serverState.updateLoginStatus(false)
    })

    loginSocket.on("close", (hadError) => {
      if (!hadError)
        serverState.updateLoginErrorCode(null)

      serverState.updateLoginPending(false)
      serverState.updateLoginStatus(false)

      setTimeout(createLoginSocket, 15000)
    })
  }

  const createServerSocket = () => {
    serverState.updateServerPending(true)

    serverSocket = new net.Socket();

    serverSocket.connect(config.get("server.server.port"),
      config.get("server.server.host"), () => {
        serverState.updateServerPending(false)
        serverState.updateServerStatus(true)
      })

    serverSocket.on("error", (err) => {
      serverState.updateServerErrorCode(err.code)
    })

    serverSocket.on("end", () => {
      serverState.updateServerPending(false)
      serverState.updateServerErrorCode(null)
      serverState.updateServerStatus(false)
    })

    serverSocket.on("close", (hadError) => {
      if (!hadError)
        serverState.updateServerErrorCode(null)

      serverState.updateServerPending(false)
      serverState.updateServerStatus(false)

      setTimeout(createServerSocket, 15000)
    })
  }

  const createDisplay = () => {
    (new Promise((resolve, reject) => {
      fs.readFile(config.get('server.server.displayPath'), (err, buf) => {
        if (err)
          return reject(err)

        return resolve(buf.toString())
      });
    }))
    .then(content => {
      const state = ini.parse(content)

      const a = parseInt(state.USER.A_Num, 10)
      const b = parseInt(state.USER.B_Num, 10)
      const c = parseInt(state.USER.C_Num, 10)
      const total = a + b + c
      const map = {}

      _.forEach(state.MAP, (value, key) => {
        map[key] = parseInt(value, 10)
      });

      return { a, b, c, total, map }
    })
    .then(results => {
      serverState.updatePlayers(results)
      setTimeout(createDisplay, 15000)
      return results
    })
    .catch(err => {
      if (err.code !== "EBUSY")
        logger.error(err)

      setTimeout(createDisplay, 15000)
    })
  }

  this.listen = () => {
    // create connection to login server
    createLoginSocket()

    // create connection to game server
    createServerSocket()

    // create server display listener
    createDisplay()
  }

  return this;
});