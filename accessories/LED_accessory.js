var Accessory = require('../').Accessory
var Service = require('../').Service
var Characteristic = require('../').Characteristic
var uuid = require('../').uuid
var exec = require('child_process').exec

var LightController = {
  name: "Illuminator",
  pincode: "031-45-154",
  username: "FA:3C:ED:5A:1A:1A",
  manufacturer: "Potados house",
  model: "v2.0",
  serialNumber: "POTADOS99LED",

  power: false,
  brightness: 100,
  outputLogs: false,

  setPower: function(status) {
    if (this.outputLogs) console.log("Turning the '%s' %s", this.name, status ? "on" : "off")

    var param;
    if (this.brightness == 100) {
      param = (status) ? "IN" : "OUT"
      exec("control LED FAD " + param)
    }
    else {
      param = (status) ? "ON" : "OFF"
      exec("control LED PWR " + param)
    }

    this.power = status
  },

  getPower: function() {
    if (this.outputLogs) console.log("'%s' is %s.", this.name, this.power ? "on" : "off")

    return this.power
  },

  setBrightness: function(brightness) {
    if (this.outputLogs) console.log("Setting '%s' brightness to %s", this.name, brightness)

    exec("control LED BRT " + brightness)

    this.brightness = brightness
  },

  getBrightness: function() {
    if (this.outputLogs) console.log("'%s' brightness is %s", this.name, this.brightness)

    return this.brightness
  },

  identify: function() { //identify the accessory
    if (this.outputLogs) console.log("Identify the '%s'", this.name)

    exec("control LED RPD 0.2")
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
    if (LightController.outputLogs) console.log("Getting power from LED: ")
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

  exec("control LED GET PWR", callback)
})

lightAccessory
.getService(Service.Lightbulb)
.addCharacteristic(Characteristic.Brightness)
.on('set', function(value, callback) {
  LightController.setBrightness(value)

  callback()
})
.on('get', function(theCallback) {
  var callback = function (error, stdout, stderr) {
    if (LightController.outputLogs) console.log("Getting brightness from LED: ")
    if (LightController.outputLogs) console.log(stdout.trim() * 1)

    if (stdout) {
      LightController.brightness = stdout.trim() * 1
    }
    else {
      LightController.brightness = 100
    }

    theCallback(null, LightController.getBrightness())
  }

  exec("control LED GET BRT", callback)
})
