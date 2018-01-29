import _ from 'lodash'
import { LoopEmitter } from '../events';

let serverState = {
  loginPending: false,
  loginStatus: false,
  loginErrorCode: null,

  serverPending: false,
  serverStatus: false,
  serverErrorCode: null,

  players: {
    a: 0,
    b: 0,
    c: 0,
    total: 0,
    map : {}
  }
}

export const update = (values) => {
  serverState = {...serverState, ...values}
  LoopEmitter.emit("serverState.updated", {...values})
}

export const updateLoginPending = (value) => {
  update({loginPending: !!value})
}

export const updateLoginStatus = (value) => {
  update({loginStatus: !!value})
}

export const updateLoginErrorCode = (value) => {
  update({loginErrorCode: value})
}




export const updateServerPending = (value) => {
  update({serverPending: !!value})
}

export const updateServerStatus = (value) => {
  update({serverStatus: !!value})
}

export const updateServerErrorCode = (value) => {
  update({serverErrorCode: value})
}




export const updatePlayers = (value) => {
  update({players: {...value}})
}

export default {
  update,
  updatePlayers,
  updateServerStatus,
  updateLoginStatus,
  updateServerPending,
  updateLoginPending,
  updateServerErrorCode,
  updateLoginErrorCode
}