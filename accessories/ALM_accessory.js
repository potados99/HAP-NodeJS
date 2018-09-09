var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;
var exec = require('child_process').exec

var AlarmController = {
  name: "Alarm",
  pincode: "031-45-154",
  username: "FA:3C:ED:5A:1A:1A",
  manufacturer: "Potados house",
  model: "v2.0",
  serialNumber: "POTADOS99ALM",

  power: false,
  outputLogs: false,

  setPower: function(status) {
    if (this.outputLogs) console.log("Turning the '%s' %s", this.name, status ? "on" : "off")

    var param = (status) ? "ON" : "OFF"
    exec("control ALM PWR " + param)

    this.power = status
  },

  getPower: function() {
    if (this.outputLogs) console.log("'%s' is %s.", this.name, this.power ? "on" : "off")

    return this.power
  },

  identify: function() {
    console.log("Identify the alarm.");
  }
}

var alarmUUID = uuid.generate('hap-nodejs:accessories:Switch');
var alarmAccessory = exports.accessory = new Accessory('Switch', alarmUUID);

alarmAccessory.username = AlarmController.name;
alarmAccessory.pincode = AlarmController.pincode;

alarmAccessory
.getService(Service.AccessoryInformation)
.setCharacteristic(Characteristic.Manufacturer, AlarmController.manufacturer)
.setCharacteristic(Characteristic.Model, AlarmController.model)
.setCharacteristic(Characteristic.SerialNumber, AlarmController.serialNumber)

alarmAccessory
.on('identify', function(paired, callback) {
  AlarmController.identify();

  callback();
});

alarmAccessory
.addService(Service.Switch, AlarmController.name)
.getCharacteristic(Characteristic.On)
.on('set', function(value, callback) {
  AlarmController.setPower(value);

  callback();
})
.on('get', function(theCallback) {
  var callback = function (error, stdout, stderr) {
    if (AlarmController.outputLogs) console.log("Getting power from ALM: ")
    if (AlarmController.outputLogs) console.log(stdout)

    if (stdout && stdout.includes("ON")) {
      AlarmController.power = true
    }
    else if (stdout && stdout.includes("OFF")) {
      AlarmController.power = false
    }
    else {
      AlarmController.power = false
    }

    theCallback(null, AlarmController.getPower())
  }

  exec("control ALM GET PWR", callback)
});
