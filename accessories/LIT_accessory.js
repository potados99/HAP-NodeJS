var Accessory = require('../').Accessory
var Service = require('../').Service
var Characteristic = require('../').Characteristic
var uuid = require('../').uuid
var exec = require('child_process').exec

var LightController = {
  name: "Ceiling Light",
  pincode: "031-45-154",
  username: "FA:3C:ED:5A:1A:1A",
  manufacturer: "Potados house",
  model: "v2.0",
  serialNumber: "POTADOS99LIT",

  power: false,
  outputLogs: false,

  setPower: function(status) {
    if (this.outputLogs) console.log("Turning the '%s' %s", this.name, status ? "on" : "off")

    var param = (status) ? "ON" : "OFF"
    exec("control LIT PWR " + param)

    this.power = status
  },

  getPower: function() {
    if (this.outputLogs) console.log("'%s' is %s.", this.name, this.power ? "on" : "off")

    return this.power
  },

  identify: function() {
    if (this.outputLogs) console.log("Identify the '%s'", this.name)

    exec("control LIT RPD 0.2")
  }
}

var lightUUID = uuid.generate('hap-nodejs:accessories:light' + LightController.name)
var lightAccessory = exports.accessory = new Accessory(LightController.name, lightUUID)

lightAccessory.username = LightController.username
lightAccessory.pincode = LightController.pincode

lightAccessory
.getService(Service.AccessoryInformation)
.setCharacteristic(Characteristic.Manufacturer, LightController.manufacturer)
.setCharacteristic(Characteristic.Model, LightController.model)
.setCharacteristic(Characteristic.SerialNumber, LightController.serialNumber)

lightAccessory
.on('identify', function(paired, callback) {
  LightController.identify()

  callback()
})

lightAccessory
.addService(Service.Lightbulb, LightController.name)
.getCharacteristic(Characteristic.On)
.on('set', function(value, callback) {
  LightController.setPower(value)

  callback()
})
.on('get', function(theCallback) {
  var callback = function (error, stdout, stderr) {
    if (LightController.outputLogs) console.log("Getting power from LIT: ")
    if (LightController.outputLogs) console.log(stdout)

    if (stdout && stdout.includes("ON")) {
      LightController.power = true
    }
    else if (stdout && stdout.includes("OFF")) {
      LightController.power = false
    }
    else {
      LightController.power = false
    }

    theCallback(null, LightController.getPower())
  }

  exec("control LIT GET PWR", callback)
})
