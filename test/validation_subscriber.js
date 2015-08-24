import _ from 'lodash'
import assert from 'assert'
import {expect} from 'chai'
import ValidationSubscriber from '../src/validation_subscriber'

describe('ValidationSubscriber', () => {

  describe('getRippleds', () => {

    it('should return a list of rippled nodes', async() => {

      let subscriber = new ValidationSubscriber()
      const rippleds = await subscriber.getRippleds()
      expect(rippleds).to.be.instanceof(Array)
      expect(rippleds[0].version).to.exist
      expect(rippleds[0].public_key).to.exist
    })
  })

  describe('subscribeToRippleds', () => {

    it('should open websocket connections to rippleds', async(done) => {

      const rippleds = [{
        ipp: '72.251.233.165:51235',
        version: 'rippled-0.29.0',
        public_key: 'n9M77Uc9CSaSFZqt5V7sxPR4kFwbha7hwUFBD5v5kZt2SQjBeoDs'
      }]
      let subscriber = new ValidationSubscriber()
      await subscriber.subscribeToRippleds(rippleds)
      // Wait for subscription to start
      setTimeout(() => {
        expect(subscriber.connections).to.be.an('object')
        expect(_.size(subscriber.connections)).to.equal(1)
        _.forEach(subscriber.connections, function(connection, ip) {
          expect(connection.public_key).to.equal(rippleds[0].public_key)
          expect(connection.ws).to.exist
        });
        done()
      }, 1000)
    })
  })

  describe('submitValidation', () => {

    it('should accept a validation and reporter public key', async(done) => {
      const validation = {
        "type": "validationReceived",
        "ledger_hash": "7F806A418B5DC072DCB79121C4588B712C5A208BDBFA9D21008BD8A6C6E4F5C2",
        "signature": "30440220670720FB4FE058688B6DB3AD448A749DCC6803C8905AF46C9791354F9B12D4DB022068A04344655EEE555D61F5C207FD16D9F16305B9C4055E54DDC28813A3306A9A",
        "validation_public_key": "n9LYyd8eUVd54NQQWPAJRFPM1bghJjaf1rkdji2haF4zVjeAPjT2"
      }
      const reporterPublicKey = 'n9M77Uc9CSaSFZqt5V7sxPR4kFwbha7hwUFBD5v5kZt2SQjBeoDs'
      let subscriber = new ValidationSubscriber()
      try {
        await subscriber.submitValidation(validation, reporterPublicKey)
        done()
      } catch (err) {
        console.log(err)
      }
    })
  })
})
