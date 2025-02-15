//
// Store and API for Websocket payload
//

import { writable } from 'svelte/store'
import { genRequestId, getCookie } from '/src/lib/scripts/session.js'

export const socketInfo = writable({
  "activity": {},
  "metadata": {
    "address": "",
    "connected": false,
  },
  "urbits": {},
  "updates": {
    "linux": {
      "update": "updated",
      "upgrade": 0,
      "new": 0,
      "remove": 0,
      "ignore": 0
    },
    "binary": {
      "update": "updated",
      "auto": true
    }
  },
  "system": {
    "startram": {
      "container": "stopped",
      "autorenew": false,
      "region": "us-east",
      "expiry": 0,
      "endpoint": "api.startram.io",
      "register": "no",
      "restart": "hide",
      "cancel": "hide",
      "advanced": false
    }
  }
})

export const socket = writable()

export const disconnect = ws => {
  if (ws) { ws.close() }
}

export const connect = async (addr, cookie, info) => {
  let ws = new WebSocket(addr)
  ws.addEventListener('open', e => {
    updateMetadata("connected", e.returnValue)
    send(ws, info, cookie, {"category":"ping"}) 
  })
  ws.addEventListener('message', e => updateData(e.data))
  ws.addEventListener('error', e => console.log('error:', e))
  ws.addEventListener('close', e =>setTimeout(()=>{
    console.log("Websocket closed")
    updateMetadata("connected", false)
    console.log("Attempting to reconnect")
    connect(addr, cookie, info)
  }, 1000))
  socket.set(ws)
  updateMetadata("address", addr)
}

export const send = (ws, info, cookie, msg, handleReturn) => {
  if (info.metadata.connected) {
    msg = msg || {}
    let id = genRequestId(16)
    console.log(id + " attempting to send message.." )
    let sid = getCookie(cookie, 'sessionid')
    msg['id'] = id
    msg['sessionid'] = sid
    ws.send(JSON.stringify(msg))
    let category = msg['category']
    let payload = null
    if (category != 'ping') {
      payload = msg['payload']
    }
    return handleActivity(id, category, payload, info)
  } else {
    console.error("Not connected to websocket")
    return false
  }
}

const handleActivity = (id, cat, load, info) => {
  let prefix = id + ":" + cat
  if (cat != "ping") {
    prefix = prefix + ":" + load.module + ":" + load.action
  }

  if (!info.activity.hasOwnProperty(id)) {
    console.log(prefix + " checking broadcast..")
    setTimeout(()=>handleActivity(id, cat, load, info), 500)
  } else {
    removeActivity(id)
    console.log(prefix + " send confirmed")
    return true
  }
}

const removeActivity = id => {
  socketInfo.update(i => {
    delete i.activity[id]
    return i
  })
  return true
}

const updateData = data => {
  data = JSON.parse(data)
  socketInfo.update(i => {
    let obj = deepMerge(i, data)
    return obj
  })
}

const updateMetadata = (item, val) => {
  socketInfo.update(i => {
    if (item == "address") {
      i.metadata.address = val
    }
    if (item == "connected") {
      i.metadata.connected = val
      if (val) {
        console.log("Websocket Successfully Connected")
      } else {
        console.error("Websocket Failed to connect")
      }
    }
    return i
  })
}

const deepMerge = (target, source) => {
  for (const key in source) {
    if (typeof source[key] === 'object' && !Array.isArray(source[key]) && source[key] !== null) {
      if (!target.hasOwnProperty(key)) {
        target[key] = {};
      }
      deepMerge(target[key], source[key])
    } else {
      target[key] = source[key]
    }
  }
  return target
}
