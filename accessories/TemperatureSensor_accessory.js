var Accessory = require('../').Accessory
var Service = require('../').Service
var Characteristic = require('../').Characteristic
var uuid = require('../').uuid
var fs = require('fs')

var Sensor = {
  currentTemperature: 0,
  outputLogs: true,

  getTemperature: function() {
    if (this.outputLogs) console.log("Getting the current temperature!")
    return Sensor.currentTemperature
  },

  updateTemperature: function() {
    fs.readFile('/sys/class/thermal/thermal_zone0/temp', 'utf8', function(err, data){
      Sensor.currentTemperature = data * 0.001
    })
  }
}

var sensorUUID = uuid.generate('hap-nodejs:accessories:temperature-sensor')
var sensorAccessory = exports.accessory = new Accessory('Temperature Sensor', sensorUUID)

sensorAccessory.username = "C1:5D:3A:AE:5E:FA"
sensorAccessory.pincode = "031-45-154"

sensorAccessory
  .addService(Service.TemperatureSensor)
  .getCharacteristic(Characteristic.CurrentTemperature)
  .on('get', function(callback) {

    callback(null, Sensor.getTemperature())
  })

setInterval(function() {
  Sensor.updateTemperature()

  sensorAccessory
    .getService(Service.TemperatureSensor)
    .setCharacteristic(Characteristic.CurrentTemperature, Sensor.currentTemperature)

}, 500)
