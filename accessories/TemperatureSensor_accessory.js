var Accessory = require('../').Accessory
var Service = require('../').Service
var Characteristic = require('../').Characteristic
var uuid = require('../').uuid
var fs = require('fs')

var Sensor = {
  name: "Server CPU",
  pincode: "031-45-154",
  username: "FA:3C:ED:5A:1A:1A",
  manufacturer: "Potados house",
  model: "v2.0",
  serialNumber: "POTADOS99TMPSENSOR",

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
  },

  identify: function() {
    if (this.outputLogs) console.log("Identify the '%s'", this.name)
  }
}

var sensorUUID = uuid.generate('hap-nodejs:accessories:temperature-sensor')
var sensorAccessory = exports.accessory = new Accessory('Temperature Sensor', sensorUUID)

sensorAccessory.username = Sensor.name
sensorAccessory.pincode = Sensor.pincode

sensorAccessory
.getService(Service.AccessoryInformation)
.setCharacteristic(Characteristic.Manufacturer, Sensor.manufacturer)
.setCharacteristic(Characteristic.Model, Sensor.model)
.setCharacteristic(Characteristic.SerialNumber, Sensor.serialNumber)

sensorAccessory
.on('identify', function(paired, callback) {
  sensorAccessory.identify()

  callback()
})

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
