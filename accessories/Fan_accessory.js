var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;
//var SerialPort = require('serialport');
//var port = new SerialPort('/dev/ttyUSB0', {
//  baudRate: 9600
//});
var exec = require('child_process').exec;

// here's a hardware device that we'll expose to HomeKit
var FanController = {
  power: false,
  rSpeed: 100,

  setPower: function(status) {
    /*
    var _cmd = (status) ? 'FAN ON\n' : 'FAN OFF\n';

    port.write(_cmd, function(err) {
      if (err) {
        return console.log('Error on write: ', err.message);
      }
    });
    */

    var _cmd = (status) ? "FAN ON" : "FAN OFF";
    exec("control " + _cmd);

    this.power = status;
  },

  setSpeed: function(value) {
    console.log("Setting fan rSpeed to %s", value);
    this.rSpeed = value;
    //put your code here to set the fan to a specific value
  },

  identify: function() {
    //put your code here to identify the fan
    console.log("Fan Identified!");
  }

}

// This is the Accessory that we'll return to HAP-NodeJS that represents our fake fan.
var fanAccessory = exports.accessory = new Accessory('Fan', uuid.generate('hap-nodejs:accessories:Fan'));

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
fanAccessory.username = "1A:2B:3C:4D:5E:FF";
fanAccessory.pincode = "031-45-154";

// set some basic properties (these values are arbitrary and setting them is optional)
fanAccessory
.getService(Service.AccessoryInformation)
.setCharacteristic(Characteristic.Manufacturer, "Sample Company")

// listen for the "identify" event for this Accessory
fanAccessory.on('identify', function(paired, callback) {
  FanController.identify();
  callback(); // success
});

// Add the actual Fan Service and listen for change events from iOS.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
fanAccessory
.addService(Service.Fan, "Fan") // services exposed to the user should have "names" like "Fake Light" for us
.getCharacteristic(Characteristic.On)
.on('set', function(value, callback) {
  FanController.setPower(value);
  callback(); // Our fake Fan is synchronous - this value has been successfully set
});

// We want to intercept requests for our current power state so we can query the hardware itself instead of
// allowing HAP-NodeJS to return the cached Characteristic.value.
fanAccessory
.getService(Service.Fan)
.getCharacteristic(Characteristic.On)
.on('get', function(callback) {

  // this event is emitted when you ask Siri directly whether your fan is on or not. you might query
  // the fan hardware itself to find this out, then call the callback. But if you take longer than a
  // few seconds to respond, Siri will give up.

  var err = null; // in case there were any problems

  if (FanController.powerOn) {
    callback(err, true);
  }
  else {
    callback(err, false);
  }
});

// also add an "optional" Characteristic for spped
fanAccessory
.getService(Service.Fan)
.addCharacteristic(Characteristic.RotationSpeed)
.on('get', function(callback) {
  callback(null, FanController.rSpeed);
})
.on('set', function(value, callback) {
  FanController.setSpeed(value);
  callback();
})
