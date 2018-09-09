var types = require("./types.js")
var exports = module.exports = {};

var execute = function(accessory,characteristic,value){ console.log("executed accessory: " + accessory + ", and characteristic: " + characteristic + ", with value: " +  value + "."); }

var status = 0;

exports.accessory = {
  displayName: "Switch",
  username: "CC:22:3D:EE:5E:FA",
  pincode: "031-45-154",
  services: [{
    sType: types.ACCESSORY_INFORMATION_STYPE, 
    characteristics: [{
      cType: types.NAME_CTYPE, 
      onUpdate: null,
      perms: ["pr"],
      format: "string",
      initialValue: "Switch",
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "Name of the accessory",
      designedMaxLength: 255    
    },{
      cType: types.MANUFACTURER_CTYPE, 
      onUpdate: null,
      perms: ["pr"],
      format: "string",
      initialValue: "HomeMade",
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "Manufacturer",
      designedMaxLength: 255    
    },{
      cType: types.MODEL_CTYPE,
      onUpdate: null,
      perms: ["pr"],
      format: "string",
      initialValue: "Initializer",
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "Model",
      designedMaxLength: 255    
    },{
      cType: types.SERIAL_NUMBER_CTYPE, 
      onUpdate: null,
      perms: ["pr"],
      format: "string",
      initialValue: "POTADOS100",
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "SN",
      designedMaxLength: 255    
    },{
      cType: types.IDENTIFY_CTYPE, 
      onUpdate: null,
      perms: ["pw"],
      format: "bool",
      initialValue: false,
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "Identify Accessory",
      designedMaxLength: 1    
    }]
  },{
    sType: types.SWITCH_STYPE, 
    characteristics: [{
      cType: types.NAME_CTYPE,
      onUpdate: null,
      perms: ["pr"],
      format: "string",
      initialValue: "MacBook",
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "Name of service",
      designedMaxLength: 255   
    },{
      cType: types.POWER_STATE_CTYPE,
      onUpdate: function(value) 
      {
		if (value) {
		var exec = require('child_process').exec;

		    if (status == 0) {
			exec("sudo -u pi /home/pi/Applications/macwake");
		    }

		    if (status == 1) {
			exec("sudo -u pi /home/pi/Applications/macsleep");
		    }

		    else {
		    }

		} else {
		var exec = require('child_process').exec;
                exec('su - pi -c "/home/pi/Applications/macsleep"');
		}

     },
      perms: ["pw","pr","ev"],
      format: "bool",
      initialValue: false,
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "Change the power state of the switch",
      designedMaxLength: 1    

    },{
	cType: types.AUDIO_FEEDBACK_CTYPE,
      onUpdate: function(value)
      {
                if (value) {
		status = 1;
                } else {
		status = 0;
                }

     },
      perms: ["pw","pr","ev"],
      format: "bool",
      initialValue: false,
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "Toggle Audio",
      designedMaxLength: 1



    }]
  }]
}
