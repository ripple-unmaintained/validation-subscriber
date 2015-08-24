import {CronJob} from 'cron'
import request from 'superagent'
import WebSocket from 'ws'

const PEER_PORT_REGEX = /51235/g
const WS_PORT = '51233'

export default class ValidationSubscriber {
  constructor() {
    if (!process.env.PEER_API_URL) {
      throw new Error('PEER_API_URL required')
    } else if (!process.env.VALIDATOR_REGISTRY_API_URL) {
      throw new Error('VALIDATOR_REGISTRY_API_URL required')
    }
    this.peerApiUrl = process.env.PEER_API_URL
    this.validatorRegistryApiUrl = process.env.VALIDATOR_REGISTRY_API_URL
    this.authUsername = process.env.VALIDATOR_REGISTRY_API_AUTH_USER || ''
    this.authPassword = process.env.VALIDATOR_REGISTRY_API_AUTH_PASS || ''
    this.connections = {}
  }

  async getRippleds() {
    const response = await request.get(this.peerApiUrl)
    return response.body
  }

  submitValidation(validation, reporterPublicKey) {
    let self=this
    return new Promise((resolve, reject) => {
      request
      .post(self.validatorRegistryApiUrl)
      .auth(self.authUsername, self.authPassword)
      .send({
        validation_public_key: validation.validation_public_key,
        ledger_hash: validation.ledger_hash,
        signature: validation.signature,
        reporter_public_key: reporterPublicKey
      })
      .end((err, res) => {
        if (err) {
          console.log('HTTP Error', err.message)
          reject(err)
        } else {
          console.log('Submitted validation to validator registry api:', JSON.stringify(validation))
          resolve()
        }
      })
    })
  }

  async subscribeToRippleds(rippleds) {
    let self = this

    // Subscribe to validation websocket subscriptions from rippleds
    for (let rippled of rippleds) {
      if (!rippled.ipp) continue;

      const ip = 'ws://'+rippled.ipp.replace(PEER_PORT_REGEX, WS_PORT)

      // Skip addresses that are already connected
      if (self.connections.ip) continue;

      let ws = new WebSocket(ip);

      self.connections[ip] = {
        public_key: rippled.public_key,
        ws: ws
      }

      ws.on('error', function(error){
        console.error(this.url, error)
        self.connections[this.url].ws.close()
        delete self.connections[this.url]
      })

      ws.on('open', function () {
        self.connections[this.url].ws.send(JSON.stringify({
          "id": 1,
          "command": "subscribe",
          "streams": [
            "validations"
          ]
        }))
      })

      ws.on('message', function(dataString, flags) {
        const data = JSON.parse(dataString)
        if (data.type==='validationReceived') {
          self.submitValidation(data, self.connections[this.url].public_key)
        }
      })
    }

    return self.connections
  }

  async start() {
    try {      

      // Subscribe to rippleds
      const rippleds = await this.getRippleds()
      await this.subscribeToRippleds(rippleds)
      console.log('Subscribed to rippled validation streams')

      // Subscribe to new rippled connections hourly
      const job = new CronJob('0 0 * * * *', async function() {
        try {
          const rippleds = await this.getRippleds()
          await this.subscribeToRippleds(rippleds)
          console.log('Subscribed to rippled validation streams')
        } catch (error) {
          console.error('Error with validation subscription task', error)
        }
      }, null, true)
      console.log('Started validation subscriber')
    } catch (error) {
      console.error('Error starting validation subscriber:', error)
    }
  }

  async stop() {
    try {
      // Delete all websocket connections
      _.forEachRight(this.connections, (connection) => {
        connection.ws.close()
      })
      this.connections={}
    } catch (error) {
      console.error('Error stopping validation subscription service:', error)
    }
  }
}
